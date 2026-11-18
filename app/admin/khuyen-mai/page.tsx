"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
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
  ShoppingBag,
  Tag,
  Layers,
  Search,
  Minus,
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import { formatPrice, slugify } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

type DiscountType = "PERCENT" | "FIXED" | "COMBO";

type ComboItemInput = {
  productId: string;
  quantity: number;
};

type Promotion = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string;
  discountType: DiscountType;
  discountValue: number;
  comboPrice: number | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
  comboItems: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price: number;
      salePrice: number | null;
      imageUrl: string;
    };
  }[];
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  imageUrl: string;
  categoryId: string;
  isAvailable: boolean;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DISCOUNT_TYPE_LABELS: Record<DiscountType, string> = {
  PERCENT: "Giảm % (Phần trăm)",
  FIXED: "Giảm số tiền (VNĐ)",
  COMBO: "Khuyến mãi Combo",
};

const today = new Date().toISOString().split("T")[0];

function getStatusBadge(promo: Promotion) {
  const now = new Date();
  const start = new Date(promo.startDate);
  const end = new Date(promo.endDate);
  if (!promo.isActive)
    return <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold">Tắt</span>;
  if (now < start)
    return <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">Sắp diễn ra</span>;
  if (now > end)
    return <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded-full text-[10px] font-bold">Hết hạn</span>;
  return <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold">Đang chạy</span>;
}

