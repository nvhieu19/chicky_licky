"use client";

import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Edit2,
  Gift,
  Loader2,
  Plus,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { formatPrice, slugify } from "@/lib/utils";

type Promotion = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const dateInputValue = (value: string) => new Date(value).toISOString().slice(0, 10);
const today = () => dateInputValue(new Date().toISOString());
const nextYear = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return dateInputValue(date.toISOString());
};

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [discountType, setDiscountType] = useState<Promotion["discountType"]>("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextYear);
  const [isActive, setIsActive] = useState(true);

  const fetchPromotions = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/admin/promotions");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể tải khuyến mãi");
      setPromotions(data.promotions || []);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Không thể tải khuyến mãi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPromotions();
  }, []);

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setDiscountType("PERCENT");
    setDiscountValue("");
    setStartDate(today());
    setEndDate(nextYear());
    setIsActive(true);
    setFormError(null);
  };

  const openCreateModal = () => {
    setEditingPromotion(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setTitle(promotion.title);
    setSlug(promotion.slug);
    setDescription(promotion.description || "");
    setImageUrl(promotion.imageUrl);
    setDiscountType(promotion.discountType);
    setDiscountValue(String(promotion.discountValue));
    setStartDate(dateInputValue(promotion.startDate));
    setEndDate(dateInputValue(promotion.endDate));
    setIsActive(promotion.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description.trim() || null,
        imageUrl,
        discountType,
        discountValue: Number(discountValue),
        startDate,
        endDate,
        isActive,
      };
      const response = await fetch("/api/admin/promotions", {
        method: editingPromotion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingPromotion ? { id: editingPromotion.id, ...payload } : payload
        ),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể lưu khuyến mãi");
      setIsModalOpen(false);
      await fetchPromotions();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Không thể lưu khuyến mãi");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleActive = async (promotion: Promotion) => {
    try {
      const response = await fetch("/api/admin/promotions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...promotion,
          startDate: dateInputValue(promotion.startDate),
          endDate: dateInputValue(promotion.endDate),
          isActive: !promotion.isActive,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể cập nhật trạng thái");
      await fetchPromotions();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không thể cập nhật trạng thái");
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    if (!window.confirm(`Bạn có chắc muốn xóa khuyến mãi "${promotion.title}"?`)) return;
    try {
      const response = await fetch(`/api/admin/promotions?id=${promotion.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể xóa khuyến mãi");
      setPromotions((current) => current.filter((item) => item.id !== promotion.id));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Không thể xóa khuyến mãi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">QUẢN LÝ KHUYẾN MÃI</h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng cộng: <span className="font-bold text-gray-800">{promotions.length} chương trình</span>
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khuyến mãi</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Đang tải khuyến mãi...</span>
          </div>
        ) : loadError ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-sm font-bold text-red-600">{loadError}</p>
            <button onClick={() => void fetchPromotions()} className="text-xs font-bold text-primary">
              Thử tải lại
            </button>
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Gift className="w-10 h-10 text-gray-200 mx-auto" />
            <p className="text-xs text-gray-400">Chưa có chương trình khuyến mãi nào. Hãy thêm chương trình đầu tiên!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Chương trình</th>
                  <th className="py-3 px-4 font-bold">Mức ưu đãi</th>
                  <th className="py-3 px-4 font-bold">Thời gian</th>
                  <th className="py-3 px-4 font-bold">Trạng thái</th>
                  <th className="py-3 px-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50/60">
                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-900">{promotion.title}</p>
                      <p className="text-[11px] text-gray-400">/{promotion.slug}</p>
                    </td>
                    <td className="py-3 px-4 font-black text-primary">
                      {promotion.discountType === "PERCENT"
                        ? `Giảm ${promotion.discountValue}%`
                        : `Giảm ${formatPrice(promotion.discountValue)}`}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(promotion.startDate).toLocaleDateString("vi-VN")} –{" "}
                      {new Date(promotion.endDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => void toggleActive(promotion)} className="cursor-pointer">
                        {promotion.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">
                            <CheckCircle2 className="w-3 h-3" /> Đang bật
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase">
                            <XCircle className="w-3 h-3" /> Đang tắt
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => openEditModal(promotion)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600" title="Sửa">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => void handleDelete(promotion)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Xóa">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <h2 className="text-lg font-black text-gray-900">
                {editingPromotion ? "Sửa khuyến mãi" : "Thêm khuyến mãi mới"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400" aria-label="Đóng">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tên chương trình *</label>
                  <input value={title} onChange={(event) => {
                    setTitle(event.target.value);
                    if (!editingPromotion) setSlug(slugify(event.target.value));
                  }} required minLength={2} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Đường dẫn (slug) *</label>
                  <input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} required minLength={2} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mô tả</label>
                <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
              </div>

              <ImageUploadField label="Ảnh khuyến mãi" value={imageUrl} onChange={setImageUrl} required idPrefix="promotion" />

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Loại ưu đãi</label>
                  <select value={discountType} onChange={(event) => setDiscountType(event.target.value as Promotion["discountType"])} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                    <option value="PERCENT">Giảm theo phần trăm (%)</option>
                    <option value="FIXED">Giảm số tiền (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mức ưu đãi *</label>
                  <input type="number" value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} required min="0.01" max={discountType === "PERCENT" ? "100" : undefined} step="any" className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ngày bắt đầu *</label>
                  <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ngày kết thúc *</label>
                  <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required min={startDate} className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800">
                <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="accent-primary rounded" />
                <span>Kích hoạt chương trình</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl">
                  Hủy
                </button>
                <button type="submit" disabled={formLoading} className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl shadow-md flex items-center gap-2 disabled:opacity-60">
                  {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : editingPromotion ? "Lưu thay đổi" : "Thêm khuyến mãi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
