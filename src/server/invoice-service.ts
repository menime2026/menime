import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { InvoiceTemplate } from "@/components/invoice/invoice-template";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mail";

export type InvoiceAddress = {
  fullName?: string;
  streetLine1?: string;
  streetLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phoneNumber?: string;
  [key: string]: unknown;
} | null;

export type InvoiceItem = {
  id: string;
  productName: string;
  productSku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedSize: string | null;
  selectedColor: string | null;
};

export type InvoicePayload = {
  orderId: string;
  orderNumber: string;
  currency: string;
  subtotal: number;
  shippingFee: number | null;
  tax: number | null;
  total: number;
  placedAt: Date;
  fulfilledAt: Date | null;
  customerId: string;
  customerName: string | null;
  customerEmail: string;
  shippingAddress: InvoiceAddress;
  billingAddress: InvoiceAddress;
  items: InvoiceItem[];
};

const formatAmount = (value: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const normalizeAddress = (address?: unknown): InvoiceAddress => {
  if (!address || typeof address !== "object") {
    return null;
  }

  const record = address as Record<string, unknown>;
  const normalized: InvoiceAddress = {};
  for (const key of Object.keys(record)) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      normalized[key] = value.trim();
    }
  }

  return Object.keys(normalized).length > 0 ? normalized : null;
};

export const getInvoicePayload = async (orderId: string): Promise<InvoicePayload | null> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: true,
    },
  });

  if (!order || !order.user?.email) {
    return null;
  }

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    currency: order.currency,
    subtotal: order.subtotal.toNumber(),
    shippingFee: order.shippingFee?.toNumber() ?? null,
    tax: order.tax?.toNumber() ?? null,
    total: order.total.toNumber(),
    placedAt: order.placedAt,
    fulfilledAt: order.fulfilledAt,
    customerId: order.user.id,
    customerName: order.user.name,
    customerEmail: order.user.email,
    shippingAddress: normalizeAddress(order.shippingAddress),
    billingAddress: normalizeAddress(order.billingAddress),
    items: order.items.map((item: any) => ({
      id: item.id,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(),
      lineTotal: item.lineTotal.toNumber(),
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
    })),
  } satisfies InvoicePayload;
};

export const renderInvoicePdf = async (invoice: InvoicePayload): Promise<Buffer> => {
  const stream = await renderToStream(React.createElement(InvoiceTemplate, { invoice }) as any);
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', (err) => reject(err));
  });
};

export const generateInvoiceBuffer = async (orderId: string) => {
  const payload = await getInvoicePayload(orderId);
  if (!payload) {
    return null;
  }

  const buffer = await renderInvoicePdf(payload);
  return { payload, buffer };
};

export const sendInvoiceEmail = async (orderId: string): Promise<boolean> => {
  const result = await generateInvoiceBuffer(orderId);
  if (!result) {
    return false;
  }

  const { payload, buffer } = result;
  const attachmentContent = buffer.toString("base64");

  const greetingName = payload.customerName?.split(" ").shift() ?? "there";
  const subject = `Your Meni-me invoice (${payload.orderNumber})`;
  const html = `
    <p>Hi ${greetingName},</p>
    <p>Thanks for letting us dress your moments. Your order <strong>${payload.orderNumber}</strong> is now complete.</p>
    <p>The attached invoice captures every line item for your records. Keep it handy for returns, exchanges, or expense claims.</p>
    <p>Need something else? Reply to this email and our concierge will jump in.</p>
    <p>— Meni-me Concierge</p>
  `;
  const text = `Hi ${greetingName},\n\nYour order ${payload.orderNumber} is complete. The attached PDF is your invoice for the purchase.\n\n— Meni-me Concierge`;

  await sendEmail({
    to: payload.customerEmail,
    subject,
    html,
    text,
    attachments: [
      {
        filename: `${payload.orderNumber}.pdf`,
        content: attachmentContent,
        type: "application/pdf",
      },
    ],
  });

  return true;
};
