import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import {
  getAdminErrorStatus,
  LUCKY_WHEEL_SETTINGS_ID,
  luckyWheelSettingsSchema,
  readLuckyWheelBody,
} from "@/lib/lucky-wheel";
import prisma from "@/lib/prisma";

const defaultSettings = {
  id: LUCKY_WHEEL_SETTINGS_ID,
  title: "VÒNG QUAY MAY MẮN",
  subtitle: "Mỗi tài khoản có một lượt quay - Có cơ hội nhận thêm lượt",
  noPrizeMessage: "Tiếc quá! Hẹn gặp bạn ở những ưu đãi tiếp theo của Chicky Licky.",
  defaultClaimInstruction: "",
  isEnabled: false,
  showFloatingWidget: false,
};

export async function GET() {
  try {
    await requireAdmin();
    const settings = await prisma.luckyWheelSettings.upsert({
      where: { id: LUCKY_WHEEL_SETTINGS_ID },
      create: defaultSettings,
      update: {},
    });
    const [
      totalDraws,
      prizesAwarded,
      noPrizeDraws,
      remaining,
      activePrizes,
      participants,
    ] = await Promise.all([
      prisma.luckyWheelDraw.count(),
      prisma.luckyWheelDraw.count({
        where: { resultType: { in: ["PRIZE", "EXTRA_SPIN"] } },
      }),
      prisma.luckyWheelDraw.count({ where: { resultType: "NO_PRIZE" } }),
      prisma.luckyWheelPrize.aggregate({
        where: { type: "ITEM" },
        _sum: { quantityRemaining: true },
      }),
      prisma.luckyWheelPrize.count({ where: { isActive: true } }),
      prisma.luckyWheelDraw.count({ where: { spinNumber: 1 } }),
    ]);

    return NextResponse.json({
      settings,
      stats: {
        totalDraws,
        prizesAwarded,
        noPrizeDraws,
        remainingPrizes: remaining._sum.quantityRemaining ?? 0,
        activePrizes,
        participants,
      },
    });
  } catch (error) {
    const status = getAdminErrorStatus(error);
    if (status) {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status });
    }
    console.error("Admin lucky wheel overview error:", error);
    return NextResponse.json({ message: "Không thể tải dữ liệu vòng quay" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const parsed = luckyWheelSettingsSchema.safeParse(await readLuckyWheelBody(request));
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? "Dữ liệu cấu hình không hợp lệ" },
        { status: 400 }
      );
    }
    const settings = await prisma.luckyWheelSettings.upsert({
      where: { id: LUCKY_WHEEL_SETTINGS_ID },
      create: { ...defaultSettings, ...parsed.data },
      update: parsed.data,
    });
    return NextResponse.json({ message: "Đã lưu cấu hình vòng quay", settings });
  } catch (error) {
    const status = getAdminErrorStatus(error);
    if (status) {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status });
    }
    console.error("Admin lucky wheel settings update error:", error);
    return NextResponse.json({ message: "Không thể lưu cấu hình vòng quay" }, { status: 500 });
  }
}
