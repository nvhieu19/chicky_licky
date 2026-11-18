"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { X, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthModal } from "@/components/providers/AuthModalContext";

type PolicyType = "terms" | "privacy";

const policies: Record<PolicyType, { title: string; sections: { heading: string; text: string }[] }> = {
  terms: {
    title: "Điều khoản dịch vụ",
    sections: [
      {
        heading: "1. Tài khoản thành viên",
        text: "Bạn cần cung cấp thông tin chính xác, giữ bí mật thông tin đăng nhập và chịu trách nhiệm với các hoạt động phát sinh từ tài khoản của mình. Vui lòng cập nhật thông tin khi có thay đổi.",
      },
      {
        heading: "2. Đặt hàng và thanh toán",
        text: "Đơn hàng được tiếp nhận sau khi bạn xác nhận thông tin món, số lượng, địa chỉ hoặc cửa hàng nhận và phương thức thanh toán. Giá, phí giao hàng và ưu đãi được hiển thị tại thời điểm đặt hàng; nhân viên có thể liên hệ để xác nhận hoặc hỗ trợ khi có vấn đề về đơn.",
      },
      {
        heading: "3. Sử dụng dịch vụ",
        text: "Bạn đồng ý không sử dụng website để cung cấp thông tin sai lệch, gây gián đoạn dịch vụ, xâm phạm quyền của người khác hoặc thực hiện hành vi trái pháp luật.",
      },
      {
        heading: "4. Thay đổi điều khoản và hỗ trợ",
        text: "Chicky Licky có thể cập nhật điều khoản để phù hợp với hoạt động dịch vụ và sẽ đăng nội dung mới trên website. Nếu cần hỗ trợ về tài khoản hoặc đơn hàng, vui lòng liên hệ 078 992 4777 hoặc info.chickylicky@gmail.com.",
      },
    ],
  },
  privacy: {
    title: "Chính sách bảo mật",
    sections: [
      {
        heading: "1. Thông tin được thu thập",
        text: "Khi bạn đăng ký hoặc đặt hàng, website có thể thu thập họ tên, email, số điện thoại, địa chỉ giao hàng, thông tin đơn hàng và dữ liệu cần thiết để vận hành tài khoản.",
      },
      {
        heading: "2. Mục đích sử dụng",
        text: "Thông tin được sử dụng để tạo và quản lý tài khoản, xử lý giao nhận và thanh toán, hỗ trợ khách hàng, bảo vệ an toàn dịch vụ và gửi thông tin ưu đãi khi phù hợp.",
      },
      {
        heading: "3. Chia sẻ và lưu trữ",
        text: "Thông tin chỉ được chia sẻ ở mức cần thiết với đơn vị giao nhận, thanh toán hoặc nhà cung cấp kỹ thuật phục vụ đơn hàng và vận hành website; hoặc khi cần thực hiện nghĩa vụ theo quy định pháp luật. Chúng tôi áp dụng các biện pháp hợp lý để bảo vệ thông tin và chỉ lưu trữ trong thời gian cần thiết cho các mục đích này.",
      },
      {
        heading: "4. Quyền của bạn",
        text: "Bạn có thể yêu cầu xem, cập nhật hoặc xóa thông tin tài khoản và điều chỉnh việc nhận thông tin tiếp thị bằng cách liên hệ 078 992 4777 hoặc info.chickylicky@gmail.com.",
      },
    ],
  },
};

