"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, X, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const statuses = [
  { value: "ALL", label: "Tất cả đơn" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PREPARING", label: "Đang làm món" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "COMPLETED", label: "Hoàn tất" },
  { value: "CANCELLED", label: "Đã hủy" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [updateNote, setUpdateNote] = useState("");

  const fetchOrders = async (status = selectedStatus) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(selectedStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedOrder) return;
    setStatusUpdating(true);

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          newStatus,
          note: updateNote || undefined,
        }),
      });

      if (res.ok) {
        // update local state
        setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }));
        setOrders((prev) =>
          prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
        );
        setUpdateNote("");
      } else {
        alert("Cập nhật trạng thái thất bại");
      }
    } catch {
      alert("Đã có lỗi xảy ra");
    } finally {
      setStatusUpdating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orderCode.toLowerCase().includes(q) ||
      o.recipientName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            QUẢN LÝ ĐƠN HÀNG
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi, cập nhật tiến độ giao hàng và xác nhận đơn của khách
          </p>
        </div>
      </div>

      {/* Status pills & Search */}
      <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {statuses.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === s.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách, SĐT..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-primary"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Đang tải danh sách đơn hàng...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <p className="text-xs">Không có đơn hàng nào.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Mã đơn</th>
                  <th className="py-3 px-4 font-bold">Thời gian</th>
                  <th className="py-3 px-4 font-bold">Khách hàng</th>
                  <th className="py-3 px-4 font-bold">Số điện thoại</th>
                  <th className="py-3 px-4 font-bold">Tổng tiền</th>
                  <th className="py-3 px-4 font-bold">Hình thức</th>
                  <th className="py-3 px-4 font-bold">Trạng thái</th>
                  <th className="py-3 px-4 font-bold text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4 font-black text-gray-900">#{o.orderCode}</td>
                    <td className="py-3 px-4 text-gray-400">
                      {new Date(o.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-gray-800">{o.recipientName}</td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{o.phone}</td>
                    <td className="py-3 px-4 font-black text-primary">
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-50 text-primary">
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white text-gray-700 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-lg font-black text-gray-900">
                  Chi tiết đơn hàng #{selectedOrder.orderCode}
                </h2>
                <span className="text-xs text-gray-400">
                  {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status change actions */}
            <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Cập nhật trạng thái đơn (Hiện tại: <strong className="text-primary">{selectedOrder.status}</strong>)
              </span>

              <div className="flex flex-wrap items-center gap-2">
                {["PENDING", "CONFIRMED", "PREPARING", "SHIPPING", "COMPLETED", "CANCELLED"].map(
                  (st) => (
                    <button
                      key={st}
                      disabled={statusUpdating || selectedOrder.status === st}
                      onClick={() => handleUpdateStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer disabled:opacity-40 ${
                        selectedOrder.status === st
                          ? "bg-primary text-white"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {st}
                    </button>
                  )
                )}
              </div>

              <div>
                <input
                  type="text"
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  placeholder="Ghi chú nội bộ cho lần đổi trạng thái này..."
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Recipient & Shipping info */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50/50 p-4 rounded-2xl">
              <div>
                <p>
                  <strong className="text-gray-900">Người nhận:</strong> {selectedOrder.recipientName}
                </p>
                <p>
                  <strong className="text-gray-900">Số điện thoại:</strong> {selectedOrder.phone}
                </p>
                <p>
                  <strong className="text-gray-900">Địa chỉ:</strong> {selectedOrder.address}
                </p>
              </div>
              <div>
                <p>
                  <strong className="text-gray-900">Hình thức:</strong> {selectedOrder.deliveryType}
                </p>
                <p>
                  <strong className="text-gray-900">Thanh toán:</strong> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})
                </p>
                {selectedOrder.note && (
                  <p className="text-primary font-medium">
                    <strong>Ghi chú:</strong> {selectedOrder.note}
                  </p>
                )}
              </div>
            </div>

            {/* Items list */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Món ăn trong đơn ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl p-2">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="py-2.5 px-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                        <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.productName}</p>
                        <p className="text-gray-400">{formatPrice(item.unitPrice)} × {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-black text-gray-900">{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-1.5 text-xs text-right border-t border-gray-100 pt-3">
              <p className="text-gray-500">Tạm tính: <strong className="text-gray-900">{formatPrice(selectedOrder.subtotal)}</strong></p>
              {selectedOrder.discountAmount > 0 && (
                <p className="text-primary font-bold">Giảm giá: -{formatPrice(selectedOrder.discountAmount)}</p>
              )}
              <p className="text-gray-500">Phí giao: <strong className="text-gray-900">{formatPrice(selectedOrder.shippingFee)}</strong></p>
              <p className="text-base font-black text-primary pt-1">
                Tổng thanh toán: {formatPrice(selectedOrder.totalAmount)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
