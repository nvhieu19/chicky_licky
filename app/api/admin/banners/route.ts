import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { bannerSchema } from "@/lib/validations";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ banners });
  } catch {
    return NextResponse.json({ message: "Lỗi tải banner" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: parsed.data,
    });

    return NextResponse.json({ message: "Tạo banner thành công", banner }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Lỗi tạo banner" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Thiếu ID" }, { status: 400 });

    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ message: "Xóa banner thành công" });
  } catch {
    return NextResponse.json({ message: "Lỗi xóa banner" }, { status: 500 });
  }
}
