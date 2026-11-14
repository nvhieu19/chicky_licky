import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: orders.map((o) => ({
        ...o,
        subtotal: Number(o.subtotal),
        discountAmount: Number(o.discountAmount),
        shippingFee: Number(o.shippingFee),
        totalAmount: Number(o.totalAmount),
        items: o.items.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          subtotal: Number(i.subtotal),
        })),
      })),
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 });
    }
    return NextResponse.json({ message: "Lỗi tải đơn hàng" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const { orderId, newStatus, note } = body;

    if (!orderId || !newStatus) {
      return NextResponse.json({ message: "Thiếu thông tin đơn hàng" }, { status: 400 });
    }

    const currentOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!currentOrder) {
      return NextResponse.json({ message: "Đơn hàng không tồn tại" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const o = await tx.order.update({
        where: { id: orderId },
        data: {
          status: newStatus,
          paymentStatus: newStatus === "COMPLETED" ? "PAID" : currentOrder.paymentStatus,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          oldStatus: currentOrder.status,
          newStatus,
          changedBy: session.name,
          note: note || `Admin cập nhật trạng thái đơn thành ${newStatus}`,
        },
      });

      return o;
    });

    return NextResponse.json({ message: "Cập nhật trạng thái thành công", order: updated });
  } catch (error) {
    console.error("Order update error:", error);
    return NextResponse.json({ message: "Lỗi cập nhật đơn hàng" }, { status: 500 });
  }
}
