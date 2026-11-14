import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { storeSchema } from "@/lib/validations";

export async function GET() {
  try {
    const stores = await prisma.store.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ stores });
  } catch {
    return NextResponse.json({ message: "Lỗi tải cửa hàng" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = storeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const store = await prisma.store.create({ data: parsed.data });
    return NextResponse.json({ message: "Thêm cửa hàng thành công", store }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Lỗi tạo cửa hàng" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ message: "Thiếu ID" }, { status: 400 });

    const parsed = storeSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json({ message: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const store = await prisma.store.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ message: "Cập nhật cửa hàng thành công", store });
  } catch {
    return NextResponse.json({ message: "Lỗi cập nhật cửa hàng" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Thiếu ID" }, { status: 400 });

    await prisma.store.delete({ where: { id } });
    return NextResponse.json({ message: "Xóa cửa hàng thành công" });
  } catch {
    return NextResponse.json({ message: "Lỗi xóa cửa hàng" }, { status: 500 });
  }
}
