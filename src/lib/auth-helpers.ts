import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Sync user from Clerk to database if they don't exist.
 * This is a fallback for when webhooks aren't configured or fail.
 */
async function syncUserFromClerk(clerkUserId: string) {
  // Check if user exists in database
  const existingUser = await prisma.user.findUnique({
    where: { id: clerkUserId },
  });

  if (existingUser) {
    return existingUser;
  }

  // User doesn't exist in database, fetch from Clerk and create
  console.log("[AUTH_SYNC] User not in database, fetching from Clerk:", clerkUserId);

  const clerkUser = await currentUser();

  if (!clerkUser) {
    console.error("[AUTH_SYNC] Could not fetch Clerk user");
    return null;
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    console.error("[AUTH_SYNC] Clerk user has no email");
    return null;
  }

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User';

  console.log("[AUTH_SYNC] Creating user in database:", { id: clerkUserId, email, name });

  try {
    const newUser = await prisma.user.create({
      data: {
        id: clerkUserId,
        email,
        name,
        image: clerkUser.imageUrl || null,
        emailVerified: clerkUser.emailAddresses[0]?.verification?.status === 'verified',
        role: 'CUSTOMER',
      },
    });

    console.log("[AUTH_SYNC] User created successfully:", newUser.id);
    return newUser;
  } catch (error) {
    console.error("[AUTH_SYNC] Error creating user:", error);

    // Check if it's a unique constraint error (user with email already exists)
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      console.log("[AUTH_SYNC] User with email already exists, returning existing user");
      return existingByEmail;
    }

    return null;
  }
}

export const getUserFromRequest = async () => {
  const { userId } = await auth();

  console.log("[AUTH] Clerk userId:", userId);

  if (!userId) {
    console.log("[AUTH] No Clerk session found");
    return null;
  }

  // Try to find user in database, or sync from Clerk
  const user = await syncUserFromClerk(userId);

  console.log("[AUTH] Database user:", user ? user.id : "NOT FOUND");

  return user;
};

export type AuthenticatedUser = NonNullable<Awaited<ReturnType<typeof getUserFromRequest>>>;

export const getCurrentUser = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  // Try to find user in database, or sync from Clerk
  const user = await syncUserFromClerk(clerkUser.id);

  return user;
};

export const getClerkUser = async () => {
  return await currentUser();
};

export const getAuthUserId = async () => {
  const { userId } = await auth();
  return userId;
};
