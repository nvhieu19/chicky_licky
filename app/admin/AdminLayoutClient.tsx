"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Tag,
  Image as ImageIcon,
  ShoppingBag,
  Users,
  Store,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalContext";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Sản phẩm", href: "/admin/products", icon: UtensilsCrossed },
  { label: "Danh mục", href: "/admin/categories", icon: FolderTree },
  { label: "Khuyến mãi", href: "/admin/promotions", icon: Tag },
  { label: "Banner", href: "/admin/banners", icon: ImageIcon },
  { label: "Đơn hàng", href: "/admin/orders", icon: ShoppingBag },
  { label: "Khách hàng", href: "/admin/customers", icon: Users },
  { label: "Cửa hàng", href: "/admin/stores", icon: Store },
  { label: "Nội dung", href: "/admin/content", icon: FileText },
  { label: "Cấu hình", href: "/admin/settings", icon: Settings },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, isLoading, setCurrentUser, logout } = useAuthModal();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Admin login fallback states
  const [adminEmail, setAdminEmail] = useState("admin@chickylicky.vn");
  const [adminPassword, setAdminPassword] = useState("AdminPassword123!");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");

      if (data.user?.role !== "ADMIN") {
        throw new Error("Tài khoản này không có quyền truy cập trang Quản Trị Admin.");
      }

      setCurrentUser(data.user);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLoginError(err.message);
      } else {
        setLoginError("Đã có lỗi xảy ra");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not logged in as ADMIN -> Show Dedicated Admin Sign-in screen
  if (!currentUser || currentUser.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl text-white">
          <div className="text-center space-y-2 mb-6">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden mx-auto shadow-lg shadow-red-500/20">
              <Image src="/logo.png" alt="Chicky Licky" fill sizes="56px" className="object-cover" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              CHICKY LICKY ADMIN
            </h1>
            <p className="text-xs text-gray-400">
              Trang quản trị hệ thống bán hàng & nội dung
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800 text-red-300 text-xs rounded-xl flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Email Quản Trị
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1.5">
                Mật khẩu
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-95 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đăng nhập Quản trị"}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-800 text-center">
            <Link
              href="/"
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              ← Quay lại Website Khách hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Full Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-100 flex text-gray-800">
      {/* 1. Sidebar for Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-gray-900 text-white shrink-0 shadow-xl border-r border-gray-800">
        {/* Brand header */}
        <div className="h-18 px-6 flex items-center justify-between border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden">
              <Image src="/logo.png" alt="Chicky Licky" fill sizes="36px" className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-tight text-white leading-none">CHICKY ADMIN</span>
              <span className="text-[10px] text-secondary font-bold tracking-wider uppercase mt-1">
                Quản Trị Viên
              </span>
            </div>
          </Link>
        </div>

        {/* Nav list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-red-900/40"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Xem Website</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-18 bg-white border-b border-gray-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="font-bold text-gray-800">Admin</span>
              <span>/</span>
              <span className="font-medium text-gray-600 capitalize">
                {pathname.replace("/admin/", "").replace("/admin", "Dashboard") || "Dashboard"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem trang khách</span>
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <span className="block text-xs font-bold text-gray-900 leading-tight">
                  {currentUser.name}
                </span>
                <span className="block text-[10px] text-gray-400">Quản trị viên</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">{children}</main>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-gray-900 text-white flex flex-col justify-between p-4 z-10 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <span className="font-black text-primary">CHICKY ADMIN</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setSidebarOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2 py-2.5 text-xs font-bold text-red-400 hover:bg-gray-800 rounded-xl px-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
