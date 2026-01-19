import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  sectionType: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.any().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { sectionType, title, subtitle, content, order, isActive } = updateSchema.parse(body);

    const element = await prisma.homePageElement.update({
      where: {
        id,
      },
      data: {
        sectionType,
        title,
        subtitle,
        content,
        order,
        isActive,
      },
    });

    return NextResponse.json(element);
  } catch (error) {
    console.error("[HOMEPAGE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.homePageElement.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[HOMEPAGE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
