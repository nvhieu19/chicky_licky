import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { promotionSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

function isAuthorizationError(error: unknown) {
  return error instanceof Error && ["UNAUTHORIZED", "FORBIDDEN"].includes(error.message);
}

function authorizationResponse(error: unknown) {
  return isAuthorizationError(error)
    ? NextResponse.json({ message: "Không có quyền truy cập" }, { status: 403 })
    : null;
}

function validationResponse(error: { issues: { message: string }[] }) {
  return NextResponse.json(
    { message: error.issues[0]?.message || "Dữ liệu không hợp lệ" },
    { status: 400 }
  );
}

export async function GET() {
  try {
    await requireAdmin();
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      promotions: promotions.map((p) => ({
        ...p,
        discountValue: Number(p.discountValue),
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
      })),
    });
  } catch (error) {
    const denied = authorizationResponse(error);
    if (denied) return denied;
    console.error("Load promotions error:", error);
    return NextResponse.json({ message: "Lỗi tải khuyến mãi" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    if (!body.slug && body.title) body.slug = slugify(body.title);
    const parsed = promotionSchema.safeParse(body);

    if (!parsed.success) return validationResponse(parsed.error);

    const promo = await prisma.promotion.create({
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    });

    return NextResponse.json({
      message: "Tạo khuyến mãi thành công",
      promotion: { ...promo, discountValue: Number(promo.discountValue) },
    }, { status: 201 });
  } catch (error: unknown) {
    const denied = authorizationResponse(error);
    if (denied) return denied;
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ message: "Slug khuyến mãi đã tồn tại" }, { status: 400 });
    }
    console.error("Create promotion error:", error);
    return NextResponse.json({ message: "Lỗi tạo khuyến mãi" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...promotionData } = body;

    if (typeof id !== "string" || !id) {
      return NextResponse.json({ message: "Thiếu ID khuyến mãi" }, { status: 400 });
    }

    const parsed = promotionSchema.safeParse(promotionData);
    if (!parsed.success) return validationResponse(parsed.error);

    const promotion = await prisma.promotion.update({
      where: { id },
      data: {
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
    });

    return NextResponse.json({
      message: "Cập nhật khuyến mãi thành công",
      promotion: { ...promotion, discountValue: Number(promotion.discountValue) },
    });
  } catch (error: unknown) {
    const denied = authorizationResponse(error);
    if (denied) return denied;
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ message: "Slug khuyến mãi đã tồn tại" }, { status: 400 });
    }
    console.error("Update promotion error:", error);
    return NextResponse.json({ message: "Lỗi cập nhật khuyến mãi" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Thiếu ID khuyến mãi" }, { status: 400 });

    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ message: "Xóa khuyến mãi thành công" });
  } catch (error) {
    const denied = authorizationResponse(error);
    if (denied) return denied;
    console.error("Delete promotion error:", error);
    return NextResponse.json({ message: "Lỗi xóa khuyến mãi" }, { status: 500 });
  }
}
