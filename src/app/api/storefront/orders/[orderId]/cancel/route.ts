import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth-helpers";
import { requestOrderCancellation } from "@/server/order-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const userId = await getAuthUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;
    const body = await req.json();
    const { reason, refundAccountDetails } = body;

    if (!reason || !refundAccountDetails) {
      return NextResponse.json(
        { message: "Reason and refund account details are required" },
        { status: 400 }
      );
    }

    const updatedOrder = await requestOrderCancellation(
      userId,
      orderId,
      reason,
      refundAccountDetails
    );

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("[ORDER_CANCEL]", error);
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
