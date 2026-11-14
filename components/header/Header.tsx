"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  User,
  Bell,
  Search,
  Menu as MenuIcon,
  X,
  ChevronDown,
  LogOut,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalContext";
import { useCart } from "@/components/providers/CartContext";
import BrandLogo from "@/components/common/BrandLogo";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, openModal, logout } = useAuthModal();
  const { totalItems } = useCart();

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { label: "MENU", href: "/menu" },
    { label: "KHUYẾN MÃI", href: "/promotions" },
    { label: "CỬA HÀNG", href: "/stores" },
    { label: "VỀ CHÚNG TÔI", href: "/brand-story" },
  ];

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white transition-shadow duration-200">
      {/* 1. Main Navigation Bar */}
      <div
        className={`w-full border-b border-gray-100 ${
          isScrolled ? "shadow-sm bg-white/95 backdrop-blur-md" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <BrandLogo imageSrc="/logo.png" />

          {/* Center: Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full font-black text-sm tracking-wide transition-all ${
                    isActive
                      ? "bg-secondary text-gray-900 shadow-sm"
                      : "text-gray-700 hover:text-primary hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions (Account, Bell, Cart, VN) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Account Icon / Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 cursor-pointer"
                    title={currentUser.name}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 text-primary font-bold flex items-center justify-center text-sm">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-xs font-bold text-gray-800 max-w-[100px] truncate">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>

                  {userDropdownOpen && (
                    <div
                      className="absolute right-0 top-full mt-24 md:mt-14 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">Đã đăng nhập với</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{currentUser.email}</p>
                      </div>

                      {currentUser.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-primary hover:bg-red-50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          Trang Quản Trị (Admin)
                        </Link>
                      )}

                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        Tài khoản của tôi
                      </Link>

                      <Link
                        href="/orders"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-gray-500" />
                        Đơn hàng của tôi
                      </Link>

                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openModal("login")}
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                  title="Tài khoản"
                  aria-label="Tài khoản"
                >
                  <User className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => alert("Chưa có thông báo mới!")}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer relative"
              title="Thông báo"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Cart Icon with Badge */}
            <Link
              href="/cart"
              className="p-2 rounded-full hover:bg-gray-100 text-gray-700 transition-colors relative cursor-pointer"
              title="Giỏ hàng"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-pulse">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>

            {/* Language Selector */}
            <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border border-gray-200 text-xs font-bold text-gray-700 cursor-pointer hover:bg-gray-50">
              <span>VN</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Yellow Announcement & Search Bar (Screenshot 1) */}
      <div className="w-full bg-secondary py-2 px-4 sm:px-6 lg:px-8 border-b border-amber-400/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Left: Announcement text + Login/Register pill button */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-gray-900 font-bold">
            <span>Tích điểm cho mỗi đơn hàng và đổi nhiều quà hấp dẫn.</span>
            {!currentUser ? (
              <button
                onClick={() => openModal("login")}
                className="px-3.5 py-1 bg-white hover:bg-gray-50 text-gray-900 rounded-full text-xs font-extrabold shadow-sm hover:shadow transition-all cursor-pointer"
              >
                Đăng nhập / Đăng ký
              </button>
            ) : (
              <span className="px-3 py-0.5 bg-white/70 rounded-full text-xs font-extrabold text-primary">
                Chào mừng {currentUser.name}!
              </span>
            )}
          </div>

          {/* Right: Search box with magnifying glass */}
          <form
            onSubmit={handleSearchSubmit}
            className="w-full md:w-80 relative flex items-center"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bạn tìm món gì?"
              className="w-full pl-9 pr-4 py-1.5 bg-white rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          </form>
        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-5 space-y-2 animate-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
                  isActive ? "bg-secondary text-gray-900" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}

          {currentUser?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-bold text-primary bg-red-50"
            >
              Trang Quản Trị Admin
            </Link>
          )}

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            {currentUser ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full py-2.5 text-center text-sm font-bold text-red-600 bg-red-50 rounded-xl"
              >
                Đăng xuất ({currentUser.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openModal("login");
                }}
                className="w-full py-2.5 text-center text-sm font-bold text-white bg-primary rounded-xl shadow-md"
              >
                Đăng nhập / Đăng ký
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
