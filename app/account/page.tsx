"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  Lock,
  ShoppingBag,
  Award,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalContext";

export default function AccountPage() {
  const { currentUser, openLogin } = useAuthModal();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "membership">("profile");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [points, setPoints] = useState(150);
  const [orderCount, setOrderCount] = useState(0);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    fetch("/api/account/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setName(data.name || currentUser.name || "");
          setEmail(data.email || currentUser.email || "");
          setPhone(data.phone || "");
          setPoints(data.points ?? 150);
          setOrderCount(data._count?.orders ?? 0);
        }
      })
      .catch(() => {
        setName(currentUser.name);
        setEmail(currentUser.email);
      });
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Không thể cập nhật hồ sơ");
      setSuccessMsg("Cập nhật thông tin thành công!");
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi lưu thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");
      setSuccessMsg("Đổi mật khẩu thành công!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-2">Bạn chưa đăng nhập</h1>
        <p className="text-sm text-gray-600 mb-6">
          Vui lòng đăng nhập để xem thông tin tài khoản, tích điểm thành viên và quản lý đơn hàng.
        </p>
        <button
          onClick={openLogin}
          className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-md transition-all cursor-pointer"
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            TÀI KHOẢN CỦA TÔI
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý thông tin cá nhân, quyền lợi thành viên và bảo mật tài khoản
          </p>
        </div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:border-primary hover:text-primary transition-all shadow-sm"
        >
          <ShoppingBag className="w-4 h-4 text-primary" />
          <span>Lịch sử đơn hàng ({orderCount})</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Member Card & Quick Navigation */}
        <div className="space-y-6">
          {/* Membership Badge Card matching Lotteria style */}
          <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-primary to-orange-600 text-white rounded-2xl p-6 shadow-xl">
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-black tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-full backdrop-blur-sm">
                CHICKY MEMBER
              </span>
              <Award className="w-6 h-6 text-yellow-300" />
            </div>

            <div className="space-y-1 mb-6">
              <h2 className="text-xl font-black tracking-tight">{currentUser.name}</h2>
              <p className="text-xs text-white/80">{currentUser.email}</p>
            </div>

            <div className="pt-4 border-t border-white/20 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold text-white/70">Điểm tích lũy</p>
                <p className="text-2xl font-black text-yellow-300 flex items-center gap-1">
                  {points} <Sparkles className="w-4 h-4" />
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-white/70">Hạng thẻ</p>
                <p className="text-xs font-bold text-white">Thân Thiết</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-3 space-y-1">
            <button
              onClick={() => {
                setActiveTab("profile");
                setSuccessMsg("");
                setErrorMsg("");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "profile"
                  ? "bg-red-50 text-primary border border-red-100"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Thông tin cá nhân</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("membership");
                setSuccessMsg("");
                setErrorMsg("");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "membership"
                  ? "bg-red-50 text-primary border border-red-100"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Đặc quyền thành viên</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("password");
                setSuccessMsg("");
                setErrorMsg("");
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === "password"
                  ? "bg-red-50 text-primary border border-red-100"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Đổi mật khẩu</span>
            </button>
          </div>
        </div>

        {/* Right Column: Tab Panels */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            {/* Alerts */}
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: Profile */}
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">
                    Hồ Sơ Cá Nhân
                  </h3>
                  <p className="text-xs text-gray-500">
                    Cập nhật họ tên và số điện thoại nhận hàng chính xác.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Họ và tên *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary pl-9"
                      />
                      <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Email đăng nhập
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500 pl-9 cursor-not-allowed"
                      />
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Email được sử dụng để xác thực tài khoản và không thể tự thay đổi.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Số điện thoại nhận hàng *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ví dụ: 0912345678"
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary pl-9"
                      />
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Membership benefits */}
            {activeTab === "membership" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">
                    Đặc Quyền Thành Viên Chicky
                  </h3>
                  <p className="text-xs text-gray-500">
                    Tích lũy 5% giá trị mỗi đơn hàng để đổi các món ăn và voucher miễn phí.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-gray-900">Tích 5% Mỗi Đơn</h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Mỗi 10.000đ chi tiêu tương đương 1 điểm thưởng Chicky Coin.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-yellow-100 bg-yellow-50/50 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-secondary text-gray-900 flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-gray-900">Quà Sinh Nhật</h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Tặng ngay Combo Burger + Pepsi miễn phí trong tuần lễ sinh nhật của bạn.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h4 className="text-xs font-black text-gray-900">Freeship Đơn &gt; 150K</h4>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Miễn phí vận chuyển tận nơi trong bán kính 5km cho đơn hàng trên 150.000đ.
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-2">
                  <p className="font-bold text-gray-900">Cách sử dụng điểm:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-500">
                    <li>100 điểm = Giảm 50.000đ khi thanh toán đơn hàng.</li>
                    <li>200 điểm = Đổi ngay 1 phần Gà Rán Giòn Cay đặc biệt.</li>
                    <li>Điểm có hạn sử dụng 12 tháng kể từ ngày tích lũy.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* TAB 3: Change Password */}
            {activeTab === "password" && (
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight mb-1">
                    Đổi Mật Khẩu
                  </h3>
                  <p className="text-xs text-gray-500">
                    Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho bất kỳ ai.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Mật khẩu hiện tại *
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Mật khẩu mới (tối thiểu 6 ký tự) *
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Xác nhận mật khẩu mới *
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Cập nhật mật khẩu</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
