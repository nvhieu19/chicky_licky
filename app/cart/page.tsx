"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  CheckCircle2,
  AlertCircle,
  Truck,
  ArrowLeft,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/providers/CartContext";

const FREE_SHIPPING_MIN = 150000;

export default function CartPage() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    appliedCoupon,
    discountAmount,
    shippingFee,
    totalAmount,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Free shipping calculation
  const amountToFreeShip = Math.max(0, FREE_SHIPPING_MIN - subtotal);
  const freeShipProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_MIN) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);

    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(couponCodeInput.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Mã giảm giá không hợp lệ");
      }

      applyCoupon(data.coupon);
      setCouponMessage({ type: "success", text: `Đã áp dụng mã "${data.coupon.code}" thành công!` });
      setCouponCodeInput("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCouponMessage({ type: "error", text: err.message });
      } else {
        setCouponMessage({ type: "error", text: "Mã giảm giá không hợp lệ" });
      }
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center bg-white rounded-3xl p-10 border border-gray-100 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-red-50 text-primary flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Giỏ hàng của bạn đang trống!
          </h2>
          <p className="text-xs text-gray-500 mt-2 mb-8 leading-relaxed">
            Hãy khám phá ngay những món gà rán giòn rụm, burger bò thơm ngon và combo ăn trưa giá cực sốc tại Chicky Licky nhé.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-sm rounded-xl shadow-lg shadow-red-200 transition-all"
          >
            <span>Khám phá thực đơn ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            GIỎ HÀNG CỦA BẠN
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Bạn đang có <span className="font-bold text-gray-800">{items.length} món</span> trong giỏ hàng
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors cursor-pointer"
        >
          Xóa tất cả
        </button>
      </div>

      {/* Free shipping banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-secondary text-gray-900 flex items-center justify-center shrink-0">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            {amountToFreeShip === 0 ? (
              <p className="text-xs font-black text-gray-900">
                Chúc mừng! Đơn hàng của bạn đã đủ điều kiện <span className="text-primary font-black">MIỄN PHÍ GIAO HÀNG</span>.
              </p>
            ) : (
              <p className="text-xs font-bold text-gray-800">
                Mua thêm <span className="text-primary font-black">{formatPrice(amountToFreeShip)}</span> để được{" "}
                <span className="text-gray-900 font-black">Miễn phí giao hàng</span> (Đơn từ 150K).
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full sm:w-44 bg-amber-200/60 rounded-full h-2 overflow-hidden shrink-0">
          <div
            className="bg-primary h-full rounded-full transition-all duration-300"
            style={{ width: `${freeShipProgress}%` }}
          />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Items list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
            {items.map((item) => {
              const currentPrice = item.product.salePrice ?? item.product.price;
              const itemTotal = currentPrice * item.quantity;
              return (
                <div
                  key={item.product.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Image & Title */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        unoptimized={item.product.imageUrl?.startsWith("data:")}
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/menu/${item.product.slug}`}
                        className="text-sm font-extrabold text-gray-900 hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-primary font-black mt-1">
                        {formatPrice(currentPrice)}
                      </p>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
                    {/* Stepper */}
                    <div className="flex items-center border border-gray-200 bg-gray-50 rounded-xl p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white transition-colors cursor-pointer"
                        aria-label="Giảm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-black text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white transition-colors cursor-pointer"
                        aria-label="Tăng"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right min-w-[90px]">
                      <span className="text-sm font-black text-gray-900">
                        {formatPrice(itemTotal)}
                      </span>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Xóa món"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Tiếp tục chọn món khác
            </Link>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
            <h3 className="text-base font-black text-gray-900 border-b border-gray-100 pb-3">
              TÓM TẮT ĐƠN HÀNG
            </h3>

            {/* Coupon Code Section */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Mã giảm giá
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-xs font-black text-primary">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[11px] text-gray-600">
                      (Giảm {appliedCoupon.discountType === "PERCENT" ? `${appliedCoupon.discountValue}%` : formatPrice(appliedCoupon.discountValue)})
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Bỏ mã
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                      placeholder="Nhập mã (VD: CHICKY20)"
                      className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs uppercase font-bold focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading}
                      className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {couponLoading ? "..." : "Áp dụng"}
                    </button>
                  </div>
                  {couponMessage && (
                    <div
                      className={`p-2.5 rounded-xl text-[11px] flex items-center gap-1.5 ${
                        couponMessage.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                    >
                      {couponMessage.type === "success" ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      )}
                      <span>{couponMessage.text}</span>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-gray-100 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-primary font-bold">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Phí giao hàng</span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0 ? (
                    <span className="text-green-600 font-bold">MIỄN PHÍ</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-gray-100 text-base font-black text-gray-900">
                <span>Tổng thanh toán</span>
                <span className="text-2xl text-primary font-black">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="block w-full py-4 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white text-center font-black text-sm rounded-2xl shadow-xl shadow-red-200 transition-all cursor-pointer"
            >
              Tiến hành đặt hàng →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
