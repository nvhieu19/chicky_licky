"use client";

import React, { useState, useEffect } from "react";
import { Save, CheckCircle2, Loader2 } from "lucide-react";

export default function AdminContentPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    SITE_NAME: "Chicky Licky",
    HOTLINE: "078 992 4777",
    ANNOUNCEMENT_TEXT: "Tích điểm cho mỗi đơn hàng và đổi nhiều quà hấp dẫn cùng Chicky Club!",
    COMPANY_NAME: "VIETNAM CHICKY LICKY FAST FOOD CO.LTD",
    COMPANY_ADDRESS: "Tầng 15, Chicky Tower II, Số 2-4 Đường số 8, Phường Tân Mỹ, Quận 7, TP.HCM",
    COMPANY_EMAIL: "cskh@chickylicky.vn",
    FACEBOOK_URL: "https://facebook.com/chickylickyvn",
    INSTAGRAM_URL: "https://instagram.com/chickylickyvn",
    ZALO_URL: "https://zalo.me/chickylickyvn",
    FREE_SHIPPING_MIN: "150000",
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/content");
        if (res.ok) {
          const data = await res.json();
          if (data.settings && Object.keys(data.settings).length > 0) {
            setSettings((prev) => ({ ...prev, ...data.settings }));
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      alert("Lỗi lưu cấu hình");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            QUẢN LÝ NỘI DUNG & THƯƠNG HIỆU
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Chỉnh sửa tên thương hiệu, hotline, thông báo, chân trang và mạng xã hội
          </p>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Đã lưu nội dung website thành công!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
        {/* Brand identity */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b pb-2">
            Nhận diện thương hiệu
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Tên thương hiệu</label>
              <input
                type="text"
                value={settings.SITE_NAME || ""}
                onChange={(e) => handleChange("SITE_NAME", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Hotline giao hàng</label>
              <input
                type="text"
                value={settings.HOTLINE || ""}
                onChange={(e) => handleChange("HOTLINE", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 block mb-1">Thanh thông báo (Màu vàng Header)</label>
              <input
                type="text"
                value={settings.ANNOUNCEMENT_TEXT || ""}
                onChange={(e) => handleChange("ANNOUNCEMENT_TEXT", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Company & Footer info */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b pb-2">
            Thông tin công ty & Footer
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Tên công ty</label>
              <input
                type="text"
                value={settings.COMPANY_NAME || ""}
                onChange={(e) => handleChange("COMPANY_NAME", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Email liên hệ</label>
              <input
                type="email"
                value={settings.COMPANY_EMAIL || ""}
                onChange={(e) => handleChange("COMPANY_EMAIL", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 block mb-1">Địa chỉ trụ sở</label>
              <input
                type="text"
                value={settings.COMPANY_ADDRESS || ""}
                onChange={(e) => handleChange("COMPANY_ADDRESS", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 border-b pb-2">
            Mạng xã hội & Khuyến mãi
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Facebook URL</label>
              <input
                type="text"
                value={settings.FACEBOOK_URL || ""}
                onChange={(e) => handleChange("FACEBOOK_URL", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Instagram URL</label>
              <input
                type="text"
                value={settings.INSTAGRAM_URL || ""}
                onChange={(e) => handleChange("INSTAGRAM_URL", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Zalo OA URL</label>
              <input
                type="text"
                value={settings.ZALO_URL || ""}
                onChange={(e) => handleChange("ZALO_URL", e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Lưu tất cả thay đổi</span>
          </button>
        </div>
      </form>
    </div>
  );
}
