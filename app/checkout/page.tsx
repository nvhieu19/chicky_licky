"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Truck,
  Store as StoreIcon,
  AlertCircle,
  Loader2,
  Tag,
  CreditCard,
  Banknote,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/providers/CartContext";
import { useAuthModal } from "@/components/providers/AuthModalContext";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    appliedCoupon,
    clearCart,
    deliveryType,
    setDeliveryType,
  } = useCart();
  const { currentUser } = useAuthModal();

  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [storeId, setStoreId] = useState("");
  const [note, setNote] = useState("");
  const [includeCutlery, setIncludeCutlery] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANKING">("COD");
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autofill user info if logged in
  useEffect(() => {
    if (currentUser) {
      if (!recipientName) setRecipientName(currentUser.name || "");
      if (!email) setEmail(currentUser.email || "");
      if (!phone) setPhone(currentUser.phone || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Fetch stores list
  useEffect(() => {
    async function loadStores() {
      try {
        const res = await fetch("/api/stores");
        if (res.ok) {
          const data = await res.json();
          if (data.stores?.length > 0) {
            setStores(data.stores);
            setStoreId(data.stores[0].id);
          }
        }
      } catch (err) {
        console.warn("Could not load stores:", err);
      }
    }
    loadStores();
  }, []);

  // Empty cart redirect
  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-bold text-gray-500 mb-4">
          Bạn chưa có món ăn nào trong giỏ hàng để thanh toán.
        </p>
        <Link
          href="/menu"
          className="inline-block px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Chọn món ngay
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!recipientName.trim()) {
      setError("Vui lòng nhập họ và tên người nhận");
      return;
    }
    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    if (deliveryType === "DELIVERY" && !address.trim()) {
      setError("Vui lòng nhập địa chỉ nhận hàng chi tiết");
      return;
    }
    if (!agreeTerms) {
      setError("Vui lòng đồng ý cho phép website thu thập thông tin để phục vụ đơn hàng");
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: deliveryType === "DELIVERY" ? address.trim() : "Nhận tại cửa hàng: " + (stores.find(s => s.id === storeId)?.name || "Chi nhánh Chicky"),
        deliveryType,
        storeId: deliveryType === "PICKUP" ? storeId : undefined,
        note: `${note ? note + ". " : ""}${includeCutlery ? "Có lấy dụng cụ ăn uống nhựa" : "Không lấy dụng cụ ăn uống nhựa"}`,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Đặt hàng không thành công");
      }

      // Order success! Clear cart and redirect
      clearCart();
      router.push(`/orders/${data.order.orderCode}?success=true`);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Progress Step Header (from screenshot 4) */}
      <div className="flex flex-col sm:flex-row items-center justify-between border-b border-gray-100 pb-5 gap-4">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </Link>

        {/* 3 Steps indicator */}
        <div className="flex items-center gap-4 text-xs font-black">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[11px]">
              1
            </span>
            <span>Chọn món</span>
          </div>
          <div className="w-10 h-0.5 bg-primary" />
          <div className="flex items-center gap-2 text-primary">
            <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-[11px] shadow-sm">
              2
            </span>
            <span>Thanh toán</span>
          </div>
          <div className="w-10 h-0.5 bg-gray-200" />
          <div className="flex items-center gap-2 text-gray-400">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-[11px]">
              3
            </span>
            <span>Hoàn tất</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Checkout Form */}
      <form onSubmit={handleSubmitOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Delivery & Items */}
          <div className="lg:col-span-7 space-y-6">
            {/* Delivery Tabs (Screenshot 4) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5">
              <div className="flex bg-gray-100 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setDeliveryType("DELIVERY")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    deliveryType === "DELIVERY"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Truck className="w-4 h-4 text-primary" />
                  GIAO HÀNG
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType("PICKUP")}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    deliveryType === "PICKUP"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <StoreIcon className="w-4 h-4 text-primary" />
                  ĐẾN LẤY
                </button>
              </div>

              {/* Form fields based on delivery type */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Họ và tên người nhận <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Số điện thoại <span className="text-primary">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email nhận hóa đơn (tùy chọn)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-primary"
                  />
                </div>

                {deliveryType === "DELIVERY" ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Địa chỉ giao hàng chi tiết <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                      required
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-primary"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Chọn chi nhánh nhận món <span className="text-primary">*</span>
                    </label>
                    <select
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-primary font-bold"
                    >
                      {stores.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} - {s.address}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Info Card (Screenshot 4) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-sm font-black text-gray-900">Thông tin đơn hàng</h3>
                <Link
                  href="/menu"
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Thêm món
                </Link>
              </div>

              <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
                {items.map((item) => {
                  const currentPrice = item.product.salePrice ?? item.product.price;
                  return (
                    <div
                      key={item.product.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            fill
                            unoptimized={item.product.imageUrl?.startsWith("data:")}
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-gray-500 font-medium">
                            {formatPrice(currentPrice)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-gray-900 shrink-0">
                        {formatPrice(currentPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Preferences, Payment & Summary */}
          <div className="lg:col-span-5 space-y-5">
            {/* Promotion card */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Tag className="w-5 h-5 text-primary" />
                <div>
                  <span className="text-xs font-black text-gray-900 block">Ưu đãi / Mã giảm giá</span>
                  <span className="text-[11px] text-gray-500">
                    {appliedCoupon ? `Đã dùng mã: ${appliedCoupon.code}` : "Chưa áp dụng voucher"}
                  </span>
                </div>
              </div>
              <Link href="/cart" className="text-xs font-bold text-primary hover:underline">
                {appliedCoupon ? "Đổi mã" : "Nhập mã >"}
              </Link>
            </div>

            {/* Note & Plastic Cutlery Switch (Screenshot 4) */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
              <label className="block text-xs font-black text-gray-900">Ghi chú cho đơn hàng</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhập nội dung (VD: Xin thêm tương ớt, ít đá...)"
                rows={2}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-primary resize-none"
              />

              {/* Cutlery toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-700">
                  Lấy dụng cụ ăn uống nhựa (muỗng, nĩa, ống hút)
                </span>
                <button
                  type="button"
                  onClick={() => setIncludeCutlery(!includeCutlery)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    includeCutlery ? "bg-secondary" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                      includeCutlery ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Payment Method Card (Screenshot 4) */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
              <span className="block text-xs font-black text-gray-900">Phương thức thanh toán</span>

              {/* COD */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-primary transition-colors cursor-pointer bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-primary" />
                  <span className="text-xs font-extrabold text-gray-800">
                    Thanh toán khi nhận hàng (Tiền mặt COD)
                  </span>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
              </label>

              {/* Banking QR */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-primary transition-colors cursor-pointer bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-secondary-hover" />
                  <span className="text-xs font-extrabold text-gray-800">
                    Chuyển khoản Ngân hàng / Quét QR
                  </span>
                </div>
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "BANKING"}
                  onChange={() => setPaymentMethod("BANKING")}
                  className="accent-primary w-4 h-4 cursor-pointer"
                />
              </label>
            </div>

            {/* Payment Info Card (Screenshot 4) */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3">
                Thông tin thanh toán
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-bold text-gray-900">{formatPrice(subtotal)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-primary font-bold">
                    <span>Mã giảm giá</span>
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

                <div className="flex justify-between items-baseline pt-3 border-t border-gray-100 text-sm font-black text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-2xl text-primary font-black">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Agreement Checkbox (Screenshot 4) */}
              <div className="pt-2 flex items-start gap-2">
                <input
                  type="checkbox"
                  id="checkoutAgree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 accent-primary rounded w-4 h-4 cursor-pointer"
                />
                <label htmlFor="checkoutAgree" className="text-[11px] text-gray-600 leading-tight">
                  Đồng ý cho phép website thu thập thông tin cá nhân để phục vụ việc giao hàng và chăm sóc đơn hàng.
                </label>
              </div>

              {/* Big CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-black text-sm rounded-2xl shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Thanh toán ngay"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
