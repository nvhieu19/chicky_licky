import type { Metadata } from "next";
import "./globals.css";
import { AuthModalProvider } from "@/components/providers/AuthModalContext";
import { CartProvider } from "@/components/providers/CartContext";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import AuthModal from "@/components/auth/AuthModal";

export const metadata: Metadata = {
  title: "Chicky Licky - Gà Giòn Chuẩn Vị | Fast Food & Chicken",
  description:
    "Thưởng thức gà rán pop giòn rụm, cơm gà đượm sốt, combo ăn trưa chỉ từ 42K cùng hàng ngàn ưu đãi hấp dẫn tại Chicky Licky. Giao hàng tận nơi nhanh chóng!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-[#F5F6F8] text-[#171717]">
        <AuthModalProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <AuthModal />
          </CartProvider>
        </AuthModalProvider>
      </body>
    </html>
  );
}
