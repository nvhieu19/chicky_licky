import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import {
  getAdminErrorStatus,
  LUCKY_WHEEL_TOTAL_BPS,
  luckyWheelPrizeSchema,
  readLuckyWheelBody,
} from "@/lib/lucky-wheel";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    const parsed = luckyWheelPrizeSchema.safeParse(await readLuckyWheelBody(request));
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Dữ liệu phần thưởng không hợp lệ" },
        { status: 400 }
      );
    }

    const prize = await prisma.$transaction(
      async (tx) => {
        const current = await tx.luckyWheelPrize.findUnique({ where: { id } });
        if (!current) throw new Error("PRIZE_NOT_FOUND");
        const [rates, issued] = await Promise.all([
          tx.luckyWheelPrize.aggregate({
            where: { isActive: true, id: { not: id } },
            _sum: { winRateBps: true },
          }),
          parsed.data.type === "ITEM"
            ? tx.luckyWheelDraw.count({
                where: { prizeId: id, resultType: "PRIZE" },
              })
            : Promise.resolve(0),
        ]);
        if (parsed.data.type === "ITEM" && parsed.data.quantityTotal < issued) {
          throw new Error("STOCK_BELOW_AWARDED");
        }
        const prospectiveTotal = (rates._sum.winRateBps ?? 0) +
          (parsed.data.isActive ? parsed.data.winRateBps : 0);
        if (prospectiveTotal > LUCKY_WHEEL_TOTAL_BPS) {
          throw new Error("WIN_RATE_LIMIT");
        }
        return tx.luckyWheelPrize.update({
          where: { id },
          data: {
            ...parsed.data,
            quantityTotal: parsed.data.type === "ITEM" ? parsed.data.quantityTotal : 0,
            quantityRemaining:
              parsed.data.type === "ITEM" ? parsed.data.quantityTotal - issued : 0,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
    return NextResponse.json({ message: "Đã cập nhật phần thưởng", prize });
  } catch (error) {
    const status = getAdminErrorStatus(error);
    if (status) {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status });
    }
    if (error instanceof Error && error.message === "PRIZE_NOT_FOUND") {
      return NextResponse.json({ message: "Không tìm thấy phần thưởng" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "STOCK_BELOW_AWARDED") {
      return NextResponse.json(
        { message: "Số lượng tổng không thể thấp hơn số phần thưởng đã phát" },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "WIN_RATE_LIMIT") {
      return NextResponse.json(
        { message: "Tổng tỷ lệ trúng của phần thưởng đang hoạt động không được vượt quá 100%" },
        { status: 400 }
      );
    }
    console.error("Admin lucky wheel prize update error:", error);
    return NextResponse.json({ message: "Không thể cập nhật phần thưởng" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireAdmin();
    const { id } = await params;
    const result = await prisma.luckyWheelPrize.updateMany({
      where: { id },
      data: { isActive: false },
    });
    if (result.count === 0) {
      return NextResponse.json({ message: "Không tìm thấy phần thưởng" }, { status: 404 });
    }
    return NextResponse.json({ message: "Đã ngừng hoạt động phần thưởng" });
  } catch (error) {
    const status = getAdminErrorStatus(error);
    if (status) {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status });
    }
    console.error("Admin lucky wheel prize deactivation error:", error);
    return NextResponse.json({ message: "Không thể ngừng hoạt động phần thưởng" }, { status: 500 });
  }
}