export default function AuthModal() {
  const { isOpen, mode, closeModal, setMode, setCurrentUser } = useAuthModal();

  // Login form state
  const [loginEmailOrPhone, setLoginEmailOrPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [openPolicy, setOpenPolicy] = useState<PolicyType | null>(null);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        if (openPolicy) {
          setOpenPolicy(null);
        } else {
          closeModal();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal, openPolicy]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginEmailOrPhone.trim()) {
      setError("Vui lòng nhập email hoặc số điện thoại");
      return;
    }
    if (!loginPassword) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: loginEmailOrPhone,
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      setSuccess("Đăng nhập thành công!");
      setCurrentUser(data.user);
      setTimeout(() => {
        closeModal();
      }, 500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!regName.trim()) {
      setError("Vui lòng nhập họ và tên");
      return;
    }
    if (!regEmail.trim()) {
      setError("Vui lòng nhập email");
      return;
    }
    if (!regPhone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    if (regPassword.length < 6) {
      setError("Mật khẩu phải từ 6 ký tự trở lên");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (!agreeTerms) {
      setError("Bạn cần đồng ý với điều khoản sử dụng");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
          confirmPassword: regConfirmPassword,
          agreeTerms: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      setSuccess("Đăng ký thành công! Đang chuyển hướng...");
      setCurrentUser(data.user);
      setTimeout(() => {
        closeModal();
      }, 600);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Đã có lỗi xảy ra");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click area */}
      <div className="absolute inset-0" onClick={closeModal} />

      {/* Modal Dialog Card */}
      <div className="relative z-10 w-full max-w-[840px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[92vh] border border-gray-100">
        {/* Close Button */}
        <button
          onClick={closeModal}
          aria-label="Đóng"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/90 md:bg-white text-gray-700 hover:text-black hover:bg-gray-100 flex items-center justify-center shadow-md transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Form */}
        <div className="w-full md:w-[52%] p-6 sm:p-8 flex flex-col justify-center overflow-y-auto">
          {/* Brand Logo Header */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md shadow-red-200">
              <Image src="/logo.png" alt="Chicky Licky" fill sizes="40px" className="object-cover" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-primary">CHICKY LICKY</span>
              <span className="block text-[11px] font-semibold text-secondary -mt-1 tracking-wider uppercase">Fast Food & Chicken</span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            {mode === "login" ? "Đăng nhập tài khoản" : "Tạo tài khoản mới"}
          </h2>
          <p className="text-xs text-gray-500 mt-1 mb-5">
            {mode === "login"
              ? "Tích điểm cho mỗi đơn hàng và nhận hàng trăm ưu đãi hấp dẫn."
              : "Trở thành hội viên Chicky Club để nhận ngay voucher giảm 20K."}
          </p>

          {/* Alert Error / Success */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex border-b border-gray-100 mb-5">
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("login");
              }}
              className={`pb-2 text-sm font-bold transition-all relative ${
                mode === "login"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-600"
              } pr-5`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setMode("register");
              }}
              className={`pb-2 text-sm font-bold transition-all relative ${
                mode === "register"
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-600"
              } pl-5`}
            >
              Đăng ký
            </button>
          </div>

          {/* Form */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Số điện thoại hoặc Email <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={loginEmailOrPhone}
                  onChange={(e) => setLoginEmailOrPhone(e.target.value)}
                  placeholder="Vui lòng nhập..."
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Mật khẩu <span className="text-primary">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Vui lòng liên hệ hotline 078 992 4777 để đặt lại mật khẩu")}
                    className="text-[11px] text-gray-500 hover:text-primary transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-extrabold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tiếp tục"}
              </button>

              <button
                type="button"
                onClick={closeModal}
                className="w-full py-3 bg-white border border-primary text-primary hover:bg-red-50 font-bold rounded-xl text-sm transition-all cursor-pointer"
              >
                Mua hàng không cần tài khoản
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Họ và tên <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Email <span className="text-primary">*</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@vidu.com"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Số điện thoại <span className="text-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0901234567"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mật khẩu <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      required
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Nhập lại <span className="text-primary">*</span>
                  </label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Xác nhận"
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary accent-primary w-4 h-4"
                />
                <label htmlFor="agree" className="text-[12px] text-gray-600 leading-tight">
                  Tôi đồng ý với{" "}
                  <button
                    type="button"
                    onClick={() => setOpenPolicy("terms")}
                    className="text-primary font-medium hover:underline"
                  >
                    Điều khoản dịch vụ
                  </button>{" "}
                  &{" "}
                  <button
                    type="button"
                    onClick={() => setOpenPolicy("privacy")}
                    className="text-primary font-medium hover:underline"
                  >
                    Chính sách bảo mật
                  </button>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-primary hover:bg-primary-hover active:scale-[0.99] text-white font-extrabold rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đăng ký thành viên"}
              </button>
            </form>
          )}

        </div>

        {/* Right Side: Visual fast food graphic */}
        <div className="hidden md:flex md:w-[48%] bg-gradient-to-br from-primary via-[#D60024] to-[#B0001D] text-white p-8 flex-col justify-between relative overflow-hidden">
          {/* Decorative pattern rings */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-secondary/20 blur-2xl pointer-events-none" />

          {/* Top text branding */}
          <div className="relative z-10 text-center pt-4">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-yellow-300 uppercase tracking-widest mb-2">
              Chicky Club Membership
            </span>
            <h3 className="text-3xl font-black tracking-tight leading-tight">
              LƯỚT WEB CHỌN MÓN - TRỌN VẸN CUỘC VUI <br />
              <span className="text-secondary">ƯU ĐÃI NGẬP TRÀN</span>
            </h3>
          </div>

          {/* Product showcase image */}
          <div className="relative z-10 my-4 flex justify-center">
            <div className="relative w-64 h-52 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
              <Image
                src="/brand.png"
                alt="Thương hiệu Chicky Licky"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Bottom Yellow Notification Bar from Screenshot 5 */}
          <div className="relative z-10 -mx-8 -mb-8 bg-secondary text-gray-900 p-3.5 flex items-center justify-between font-bold text-xs shadow-inner">
            <div className="flex items-center gap-1.5">
              <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-black">
                Hotline
              </span>
              <a href="tel:0789924777" className="text-sm font-black text-gray-900">078 992 4777</a>
            </div>
            <div className="text-[11px] font-semibold text-gray-800">
              Giao hàng tận nơi 10 phút
            </div>

            {openPolicy && (
              <div
                className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setOpenPolicy(null)}
              >
                <section
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="policy-title"
                  className="relative z-10 w-full max-w-xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col"
                  onClick={(event) => event.stopPropagation()}
                >
                  <header className="flex items-center justify-between gap-4 p-5 border-b border-gray-100">
                    <h2 id="policy-title" className="text-lg font-black text-gray-900">
                      {policies[openPolicy].title}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setOpenPolicy(null)}
                      aria-label="Đóng nội dung chính sách"
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </header>
                  <div className="p-5 overflow-y-auto space-y-5 text-sm text-gray-600 leading-relaxed">
                    <p>
                      Nội dung dưới đây giải thích cách sử dụng dịch vụ và xử lý thông tin khi bạn dùng
                      website Chicky Licky.
                    </p>
                    {policies[openPolicy].sections.map((section) => (
                      <section key={section.heading} className="space-y-1">
                        <h3 className="font-bold text-gray-900">{section.heading}</h3>
                        <p>{section.text}</p>
                      </section>
                    ))}
                  </div>
                  <footer className="p-5 border-t border-gray-100 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setOpenPolicy(null)}
                      className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-hover"
                    >
                      Đã hiểu
                    </button>
                  </footer>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
