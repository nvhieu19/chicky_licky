import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const couponSchema = z.object({
  code: z
    .string()
    .min(2, "Mã coupon phải có ít nhất 2 ký tự")
    .max(32)
    .transform((v) => v.trim().toUpperCase()),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.number().positive("Mức giảm phải lớn hơn 0"),
  minimumOrderValue: z.number().min(0).default(0),
  maximumDiscount: z.number().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  startDate: z.string().min(1, "Chọn ngày bắt đầu"),
  endDate: z.string().min(1, "Chọn ngày kết thúc"),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      coupons: coupons.map((c) => ({
        ...c,
        discountValue: Number(c.discountValue),
        minimumOrderValue: Number(c.minimumOrderValue),
        maximumDiscount: c.maximumDiscount ? Number(c.maximumDiscount) : null,
      })),
    });
  } catch {
    return NextResponse.json({ message: "Lỗi tải danh sách mã giảm giá" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const coupon = await prisma.coupon.create({
      data: {
        code: d.code,
        discountType: d.discountType,
        discountValue: d.discountValue,
        minimumOrderValue: d.minimumOrderValue ?? 0,
        maximumDiscount: d.maximumDiscount ?? null,
        usageLimit: d.usageLimit ?? null,
        startDate: new Date(d.startDate),
        endDate: new Date(d.endDate),
        isActive: d.isActive,
      },
    });

    return NextResponse.json(
      { message: "Tạo mã giảm giá thành công", coupon },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Mã giảm giá này đã tồn tại trong hệ thống" },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "Lỗi tạo mã giảm giá" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ message: "Thiếu ID" }, { status: 400 });

    const parsed = couponSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: d.code,
        discountType: d.discountType,
        discountValue: d.discountValue,
        minimumOrderValue: d.minimumOrderValue ?? 0,
        maximumDiscount: d.maximumDiscount ?? null,
        usageLimit: d.usageLimit ?? null,
        startDate: new Date(d.startDate),
        endDate: new Date(d.endDate),
        isActive: d.isActive,
      },
    });

    return NextResponse.json({ message: "Cập nhật thành công", coupon });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { message: "Mã giảm giá này đã tồn tại" },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: "Lỗi cập nhật mã giảm giá" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Thiếu ID" }, { status: 400 });

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ message: "Xóa thành công" });
  } catch {
    return NextResponse.json({ message: "Lỗi xóa mã giảm giá" }, { status: 500 });
  }
}
