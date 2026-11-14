import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json({ message: "Vui lòng nhập mã giảm giá" }, { status: 400 });
  }

  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Mã giảm giá không tồn tại hoặc đã hết hạn" },
        { status: 404 }
      );
    }

    const now = new Date();
    if (!coupon.isActive) {
      return NextResponse.json({ message: "Mã giảm giá này đã ngừng kích hoạt" }, { status: 400 });
    }
    if (now < coupon.startDate || now > coupon.endDate) {
      return NextResponse.json({ message: "Mã giảm giá đã hết hạn sử dụng" }, { status: 400 });
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ message: "Mã giảm giá đã hết lượt sử dụng" }, { status: 400 });
    }

    return NextResponse.json({
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: Number(coupon.discountValue),
        minimumOrderValue: Number(coupon.minimumOrderValue),
        maximumDiscount: coupon.maximumDiscount ? Number(coupon.maximumDiscount) : null,
      },
    });
  } catch (err) {
    console.warn("Coupon lookup database error:", err);
    return NextResponse.json(
      { message: "Lỗi hệ thống khi kiểm tra mã giảm giá" },
      { status: 500 }
    );
  }
}
