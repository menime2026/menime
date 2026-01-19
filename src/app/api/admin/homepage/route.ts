import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  sectionType: z.string(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.any(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const elements = await prisma.homePageElement.findMany({
      orderBy: {
        order: "asc",
      },
    });
    return NextResponse.json(elements);
  } catch (error) {
    console.error("[HOMEPAGE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sectionType, title, subtitle, content, order, isActive } = createSchema.parse(body);

    const element = await prisma.homePageElement.create({
      data: {
        sectionType,
        title,
        subtitle,
        content,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(element);
  } catch (error) {
    console.error("[HOMEPAGE_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
