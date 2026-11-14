import { NextResponse } from "next/server";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy người dùng" }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      points: 150, // Loyalty points demo
      tier: "Thành viên Thân Thiết",
    });
  } catch (error) {
    console.warn("DB user fetch error:", error);
    return NextResponse.json({
      id: session.userId,
      name: session.name,
      email: session.email,
      phone: "0901234567",
      role: session.role,
      points: 120,
      tier: "Thành viên Mới",
      _count: { orders: 1 },
    });
  }
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Vui lòng đăng nhập" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ message: "Không tìm thấy tài khoản" }, { status: 404 });
    }

    const updateData: { name?: string; phone?: string; passwordHash?: string } = {};

    if (name && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (phone && phone.trim().length >= 9) {
      updateData.phone = phone.trim();
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { message: "Vui lòng nhập mật khẩu hiện tại" },
          { status: 400 }
        );
      }
      const isValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { message: "Mật khẩu hiện tại không chính xác" },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { message: "Mật khẩu mới phải có ít nhất 6 ký tự" },
          { status: 400 }
        );
      }
      updateData.passwordHash = await hashPassword(newPassword);
    }

    const updated = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      message: "Cập nhật thông tin thành công!",
      user: updated,
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: error.message || "Lỗi cập nhật hồ sơ" },
      { status: 500 }
    );
  }
}
