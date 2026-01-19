import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const reorderSchema = z.array(
  z.object({
    id: z.string(),
    order: z.number(),
  })
);

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const items = reorderSchema.parse(body);

    // Use a transaction to update all items
    await prisma.$transaction(
      items.map((item) =>
        prisma.homePageElement.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[HOMEPAGE_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
