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

export async function GET() {
  try {
    await requireAdmin();
    const prizes = await prisma.luckyWheelPrize.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: { _count: { select: { draws: true } } },
    });
    return NextResponse.json({ prizes });
  } catch (error) {
    const status = getAdminErrorStatus(error);
    if (status) {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status });
    }
    console.error("Admin lucky wheel prize list error:", error);
    return NextResponse.json({ message: "Không thể tải danh sách phần thưởng" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const parsed = luckyWheelPrizeSchema.safeParse(await readLuckyWheelBody(request));
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Dữ liệu phần thưởng không hợp lệ" },
        { status: 400 }
      );
    }

    const prize = await prisma.$transaction(
      async (tx) => {
        const rates = await tx.luckyWheelPrize.aggregate({
          where: { isActive: true },
          _sum: { winRateBps: true },
        });
        const prospectiveTotal = (rates._sum.winRateBps ?? 0) +
          (parsed.data.isActive ? parsed.data.winRateBps : 0);
        if (prospectiveTotal > LUCKY_WHEEL_TOTAL_BPS) {
          throw new Error("WIN_RATE_LIMIT");
        }
        return tx.luckyWheelPrize.create({
          data: {
            ...parsed.data,
            quantityRemaining: parsed.data.quantityTotal,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
    return NextResponse.json({ message: "Đã thêm phần thưởng", prize }, { status: 201 });
  } catch (error) {
    const status = getAdminErrorStatus(error);
    if (status) {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status });
    }
    if (error instanceof Error && error.message === "WIN_RATE_LIMIT") {
      return NextResponse.json(
        { message: "Tổng tỷ lệ trúng của phần thưởng đang hoạt động không được vượt quá 100%" },
        { status: 400 }
      );
    }
    console.error("Admin lucky wheel prize creation error:", error);
    return NextResponse.json({ message: "Không thể tạo phần thưởng" }, { status: 500 });
  }
}
