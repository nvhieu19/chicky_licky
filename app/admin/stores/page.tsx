"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, X, Loader2, AlertCircle, MapPin, Phone, Clock } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [openingHours, setOpeningHours] = useState("08:00 - 22:30");
  const [imageUrl, setImageUrl] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stores");
      if (res.ok) {
        const d = await res.json();
        setStores(d.stores || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const openCreateModal = () => {
    setEditingStore(null);
    setName("");
    setAddress("");
    setPhone("");
    setOpeningHours("08:00 - 22:30");
    setImageUrl("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (s: any) => {
    setEditingStore(s);
    setName(s.name);
    setAddress(s.address);
    setPhone(s.phone);
    setOpeningHours(s.openingHours);
    setImageUrl(s.imageUrl || "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const payload = {
        name,
        address,
        phone,
        openingHours,
        imageUrl: imageUrl || null,
        isActive: true,
      };

      const method = editingStore ? "PUT" : "POST";
      const body = editingStore ? { id: editingStore.id, ...payload } : payload;

      const res = await fetch("/api/admin/stores", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể lưu cửa hàng");

      setIsModalOpen(false);
      fetchStores();
    } catch (err: unknown) {
      if (err instanceof Error) setFormError(err.message);
      else setFormError("Đã có lỗi xảy ra");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa chi nhánh "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/stores?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setStores((prev) => prev.filter((s) => s.id !== id));
      } else {
        const d = await res.json();
        alert(d.message || "Xóa thất bại");
      }
    } catch {
      alert("Lỗi khi xóa");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            QUẢN LÝ CỬA HÀNG & CHI NHÁNH
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng:{" "}
            <span className="font-bold text-gray-800">{stores.length} cửa hàng</span>
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm chi nhánh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-xs">Đang tải danh sách chi nhánh...</p>
          </div>
        ) : stores.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 text-xs">
            Chưa có chi nhánh nào. Hãy thêm chi nhánh đầu tiên!
          </div>
        ) : (
          stores.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Store image */}
              {s.imageUrl ? (
                <div className="relative aspect-video bg-gray-100">
                  <Image
                    src={s.imageUrl}
                    alt={s.name}
                    fill
                    unoptimized={s.imageUrl?.startsWith("data:")}
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs font-bold">Chưa có ảnh</span>
                </div>
              )}

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-gray-900">{s.name}</h3>
                  <p className="text-xs text-gray-600 flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{s.address}</span>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{s.phone}</span>
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-secondary-hover" />
                    <span>{s.openingHours}</span>
                  </p>
                </div>

                <div className="px-0 py-3 border-t border-gray-100 flex justify-end gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="px-3 py-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(s.id, s.name)}
                    className="px-3 py-1.5 text-xs font-bold bg-red-50 hover:bg-red-100 rounded-lg text-red-500 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <h3 className="font-black text-gray-900">
                {editingStore ? "Sửa thông tin cửa hàng" : "Thêm cửa hàng mới"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 uppercase">
                  Tên chi nhánh <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Chicky Licky - Tên Địa Điểm"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 uppercase">
                  Địa chỉ <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 uppercase">
                  Số điện thoại <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="028 xxxx xxxx"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 uppercase">
                  Giờ mở cửa
                </label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="08:00 - 22:30"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-primary"
                />
              </div>

              <ImageUploadField
                label="Hình ảnh cửa hàng"
                value={imageUrl}
                onChange={setImageUrl}
                idPrefix="store"
                helperText="Ảnh ngoại thất hoặc nội thất cửa hàng (JPG, PNG, WEBP)"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-black disabled:opacity-60 cursor-pointer"
                >
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu chi nhánh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
