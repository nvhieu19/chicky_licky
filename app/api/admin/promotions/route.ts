import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { promotionSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

// Typecast prisma as any to prevent stale Prisma client typing issues in editor
const db = prisma as any;

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

function serializePromo(p: any) {
  return {
    ...p,
    discountValue: Number(p.discountValue),
    comboPrice: p.comboPrice != null ? Number(p.comboPrice) : null,
    startDate: p.startDate instanceof Date ? p.startDate.toISOString() : p.startDate,
    endDate: p.endDate instanceof Date ? p.endDate.toISOString() : p.endDate,
    comboItems: (p.comboItems ?? []).map((ci: any) => ({
      ...ci,
      product: ci.product
        ? {
            ...ci.product,
            price: Number(ci.product.price),
            salePrice: ci.product.salePrice != null ? Number(ci.product.salePrice) : null,
          }
        : null,
    })),
  };
}

export async function GET() {
  try {
    await requireAdmin();
    const promotions = await db.promotion.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        comboItems: {
          include: { product: true },
          orderBy: { quantity: "desc" },
        },
      },
    });
    return NextResponse.json({ promotions: promotions.map(serializePromo) });
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

    const { comboItems, comboPrice, ...promoData } = parsed.data;

    const promo = await db.promotion.create({
      data: {
        ...promoData,
        comboPrice: comboPrice ?? null,
        startDate: new Date(promoData.startDate),
        endDate: new Date(promoData.endDate),
        comboItems:
          promoData.discountType === "COMBO" && comboItems && comboItems.length > 0
            ? {
                create: comboItems.map((ci) => ({
                  productId: ci.productId,
                  quantity: ci.quantity,
                })),
              }
            : undefined,
      },
      include: {
        comboItems: { include: { product: true } },
      },
    });

    return NextResponse.json(
      { message: "Tạo khuyến mãi thành công", promotion: serializePromo(promo) },
      { status: 201 }
    );
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

    const { comboItems, comboPrice, ...promoData } = parsed.data;

    // Xoá comboItems cũ nếu có model relation, rồi tạo lại (upsert-safe)
    if (db.promotionComboItem) {
      await db.promotionComboItem.deleteMany({ where: { promotionId: id } });
    }

    const promotion = await db.promotion.update({
      where: { id },
      data: {
        ...promoData,
        comboPrice: comboPrice ?? null,
        startDate: new Date(promoData.startDate),
        endDate: new Date(promoData.endDate),
        comboItems:
          promoData.discountType === "COMBO" && comboItems && comboItems.length > 0
            ? {
                create: comboItems.map((ci) => ({
                  productId: ci.productId,
                  quantity: ci.quantity,
                })),
              }
            : undefined,
      },
      include: {
        comboItems: { include: { product: true } },
      },
    });

    return NextResponse.json({
      message: "Cập nhật khuyến mãi thành công",
      promotion: serializePromo(promotion),
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

    await db.promotion.delete({ where: { id } });
    return NextResponse.json({ message: "Xóa khuyến mãi thành công" });
  } catch (error) {
    const denied = authorizationResponse(error);
    if (denied) return denied;
    console.error("Delete promotion error:", error);
    return NextResponse.json({ message: "Lỗi xóa khuyến mãi" }, { status: 500 });
  }
}
