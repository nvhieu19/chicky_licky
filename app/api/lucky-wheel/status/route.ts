import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  LUCKY_WHEEL_SETTINGS_ID,
  LUCKY_WHEEL_TOTAL_BPS,
  NO_PRIZE_NAME,
} from "@/lib/lucky-wheel";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();
    const [settings, account] = await Promise.all([
      prisma.luckyWheelSettings.findUnique({ where: { id: LUCKY_WHEEL_SETTINGS_ID } }),
      session?.userId
        ? prisma.user.findUnique({
            where: { id: session.userId },
            select: { id: true, role: true, isActive: true },
          })
        : Promise.resolve(null),
    ]);
    const user = account?.isActive ? account : null;

    const draw =
      user?.role === "USER"
        ? await prisma.luckyWheelDraw.findUnique({ where: { userId: user.id } })
        : null;
    const prizes =
      settings?.isEnabled && settings.showFloatingWidget
        ? await prisma.luckyWheelPrize.findMany({
            where: { isActive: true, quantityRemaining: { gt: 0 } },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
              winRateBps: true,
              claimInstruction: true,
            },
          })
        : [];
    const prizeRateTotal = prizes.reduce((sum, prize) => sum + prize.winRateBps, 0);
    if (prizeRateTotal > LUCKY_WHEEL_TOTAL_BPS) {
      throw new Error("Lucky wheel prize rates exceed 100%");
    }
    const claimInstruction =
      draw?.prizeId && user?.role === "USER"
        ? (await prisma.luckyWheelPrize.findUnique({
            where: { id: draw.prizeId },
            select: { claimInstruction: true },
          }))?.claimInstruction
        : null;

    return NextResponse.json({
      enabled: Boolean(settings?.isEnabled),
      showFloatingWidget: Boolean(settings?.isEnabled && settings?.showFloatingWidget),
      settings: settings
        ? {
            title: settings.title,
            subtitle: settings.subtitle,
            noPrizeMessage: settings.noPrizeMessage,
            defaultClaimInstruction: settings.defaultClaimInstruction,
          }
        : null,
      requiresLogin: !user,
      isEligible: user?.role === "USER" && !draw,
      hasDrawn: Boolean(draw),
      draw: draw
        ? {
            id: draw.id,
            prizeId: draw.prizeId,
            resultType: draw.resultType,
            prizeName: draw.prizeNameSnapshot || NO_PRIZE_NAME,
            prizeImage: draw.prizeImageSnapshot,
            winRateBps: draw.winRateBpsSnapshot,
            claimInstruction:
              claimInstruction || settings?.defaultClaimInstruction || "",
            createdAt: draw.createdAt,
          }
        : null,
      prizes,
      noPrizeBps: LUCKY_WHEEL_TOTAL_BPS - prizeRateTotal,
    });
  } catch (error) {
    console.error("Lucky wheel status error:", error);
    return NextResponse.json(
      { message: "Không thể tải trạng thái vòng quay" },
      { status: 500 }
    );
  }
}
