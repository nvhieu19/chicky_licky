"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

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

  const mobileNavigation =
    mobileMenuOpen && typeof document !== "undefined"
      ? createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[59] bg-gray-950/25 backdrop-blur-sm md:hidden"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Đóng menu"
            />
            <nav
              id="mobile-navigation"
              aria-label="Điều hướng trên điện thoại"
              className="mobile-navigation-panel fixed left-3 right-3 top-[9.5rem] z-[60] max-h-[calc(100dvh-10.5rem)] space-y-2 overflow-y-auto rounded-3xl p-4 shadow-2xl md:hidden"
            >
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-12 items-center rounded-xl px-4 py-2.5 text-sm font-bold ${
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
                  className="flex min-h-12 items-center rounded-xl bg-red-50 px-4 py-2.5 text-sm font-bold text-primary"
                >
                  Trang Quản Trị Admin
                </Link>
              )}

              <div className="flex items-center justify-between border-t border-white/70 pt-3">
                {currentUser ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="min-h-12 w-full rounded-xl bg-red-50 py-2.5 text-center text-sm font-bold text-red-600"
                  >
                    Đăng xuất ({currentUser.name})
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openModal("login");
                    }}
                    className="min-h-12 w-full rounded-xl bg-primary py-2.5 text-center text-sm font-bold text-white shadow-md"
                  >
                    Đăng nhập / Đăng ký
                  </button>
                )}
              </div>
            </nav>
          </>,
          document.body
        )
      : null;

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <>
    <header className="liquid-glass-header sticky top-0 z-40 w-full transition-shadow duration-200">
      {/* 1. Main Navigation Bar */}
      <div
        className={`w-full border-b border-gray-100 ${
          isScrolled ? "bg-white/48 backdrop-blur-xl" : "bg-white/28 backdrop-blur-xl"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <BrandLogo imageSrc="/logo.png" className="header-brand" sloganClassName="max-[639px]:hidden" />

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

          {/* Right: Account, notifications, and cart */}
          <div className="flex items-center gap-0 sm:gap-3">
            {/* Account Icon / Dropdown */}
            <div className="relative">
              {currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex h-11 w-11 items-center justify-center rounded-full p-0 text-gray-700 transition-colors hover:bg-white/70 cursor-pointer sm:h-auto sm:w-auto sm:gap-1.5 sm:p-2"
                    title={currentUser.name}
                  >
                    <div className="w-8 h-8 rounded-full bg-red-100 text-primary font-bold flex items-center justify-center text-sm">
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:inline text-xs font-bold text-gray-800 max-w-[100px] truncate">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-gray-500 sm:block" />
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
                  className="glass-icon-control flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white/70 cursor-pointer"
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
              className="relative hidden h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white/70 cursor-pointer md:flex"
              title="Thông báo"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
            </button>

            {/* Cart Icon with Badge */}
            <Link
              href="/cart"
              className="glass-icon-control relative flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white/70 cursor-pointer"
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="glass-icon-control md:hidden flex h-11 w-11 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-white/70 cursor-pointer"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Announcement & Search */}
      <div className="liquid-glass-gold w-full px-4 py-1.5 sm:px-6 sm:py-2 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1.5 md:flex-row md:gap-2.5">
          {/* Left: Announcement text + Login/Register pill button */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-gray-900 sm:text-xs md:justify-start">
            <span className="hidden sm:inline">Tích điểm cho mỗi đơn hàng và đổi nhiều quà hấp dẫn.</span>
            <span className="sm:hidden">Tích điểm • Ưu đãi thành viên</span>
            {!currentUser ? (
              <button
                onClick={() => openModal("login")}
                className="hidden rounded-full bg-white/80 px-3.5 py-1 text-xs font-extrabold text-gray-900 shadow-sm transition-all hover:bg-white hover:shadow sm:inline-flex"
              >
                Đăng nhập / Đăng ký
              </button>
            ) : (
              <span className="hidden rounded-full bg-white/70 px-3 py-0.5 text-xs font-extrabold text-primary sm:inline-flex">
                Chào mừng {currentUser.name}!
              </span>
            )}
          </div>

          {/* Right: Search box with magnifying glass */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex w-full items-center md:w-80"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Bạn tìm món gì?"
              className="glass-input min-h-10 w-full rounded-full py-2 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
          </form>
        </div>
      </div>

    </header>
    {mobileNavigation}
    </>
  );
}
