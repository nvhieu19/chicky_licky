"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, CheckCircle, MessageCircle } from "lucide-react";
import BrandLogo from "@/components/common/BrandLogo";

export default function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <footer className="w-full bg-white border-t border-gray-200 pt-12 pb-8 text-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6 pb-10 border-b border-gray-100">
          {/* Column 1: Brand & Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <BrandLogo size="md" showSlogan={false} imageSrc="/logo.png" />

            <div className="text-xs text-gray-600 space-y-1.5 leading-relaxed">
              <p className="font-bold text-gray-900 text-sm">VIETNAM CHICKY LICKY CO.LTD</p>
              <p>Địa chỉ: 114 Khúc Hạo, Phường Sơn Trà, Thành phố Đà Nẵng</p>
              <p>Điện thoại: 078 992 4777</p>
              <p>Email: info.chickylicky@gmail.com</p>
            </div>

            <div className="pt-2">
              <a
                href="tel:0789924777"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-gray-900 font-extrabold text-sm rounded-full shadow-sm hover:bg-amber-400 transition-colors"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>078 992 4777</span>
                <span className="text-xs font-medium bg-black/10 px-2 py-0.5 rounded-full">Giao hàng tận nơi</span>
              </a>
            </div>
          </div>

          {/* Column 2: THÔNG TIN */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-gray-900 mb-3.5">
              THÔNG TIN
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/brand-story" className="text-gray-600 hover:text-primary transition-colors">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-gray-600 hover:text-primary transition-colors">
                  Khuyến mãi
                </Link>
              </li>
              <li>
                <Link href="/brand-story" className="text-gray-600 hover:text-primary transition-colors">
                  Tuyển dụng
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-gray-600 hover:text-primary transition-colors">
                  Nhượng quyền
                </Link>
              </li>
              <li>
                <Link href="/brand-story" className="text-gray-600 hover:text-primary transition-colors">
                  Đăng ký chào hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HỖ TRỢ */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-wider text-gray-900 mb-3.5">
              HỖ TRỢ
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/brand-story" className="text-gray-600 hover:text-primary transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link href="/brand-story" className="text-gray-600 hover:text-primary transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/brand-story" className="text-gray-600 hover:text-primary transition-colors">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link href="/stores" className="text-gray-600 hover:text-primary transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link href="/promotions" className="text-gray-600 hover:text-primary transition-colors">
                  Chính sách thành viên
                </Link>
              </li>
              <li>
                <Link href="/brand-story" className="text-gray-600 hover:text-primary transition-colors">
                  Báo cáo vi phạm
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 & 5: THEO DÕI & TẢI ỨNG DỤNG */}
          <div className="space-y-5">
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider text-gray-900 mb-3">
                THEO DÕI
              </h4>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://zalo.me"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Zalo"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>


            {/* Ministry of Industry and Trade Badge from screenshot 3 */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-[10px] font-bold text-blue-800">
              <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
              <span>ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 text-center text-xs text-gray-400">
          <p>© 2026 Chicky Licky. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}
