import React from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Clock, Package } from "lucide-react";
import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UserOrdersPage() {
  const session = await getSession();

  let orders: any[] = [];
  if (session?.userId) {
    try {
      const dbOrders = await prisma.order.findMany({
        where: { userId: session.userId },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
      orders = dbOrders.map((o) => ({
        ...o,
        totalAmount: Number(o.totalAmount),
        itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      }));
    } catch (e) {
      console.warn("Could not query orders:", e);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
          LỊCH SỬ ĐƠN HÀNG
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Theo dõi tiến độ giao hàng và xem lại các đơn hàng đã đặt
        </p>
      </div>

      {!session ? (
        <div className="liquid-glass mx-auto max-w-md space-y-4 rounded-3xl p-8 text-center sm:p-10">
          <div className="w-16 h-16 rounded-full bg-red-50 text-primary flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-gray-900">Vui lòng đăng nhập</h2>
          <p className="text-xs text-gray-500">
            Đăng nhập để xem danh sách và theo dõi tình trạng các đơn hàng của bạn.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="liquid-glass mx-auto max-w-md space-y-4 rounded-3xl p-8 text-center sm:p-10">
          <div className="w-16 h-16 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-black text-gray-900">Bạn chưa có đơn hàng nào</h2>
          <p className="text-xs text-gray-500">
            Hãy khám phá các món ăn ngon tại Chicky Licky và thưởng thức ngay nhé.
          </p>
          <div className="pt-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
            >
              <span>Xem thực đơn ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="liquid-glass liquid-glass-interactive flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-sm text-gray-900">
                    #{order.orderCode}
                  </span>
                  <span className="px-2.5 py-0.5 bg-red-100 text-primary text-[10px] font-black rounded-full uppercase">
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                  <span>{order.itemsCount} sản phẩm</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                <div className="text-left sm:text-right">
                  <span className="text-[11px] text-gray-400 block">Tổng tiền</span>
                  <span className="text-sm font-black text-primary">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>

                <Link
                  href={`/orders/${order.orderCode}`}
                  className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
