import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAdminErrorStatus } from "@/lib/lucky-wheel";
import prisma from "@/lib/prisma";

function parseDate(value: string | null, endOfDay = false): Date | undefined | null {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date;
}

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);
    const pageSize = Math.min(50, Math.max(1, Number.parseInt(params.get("pageSize") ?? "20", 10) || 20));
    const query = params.get("q")?.trim();
    const resultType = params.get("resultType");
    const prizeId = params.get("prizeId");
    const from = parseDate(params.get("from"));
    const to = parseDate(params.get("to"), true);
    if (
      from === null ||
      to === null ||
      (from && to && from > to) ||
      (resultType && !["PRIZE", "NO_PRIZE", "EXTRA_SPIN"].includes(resultType))
    ) {
      return NextResponse.json({ message: "Bộ lọc lịch sử không hợp lệ" }, { status: 400 });
    }

    const where = {
      ...(resultType
        ? { resultType: resultType as "PRIZE" | "NO_PRIZE" | "EXTRA_SPIN" }
        : {}),
      ...(prizeId ? { prizeId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
      ...(query
        ? {
            OR: [
              { user: { name: { contains: query } } },
              { user: { email: { contains: query } } },
              { prizeNameSnapshot: { contains: query } },
            ],
          }
        : {}),
    };

    const [draws, total] = await Promise.all([
      prisma.luckyWheelDraw.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          resultType: true,
          prizeNameSnapshot: true,
          prizeImageSnapshot: true,
          winRateBpsSnapshot: true,
          createdAt: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.luckyWheelDraw.count({ where }),
    ]);
    return NextResponse.json({ draws, total, page, pageSize });
  } catch (error) {
    const status = getAdminErrorStatus(error);
    if (status) {
      return NextResponse.json({ message: "Không có quyền truy cập" }, { status });
    }
    console.error("Admin lucky wheel draw history error:", error);
    return NextResponse.json({ message: "Không thể tải lịch sử quay" }, { status: 500 });
  }
}
