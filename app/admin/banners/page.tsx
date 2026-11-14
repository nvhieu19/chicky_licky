"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Plus, Trash2, X, Loader2 } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [link, setLink] = useState("/menu");
  const [position, setPosition] = useState("HERO");
  const [sortOrder, setSortOrder] = useState("0");
  const [formLoading, setFormLoading] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const d = await res.json();
        setBanners(d.banners || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setTitle("");
    setDescription("");
    setImageUrl("");
    setLink("/menu");
    setPosition("HERO");
    setSortOrder("0");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          imageUrl,
          link: link || null,
          position,
          sortOrder: Number(sortOrder),
          isActive: true,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchBanners();
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa banner "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id));
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
            QUẢN LÝ BANNER QUẢNG CÁO
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Chỉnh sửa hình ảnh slide và banner trang chủ mà không cần sửa mã nguồn
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm banner mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-xs">Đang tải danh sách banner...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-400 text-xs">
            Chưa có banner nào. Hãy thêm banner mới!
          </div>
        ) : (
          banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-[16/8] bg-gray-100">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                unoptimized={banner.imageUrl?.startsWith("data:")}
                className="object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 text-white rounded-md text-[10px] font-black uppercase">
                {banner.position}
              </div>
            </div>

            <div className="p-5 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-gray-900">{banner.title}</h3>
                {banner.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{banner.description}</p>
                )}
                {banner.link && (
                  <span className="text-[11px] text-primary font-mono block mt-1">Link: {banner.link}</span>
                )}
              </div>

              <button
                onClick={() => handleDelete(banner.id, banner.title)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-gray-900">Thêm banner</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tiêu đề</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <ImageUploadField
                label="Hình ảnh banner"
                value={imageUrl}
                onChange={setImageUrl}
                required
                idPrefix="banner"
              />

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Link liên kết (CTA)</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mô tả</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-black"
                >
                  {formLoading ? "..." : "Lưu banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
