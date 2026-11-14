import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ message: "Lỗi tải danh mục" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();

    if (!body.slug && body.name) {
      body.slug = slugify(body.name);
    }

    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: parsed.data,
    });

    return NextResponse.json({ message: "Tạo danh mục thành công", category }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Slug danh mục đã tồn tại" }, { status: 400 });
    }
    return NextResponse.json({ message: "Lỗi tạo danh mục" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID danh mục" }, { status: 400 });
    }

    const parsed = categorySchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ message: "Cập nhật danh mục thành công", category });
  } catch {
    return NextResponse.json({ message: "Lỗi cập nhật danh mục" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ message: "Thiếu ID danh mục" }, { status: 400 });
    }

    // Check if category has products
    const count = await prisma.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { message: `Không thể xóa danh mục vì đang có ${count} sản phẩm liên kết` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Xóa danh mục thành công" });
  } catch {
    return NextResponse.json({ message: "Lỗi xóa danh mục" }, { status: 500 });
  }
}
