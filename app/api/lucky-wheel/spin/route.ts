import { randomInt } from "node:crypto";
import { Prisma, LuckyWheelResultType } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  LUCKY_WHEEL_SETTINGS_ID,
  LUCKY_WHEEL_TOTAL_BPS,
  NO_PRIZE_NAME,
  luckyWheelSpinSchema,
  readLuckyWheelBody,
} from "@/lib/lucky-wheel";
import prisma from "@/lib/prisma";

function isPrismaCode(error: unknown, code: string) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === code
  );
}

function serializeDraw(draw: {
  id: string;
  spinNumber: number;
  prizeId: string | null;
  resultType: LuckyWheelResultType;
  prizeNameSnapshot: string;
  prizeImageSnapshot: string | null;
  winRateBpsSnapshot: number;
  createdAt: Date;
}) {
  return {
    id: draw.id,
    spinNumber: draw.spinNumber,
    prizeId: draw.prizeId,
    resultType: draw.resultType,
    prizeName: draw.prizeNameSnapshot,
    prizeImage: draw.prizeImageSnapshot,
    winRateBps: draw.winRateBpsSnapshot,
    createdAt: draw.createdAt,
  };
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ message: "Vui lòng đăng nhập để quay" }, { status: 401 });
  }
  const userId = session.userId;
  const parsedRequest = luckyWheelSpinSchema.safeParse(
    (await readLuckyWheelBody(request)) ?? {}
  );
  if (!parsedRequest.success) {
    return NextResponse.json({ message: "Lượt quay không hợp lệ" }, { status: 400 });
  }
  const requestedSpinNumber = parsedRequest.data.spinNumber;

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, isActive: true },
        });
        if (!user?.isActive) throw new Error("ACCOUNT_INACTIVE");
        if (user.role !== "USER") throw new Error("ACCOUNT_NOT_ALLOWED");

        const previousDraws = await tx.luckyWheelDraw.findMany({
          where: { userId },
          orderBy: { spinNumber: "asc" },
        });
        const firstDraw = previousDraws[0];
        const existingDraw = previousDraws.find(
          (draw) => draw.spinNumber === requestedSpinNumber
        );
        if (existingDraw) {
          const canSpinAgain =
            requestedSpinNumber === 1 &&
            existingDraw.resultType === LuckyWheelResultType.EXTRA_SPIN &&
            !previousDraws.some((draw) => draw.spinNumber === 2);
          return {
            draw: serializeDraw(existingDraw),
            canSpinAgain,
            nextSpinNumber: canSpinAgain ? 2 : null,
            replayed: true,
            wheelSegments: null,
          };
        }
        if (
          requestedSpinNumber === 2 &&
          firstDraw?.resultType !== LuckyWheelResultType.EXTRA_SPIN
        ) {
          throw new Error("NO_SPINS_LEFT");
        }
        const spinNumber = requestedSpinNumber;

        const settings = await tx.luckyWheelSettings.findUnique({
          where: { id: LUCKY_WHEEL_SETTINGS_ID },
          select: { isEnabled: true, defaultClaimInstruction: true },
        });
        if (!settings?.isEnabled) {
          throw new Error("WHEEL_DISABLED");
        }

        const prizes = await tx.luckyWheelPrize.findMany({
          where: {
            isActive: true,
            ...(spinNumber === 1
              ? {
                  OR: [
                    { type: "EXTRA_SPIN" },
                    { type: "ITEM", quantityRemaining: { gt: 0 } },
                  ],
                }
              : { type: "ITEM", quantityRemaining: { gt: 0 } }),
          },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }, { id: "asc" }],
          select: {
            id: true,
            name: true,
            imageUrl: true,
            winRateBps: true,
            type: true,
            claimInstruction: true,
            quantityRemaining: true,
          },
        });
        const totalRate = prizes.reduce((sum, prize) => sum + prize.winRateBps, 0);
        if (totalRate > LUCKY_WHEEL_TOTAL_BPS) {
          throw new Error("INVALID_WHEEL_CONFIGURATION");
        }
        const noPrizeBps = LUCKY_WHEEL_TOTAL_BPS - totalRate;
        const wheelSegments: {
          id: string;
          name: string;
          imageUrl: string | null;
          weight: number;
        }[] = prizes
          .filter((prize) => prize.winRateBps > 0)
          .map((prize) => ({
            id: prize.id,
            name: prize.name,
            imageUrl: prize.imageUrl,
            weight: prize.winRateBps,
          }));
        if (noPrizeBps > 0) {
          wheelSegments.push({
            id: "no-prize",
            name: NO_PRIZE_NAME,
            imageUrl: null,
            weight: noPrizeBps,
          });
        }

        const roll = randomInt(LUCKY_WHEEL_TOTAL_BPS);
        let cumulativeRate = 0;
        const selectedPrize =
          prizes.find((prize) => {
            cumulativeRate += prize.winRateBps;
            return roll < cumulativeRate;
          }) ?? null;

        let wonPrize = selectedPrize;
        if (selectedPrize?.type === "ITEM") {
          const reserved = await tx.luckyWheelPrize.updateMany({
            where: {
              id: selectedPrize.id,
              isActive: true,
              quantityRemaining: { gt: 0 },
            },
            data: { quantityRemaining: { decrement: 1 } },
          });
          if (reserved.count !== 1) wonPrize = null;
        }

        const draw = await tx.luckyWheelDraw.create({
          data: {
            userId: user.id,
            spinNumber,
            prizeId: wonPrize?.id ?? null,
            resultType: wonPrize
              ? wonPrize.type === "EXTRA_SPIN"
                ? LuckyWheelResultType.EXTRA_SPIN
                : LuckyWheelResultType.PRIZE
              : LuckyWheelResultType.NO_PRIZE,
            prizeNameSnapshot: wonPrize?.name ?? NO_PRIZE_NAME,
            prizeImageSnapshot: wonPrize?.imageUrl ?? null,
            winRateBpsSnapshot: wonPrize?.winRateBps ?? 0,
          },
        });

        return {
          draw: {
            ...serializeDraw(draw),
            claimInstruction:
              wonPrize?.type === "ITEM"
                ? wonPrize.claimInstruction || settings.defaultClaimInstruction || ""
                : "",
          },
          canSpinAgain:
            spinNumber === 1 && wonPrize?.type === "EXTRA_SPIN",
          nextSpinNumber:
            spinNumber === 1 && wonPrize?.type === "EXTRA_SPIN" ? 2 : null,
          replayed: false,
          wheelSegments,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "ACCOUNT_INACTIVE") {
      return NextResponse.json({ message: "Tài khoản không hoạt động" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "ACCOUNT_NOT_ALLOWED") {
      return NextResponse.json({ message: "Tài khoản này không thể tham gia quay thưởng" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "WHEEL_DISABLED") {
      return NextResponse.json({ message: "Vòng quay hiện đang tạm đóng" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "NO_SPINS_LEFT") {
      return NextResponse.json({ message: "Tài khoản không còn lượt quay" }, { status: 409 });
    }
    if (error instanceof Error && error.message === "INVALID_WHEEL_CONFIGURATION") {
      console.error("Lucky wheel rates exceed the configured limit");
      return NextResponse.json({ message: "Cấu hình vòng quay không hợp lệ" }, { status: 500 });
    }
    if (isPrismaCode(error, "P2002") || isPrismaCode(error, "P2034")) {
      try {
        const previousDraw = await prisma.luckyWheelDraw.findFirst({
          where: { userId },
          orderBy: { spinNumber: "desc" },
        });
        if (previousDraw) {
          return NextResponse.json({
            draw: serializeDraw(previousDraw),
            replayed: true,
          });
        }
      } catch (lookupError) {
        console.error("Lucky wheel retry result lookup error:", lookupError);
        return NextResponse.json(
          { message: "Không thể xác nhận kết quả lượt quay. Vui lòng tải lại trạng thái." },
          { status: 500 }
        );
      }
    }

    console.error("Lucky wheel spin error:", error);
    return NextResponse.json(
      { message: "Không thể hoàn tất lượt quay. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
