import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();
    const customers = await prisma.user.findMany({
      where: { role: "USER" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json({ message: "Lỗi tải danh sách khách hàng" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const { userId, isActive } = await req.json();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return NextResponse.json({ message: "Cập nhật trạng thái thành công", user: updated });
  } catch {
    return NextResponse.json({ message: "Lỗi cập nhật khách hàng" }, { status: 500 });
  }
}
