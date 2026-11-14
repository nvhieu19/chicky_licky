import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const stores = await prisma.store.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ stores });
  } catch (error) {
    console.warn("Could not query stores:", error);
    return NextResponse.json({
      stores: [
        {
          id: "s1",
          name: "Chicky Licky - Nguyễn Thị Thập",
          address: "Số 420 Nguyễn Thị Thập, P. Tân Quy, Quận 7, TP.HCM",
          phone: "028 3775 1234",
        },
        {
          id: "s2",
          name: "Chicky Licky - Hai Bà Trưng",
          address: "Số 182 Hai Bà Trưng, P. Đa Kao, Quận 1, TP.HCM",
          phone: "028 3822 5678",
        },
      ],
    });
  }
}
