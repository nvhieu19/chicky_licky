import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ orderCode: string }>;
  searchParams: Promise<{ success?: string }>;
}

const statusMap: Record<string, { label: string; color: string; step: number }> = {
  PENDING: { label: "Chờ xác nhận", color: "bg-amber-100 text-amber-800", step: 1 },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800", step: 2 },
  PREPARING: { label: "Đang chuẩn bị món", color: "bg-purple-100 text-purple-800", step: 3 },
  SHIPPING: { label: "Đang giao hàng", color: "bg-yellow-100 text-yellow-800", step: 4 },
  COMPLETED: { label: "Giao thành công", color: "bg-green-100 text-green-800", step: 5 },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800", step: 0 },
};

export default async function OrderDetailPage({ params, searchParams }: Props) {
  const { orderCode } = await params;
  const { success } = await searchParams;

  let order = null;

  try {
    const dbOrder = await prisma.order.findUnique({
      where: { orderCode },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: "asc" } },
      },
    });

    if (dbOrder) {
      order = {
        ...dbOrder,
        subtotal: Number(dbOrder.subtotal),
        discountAmount: Number(dbOrder.discountAmount),
        shippingFee: Number(dbOrder.shippingFee),
        totalAmount: Number(dbOrder.totalAmount),
        items: dbOrder.items.map((i) => ({
          ...i,
          unitPrice: Number(i.unitPrice),
          subtotal: Number(i.subtotal),
        })),
      };
    }
  } catch (error) {
    console.warn("Database lookup error for order:", error);
  }

  // Fallback demo order for preview
  if (!order) {
    if (orderCode.startsWith("CL")) {
      order = {
        id: "demo",
        orderCode,
        recipientName: "Khách hàng Chicky Licky",
        phone: "0901234567",
        email: "khachhang@gmail.com",
        address: "123 Nguyễn Thị Thập, P. Tân Hưng, Q.7, TP.HCM",
        deliveryType: "DELIVERY",
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        status: "CONFIRMED",
        subtotal: 91000,
        discountAmount: 20000,
        shippingFee: 15000,
        totalAmount: 86000,
        couponCode: "CHICKY20",
        note: "Giao nóng giòn giúp mình nhé.",
        createdAt: new Date(),
        items: [
          {
            id: "i1",
            productName: "Combo Gà Pop Tok 42K",
            productImage: "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=400&q=80",
            unitPrice: 42000,
            quantity: 1,
            subtotal: 42000,
          },
          {
            id: "i2",
            productName: "Gà Rán Pop Sốt Cay Ngọt",
            productImage: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=80",
            unitPrice: 49000,
            quantity: 1,
            subtotal: 49000,
          },
        ],
        statusHistory: [
          {
            id: "sh1",
            newStatus: "PENDING",
            changedBy: "Hệ thống",
            note: "Đơn hàng mới được tạo",
            createdAt: new Date(),
          },
        ],
      };
    } else {
      notFound();
    }
  }

  const currentStatusInfo = statusMap[order.status] || {
    label: order.status,
    color: "bg-gray-100 text-gray-800",
    step: 1,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Hero Badge */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            ĐẶT HÀNG THÀNH CÔNG!
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Cảm ơn bạn đã đặt món tại Chicky Licky. Nhà hàng đang chuẩn bị món ăn nóng hổi cho bạn.
          </p>
          <div className="pt-2">
            <span className="inline-block px-4 py-1.5 bg-white border border-emerald-200 rounded-full font-black text-xs text-emerald-800">
              Mã đơn hàng: {order.orderCode}
            </span>
          </div>
        </div>
      )}

      {/* Order Status & Progress Stepper */}
      <div className="liquid-glass space-y-6 rounded-3xl p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Trạng thái đơn hàng
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3 py-1 rounded-full text-xs font-black ${currentStatusInfo.color}`}>
                {currentStatusInfo.label}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-medium">Tổng thanh toán</span>
            <span className="text-2xl font-black text-primary">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Status Steps */}
        {order.status !== "CANCELLED" && (
          <div className="grid grid-cols-4 gap-2 text-center pt-2">
            {[
              { step: 1, title: "Tiếp nhận" },
              { step: 2, title: "Xác nhận" },
              { step: 3, title: "Chuẩn bị món" },
              { step: 4, title: "Đang giao" },
            ].map((s) => {
              const isPast = currentStatusInfo.step >= s.step;
              return (
                <div key={s.step} className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                      isPast
                        ? "bg-primary text-white shadow-md shadow-red-200"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {s.step}
                  </div>
                  <span
                    className={`text-[11px] font-bold ${
                      isPast ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipient & Order details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recipient Info */}
        <div className="liquid-glass space-y-3 rounded-3xl p-5 sm:p-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            Thông tin người nhận
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <p>
              <strong className="text-gray-900">Người nhận:</strong> {order.recipientName}
            </p>
            <p>
              <strong className="text-gray-900">Điện thoại:</strong> {order.phone}
            </p>
            {order.email && (
              <p>
                <strong className="text-gray-900">Email:</strong> {order.email}
              </p>
            )}
            <p className="flex items-start gap-1">
              <strong className="text-gray-900 shrink-0">Địa chỉ:</strong>
              <span>{order.address}</span>
            </p>
            {order.note && (
              <p className="pt-2 text-gray-500 italic">
                <strong>Ghi chú:</strong> {order.note}
              </p>
            )}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="liquid-glass space-y-3 rounded-3xl p-5 sm:p-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
            Phương thức & Chi tiết thanh toán
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Hình thức:</span>
              <span className="font-bold text-gray-900">
                {order.paymentMethod === "COD" ? "Tiền mặt khi nhận hàng" : "Chuyển khoản"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tạm tính món:</span>
              <span className="font-bold text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-primary font-bold">
                <span>Voucher giảm giá:</span>
                <span>-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="font-bold text-gray-900">
                {order.shippingFee === 0 ? "MIỄN PHÍ" : formatPrice(order.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
              <span>Tổng thanh toán:</span>
              <span className="text-primary text-base">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ordered Products Table */}
      <div className="liquid-glass space-y-4 rounded-3xl p-5 sm:p-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 border-b border-gray-100 pb-2">
          Danh sách món đã đặt ({order.items.length} món)
        </h3>
        <div className="divide-y divide-gray-100">
          {order.items.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-extrabold text-gray-900">{item.productName}</p>
                  <p className="text-gray-500 font-medium">
                    {formatPrice(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-black text-gray-900">{formatPrice(item.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
        <Link
          href="/orders"
          className="text-xs font-bold text-gray-600 hover:text-primary transition-colors"
        >
          ← Xem danh sách đơn hàng của bạn
        </Link>
        <Link
          href="/menu"
          className="px-6 py-3 bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
        >
          <span>Tiếp tục đặt món khác</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
