import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

export async function POST(req: Request) {
  console.log('[CLERK_WEBHOOK] Received webhook request');

  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('[CLERK_WEBHOOK] Missing CLERK_WEBHOOK_SECRET');
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  console.log('[CLERK_WEBHOOK] Headers:', { svix_id, svix_timestamp, svix_signature: svix_signature ? 'present' : 'missing' });

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('[CLERK_WEBHOOK] Missing svix headers');
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  console.log('[CLERK_WEBHOOK] Payload type:', payload.type);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
    console.log('[CLERK_WEBHOOK] Signature verified successfully');
  } catch (err) {
    console.error('[CLERK_WEBHOOK] Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  const eventType = evt.type;
  console.log('[CLERK_WEBHOOK] Event type:', eventType);

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    const email = email_addresses[0]?.email_address;
    const name = [first_name, last_name].filter(Boolean).join(' ') || 'User';

    console.log('[CLERK_WEBHOOK] Processing user:', { id, email, name, eventType });

    if (!email) {
      console.error('[CLERK_WEBHOOK] No email found in user data');
      return new Response('No email found', { status: 400 });
    }

    try {
      // Use upsert to handle both create and update cases
      const user = await prisma.user.upsert({
        where: { id },
        create: {
          id,
          email,
          name,
          image: image_url || null,
          emailVerified: email_addresses[0]?.verification?.status === 'verified',
          role: 'CUSTOMER',
        },
        update: {
          email,
          name,
          image: image_url || null,
          emailVerified: email_addresses[0]?.verification?.status === 'verified',
        },
      });
      console.log(`[CLERK_WEBHOOK] User upserted successfully: ${user.id}`, { email: user.email });
    } catch (error) {
      console.error('[CLERK_WEBHOOK] Error upserting user:', error);

      // If email unique constraint fails, the user exists with different ID
      // This can happen if user was created before Clerk integration
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        console.log('[CLERK_WEBHOOK] User with email already exists, updating their Clerk ID');
        // We can't easily update the ID, so log this for manual resolution
        console.error(`[CLERK_WEBHOOK] CONFLICT: Email ${email} exists with ID ${existingUser.id}, but Clerk has ID ${id}`);
      }
      return new Response('Error processing user', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (id) {
      console.log('[CLERK_WEBHOOK] Deleting user:', id);
      await prisma.user.delete({
        where: { id },
      }).catch((error) => {
        console.log(`[CLERK_WEBHOOK] User ${id} not found in database, skipping delete`);
      });

      console.log(`[CLERK_WEBHOOK] User deleted: ${id}`);
    }
  }

  console.log('[CLERK_WEBHOOK] Webhook processed successfully');
  return new Response('', { status: 200 });
}