function getDiscountBadge(promo: Promotion) {
  if (promo.discountType === "PERCENT")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold">
        <Tag className="w-3 h-3" />
        -{promo.discountValue}%
      </span>
    );
  if (promo.discountType === "FIXED")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full text-[10px] font-bold">
        <Tag className="w-3 h-3" />
        -{formatPrice(promo.discountValue)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-primary rounded-full text-[10px] font-bold">
      <Layers className="w-3 h-3" />
      Combo • {formatPrice(promo.comboPrice ?? 0)}
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENT");
  const [discountValue, setDiscountValue] = useState("0");
  const [comboPrice, setComboPrice] = useState("");
  const [comboItems, setComboItems] = useState<ComboItemInput[]>([]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [isActive, setIsActive] = useState(true);

  // Product search for combo
  const [productSearch, setProductSearch] = useState("");

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [promoRes, prodRes] = await Promise.all([
        fetch("/api/admin/promotions"),
        fetch("/api/admin/products"),
      ]);
      if (promoRes.ok) {
        const d = await promoRes.json();
        setPromotions(d.promotions || []);
      }
      if (prodRes.ok) {
        const d = await prodRes.json();
        setProducts((d.products || []).filter((p: Product) => p.isAvailable));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Toast ──────────────────────────────────────────────────────────────────

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const resetForm = () => {
    setTitle("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setDiscountType("PERCENT");
    setDiscountValue("0");
    setComboPrice("");
    setComboItems([]);
    setStartDate(today);
    setEndDate(today);
    setIsActive(true);
    setFormError(null);
    setProductSearch("");
  };

  const openCreate = () => {
    setEditing(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (p: Promotion) => {
    setEditing(p);
    setTitle(p.title);
    setSlug(p.slug);
    setDescription(p.description || "");
    setImageUrl(p.imageUrl);
    setDiscountType(p.discountType);
    setDiscountValue(p.discountValue.toString());
    setComboPrice(p.comboPrice != null ? p.comboPrice.toString() : "");
    setComboItems(p.comboItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity })));
    setStartDate(p.startDate.split("T")[0]);
    setEndDate(p.endDate.split("T")[0]);
    setIsActive(p.isActive);
    setFormError(null);
    setProductSearch("");
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editing) setSlug(slugify(val));
  };

  // ── Combo item helpers ─────────────────────────────────────────────────────

  const isInCombo = (productId: string) => comboItems.some((ci) => ci.productId === productId);

  const toggleComboProduct = (productId: string) => {
    setComboItems((prev) => {
      if (prev.some((ci) => ci.productId === productId)) {
        return prev.filter((ci) => ci.productId !== productId);
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateComboQuantity = (productId: string, qty: number) => {
    setComboItems((prev) =>
      prev.map((ci) => (ci.productId === productId ? { ...ci, quantity: Math.max(1, qty) } : ci))
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const payload: any = {
      title,
      slug,
      description: description || null,
      imageUrl,
      discountType,
      discountValue: discountType === "COMBO" ? 0 : Number(discountValue),
      comboPrice: discountType === "COMBO" ? Number(comboPrice) : null,
      comboItems: discountType === "COMBO" ? comboItems : null,
      startDate,
      endDate,
      isActive,
    };

    if (editing) payload.id = editing.id;

    try {
      const res = await fetch("/api/admin/promotions", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.message || "Có lỗi xảy ra");
        return;
      }
      setIsModalOpen(false);
      showToast("success", editing ? "Đã cập nhật khuyến mãi!" : "Tạo khuyến mãi thành công!");
      fetchAll();
    } catch {
      setFormError("Lỗi kết nối máy chủ");
    } finally {
      setFormLoading(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa khuyến mãi "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("success", "Đã xóa khuyến mãi");
        setPromotions((prev) => prev.filter((p) => p.id !== id));
      } else {
        const d = await res.json();
        showToast("error", d.message || "Lỗi xóa khuyến mãi");
      }
    } catch {
      showToast("error", "Lỗi kết nối máy chủ");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[200] flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold text-white transition-all ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Quản lý Khuyến Mãi</h1>
          <p className="text-xs text-gray-500 mt-1">
            Tạo chương trình khuyến mãi, combo ưu đãi hiển thị trên trang web
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Thêm Khuyến Mãi
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="text-xs">Đang tải khuyến mãi...</span>
          </div>
        ) : promotions.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Gift className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-xs font-bold text-gray-500">Chưa có khuyến mãi nào</p>
            <p className="text-xs text-gray-400 mt-1">Nhấn &ldquo;Thêm Khuyến Mãi&rdquo; để bắt đầu</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-bold">Hình ảnh</th>
                  <th className="py-3 px-4 font-bold">Tiêu đề</th>
                  <th className="py-3 px-4 font-bold">Loại & Mức ưu đãi</th>
                  <th className="py-3 px-4 font-bold">Thời gian</th>
                  <th className="py-3 px-4 font-bold">Trạng thái</th>
                  <th className="py-3 px-4 font-bold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="relative w-14 h-10 rounded-xl overflow-hidden bg-gray-100">
                        {promo.imageUrl ? (
                          <Image
                            src={promo.imageUrl}
                            alt={promo.title}
                            fill
                            unoptimized={promo.imageUrl.startsWith("data:")}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gift className="w-5 h-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[200px]">
                      <span className="font-extrabold text-gray-900 block leading-tight line-clamp-2">
                        {promo.title}
                      </span>
                      <span className="text-gray-400 font-mono text-[10px]">/{promo.slug}</span>
                      {promo.discountType === "COMBO" && promo.comboItems.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {promo.comboItems.slice(0, 3).map((ci) => (
                            <span
                              key={ci.id}
                              className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-[10px] font-bold"
                            >
                              {ci.product?.name ?? "?"} ×{ci.quantity}
                            </span>
                          ))}
                          {promo.comboItems.length > 3 && (
                            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">
                              +{promo.comboItems.length - 3} món
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">{getDiscountBadge(promo)}</td>
                    <td className="py-3 px-4 text-gray-500">
                      <div>{promo.startDate.split("T")[0]}</div>
                      <div className="text-gray-400">→ {promo.endDate.split("T")[0]}</div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(promo)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(promo)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id, promo.title)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="Xóa"
                        >
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

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-gray-100 my-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-5">
              <h2 className="text-lg font-black text-gray-900">
                {editing ? "Sửa khuyến mãi" : "Tạo khuyến mãi mới"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Tiêu đề <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  placeholder="VD: Combo Gà Rán Siêu Tiết Kiệm"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-primary outline-none"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Slug URL <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:bg-white focus:border-primary outline-none"
                />
              </div>

              {/* Image */}
              <ImageUploadField
                label="Hình ảnh banner khuyến mãi (tỉ lệ 16:10)"
                value={imageUrl}
                onChange={setImageUrl}
                idPrefix="promo"
                helperText="Khuyến nghị kích thước 800×500px (tỉ lệ 16:10)"
              />

              {/* Discount type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Loại ưu đãi <span className="text-primary">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["PERCENT", "FIXED", "COMBO"] as DiscountType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setDiscountType(type);
                        if (type !== "COMBO") setComboItems([]);
                      }}
                      className={`px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                        discountType === type
                          ? "bg-primary text-white border-primary shadow-md"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {type === "PERCENT" && <Tag className="w-3.5 h-3.5 mx-auto mb-1" />}
                      {type === "FIXED" && <Tag className="w-3.5 h-3.5 mx-auto mb-1" />}
                      {type === "COMBO" && <Layers className="w-3.5 h-3.5 mx-auto mb-1" />}
                      {DISCOUNT_TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount value OR Combo section */}
              {discountType !== "COMBO" ? (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    {discountType === "PERCENT" ? "Mức giảm (%)" : "Số tiền giảm (VNĐ)"}
                    <span className="text-primary"> *</span>
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min="0"
                    max={discountType === "PERCENT" ? 100 : undefined}
                    step={discountType === "PERCENT" ? "1" : "1000"}
                    required
                    placeholder={discountType === "PERCENT" ? "VD: 20" : "VD: 30000"}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-primary outline-none"
                  />
                  {discountType === "PERCENT" && (
                    <p className="text-[11px] text-gray-400 mt-1">Nhập số từ 1 đến 100</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4 p-4 bg-orange-50/60 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-black text-orange-700 uppercase tracking-wide">
                      Cấu hình Combo
                    </span>
                  </div>

                  {/* Combo price */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Giá Combo (VNĐ) <span className="text-primary">*</span>
                    </label>
                    <input
                      type="number"
                      value={comboPrice}
                      onChange={(e) => setComboPrice(e.target.value)}
                      min="1000"
                      step="1000"
                      required
                      placeholder="VD: 99000"
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:border-primary outline-none"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Giá này sẽ áp dụng khi khách đặt combo (thay vì tính riêng từng món)
                    </p>
                  </div>

                  {/* Selected combo items */}
                  {comboItems.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-gray-700">
                        Món đã chọn ({comboItems.length}):
                      </span>
                      {comboItems.map((ci) => {
                        const prod = products.find((p) => p.id === ci.productId);
                        if (!prod) return null;
                        return (
                          <div
                            key={ci.productId}
                            className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-orange-100"
                          >
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                              <Image
                                src={prod.imageUrl}
                                alt={prod.name}
                                fill
                                unoptimized={prod.imageUrl.startsWith("data:")}
                                className="object-cover"
                              />
                            </div>
                            <span className="flex-1 text-xs font-bold text-gray-800 line-clamp-1">
                              {prod.name}
                            </span>
                            {/* Quantity controls */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => updateComboQuantity(ci.productId, ci.quantity - 1)}
                                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-black">{ci.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateComboQuantity(ci.productId, ci.quantity + 1)}
                                className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleComboProduct(ci.productId)}
                              className="p-1 rounded-full hover:bg-red-50 text-red-400 transition-colors shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Product selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Chọn món cho Combo <span className="text-primary">*</span>
                    </label>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Tìm tên món..."
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:border-primary outline-none"
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {filteredProducts.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">Không tìm thấy món</p>
                      ) : (
                        filteredProducts.map((prod) => {
                          const selected = isInCombo(prod.id);
                          return (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => toggleComboProduct(prod.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all border ${
                                selected
                                  ? "bg-orange-50 border-orange-200 text-orange-800"
                                  : "bg-white border-gray-100 hover:border-gray-200 text-gray-700"
                              }`}
                            >
                              <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                <Image
                                  src={prod.imageUrl}
                                  alt={prod.name}
                                  fill
                                  unoptimized={prod.imageUrl.startsWith("data:")}
                                  className="object-cover"
                                />
                              </div>
                              <span className="flex-1 text-xs font-bold line-clamp-1">{prod.name}</span>
                              <span className="text-[10px] text-gray-500 shrink-0">
                                {formatPrice(prod.salePrice ?? prod.price)}
                              </span>
                              {selected && (
                                <ShoppingBag className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Mô tả ngắn về chương trình khuyến mãi..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-primary outline-none resize-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Ngày bắt đầu <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                    Ngày kết thúc <span className="text-primary">*</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:bg-white focus:border-primary outline-none"
                  />
                </div>
              </div>

              {/* isActive */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-5 rounded-full transition-colors ${
                      isActive ? "bg-primary" : "bg-gray-300"
                    }`}
                  />
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700">
                  {isActive ? "Đang kích hoạt (hiển thị trên web)" : "Tắt (ẩn khỏi trang khuyến mãi)"}
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl shadow-md transition-all disabled:opacity-60 cursor-pointer active:scale-95"
                >
                  {formLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editing ? (
                    "Lưu thay đổi"
                  ) : (
                    "Tạo khuyến mãi"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
