import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Gift, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

const fallbackPromos = [
  {
    id: "promo1",
    title: "Ria's Lunch Ăn Trưa Giá Sốc 42K - 49K",
    slug: "rias-lunch-an-trua-gia-soc",
    description:
      "Chương trình ưu đãi bữa trưa đặc biệt cho khách hàng: Gà pop kèm khoai tây và nước chỉ 42.000đ, Cơm gà chiên súp và nước ngọt chỉ 49.000đ. Áp dụng từ 10h30 đến 14h00 các ngày trong tuần (Thứ 2 đến Thứ 6, không áp dụng Thứ 7, Chủ Nhật và ngày Lễ).",
    imageUrl:
      "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=800&q=80",
    discountType: "FIXED",
    discountValue: 23000,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    rules: [
      "Áp dụng trong khung giờ vàng: 10h30 - 14h00 từ Thứ 2 đến Thứ 6.",
      "Không áp dụng đồng thời với các chương trình khuyến mãi khác.",
      "Áp dụng cho cả dịch vụ ăn tại chỗ, mua mang đi và giao hàng tận nơi qua website.",
      "Mỗi khách hàng không giới hạn số lượng combo trong một đơn hàng.",
    ],
  },
  {
    id: "promo2",
    title: "Đại Tiệc Cuối Tuần - Mua 2 Tặng 1 Gà Rán",
    slug: "dai-tiec-cuoi-tuan-mua-2-tang-1",
    description:
      "Vào các ngày Thứ 7 và Chủ Nhật hàng tuần, khi mua từ 2 miếng gà rán bất kỳ (Gà giòn cay hoặc Gà sốt H&S), quý khách sẽ được tặng ngay 1 miếng gà rán giòn rụm hoặc 1 ly Pepsi tươi mát lạnh.",
    imageUrl:
      "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
    discountType: "PERCENT",
    discountValue: 33,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    rules: [
      "Chỉ áp dụng vào Thứ 7 và Chủ Nhật hàng tuần.",
      "Áp dụng cho menu Gà rán lẻ và combo có gà rán.",
      "Quà tặng không có giá trị quy đổi thành tiền mặt.",
    ],
  },
  {
    id: "promo3",
    title: "Ưu Đãi Hội Viên Mới - Tặng Voucher 20.000đ",
    slug: "uu-dai-hoi-vien-moi-chicky-club",
    description:
      "Đăng ký tài khoản Chicky Licky ngay hôm nay để nhận mã giảm giá 20.000đ cho đơn hàng đầu tiên từ 100.000đ cùng hàng ngàn điểm thưởng tích lũy hấp dẫn.",
    imageUrl:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    discountType: "FIXED",
    discountValue: 20000,
    startDate: "01/01/2026",
    endDate: "31/12/2026",
    rules: [
      "Áp dụng cho khách hàng đăng ký tài khoản mới trên website hoặc ứng dụng.",
      "Voucher có hiệu lực trong vòng 30 ngày kể từ ngày kích hoạt tài khoản.",
      "Áp dụng cho đơn hàng có giá trị từ 100.000đ trở lên.",
    ],
  },
];

export default async function PromotionDetailPage({ params }: Props) {
  const { slug } = await params;

  let promo: any = null;

  try {
    const dbPromo = await prisma.promotion.findUnique({
      where: { slug },
    });
    if (dbPromo) {
      promo = {
        id: dbPromo.id,
        title: dbPromo.title,
        slug: dbPromo.slug,
        description: dbPromo.description,
        imageUrl: dbPromo.imageUrl,
        discountType: dbPromo.discountType,
        discountValue: Number(dbPromo.discountValue),
        startDate: new Date(dbPromo.startDate).toLocaleDateString("vi-VN"),
        endDate: new Date(dbPromo.endDate).toLocaleDateString("vi-VN"),
        rules: [
          "Áp dụng cho toàn bộ khách hàng trên toàn hệ thống Chicky Licky.",
          "Áp dụng khi đặt hàng trực tiếp trên Website hoặc qua Hotline 078 992 4777.",
          "Không áp dụng đồng thời với các voucher ưu đãi khác.",
        ],
      };
    }
  } catch (error) {
    console.warn("DB promo lookup error:", error);
  }

  if (!promo) {
    promo = fallbackPromos.find((p) => p.slug === slug);
  }

  if (!promo) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/promotions"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách khuyến mãi</span>
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Banner image */}
        <div className="relative aspect-[21/9] sm:aspect-[2.4/1] w-full bg-gray-50">
          <Image
            src={promo.imageUrl}
            alt={promo.title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute top-4 left-4 px-3.5 py-1.5 bg-secondary text-gray-900 text-xs font-black rounded-xl shadow-md">
            {promo.discountType === "PERCENT"
              ? `Ưu đãi ${promo.discountValue}%`
              : `Giảm ${(promo.discountValue / 1000).toFixed(0)}K`}
          </div>
        </div>

        {/* Details Content */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 font-bold text-primary bg-red-50 px-3 py-1 rounded-full">
              <Gift className="w-3.5 h-3.5" />
              Chương trình khuyến mãi
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Thời gian áp dụng: {promo.startDate} - {promo.endDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
            {promo.title}
          </h1>

          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-medium">
            <p className="text-sm sm:text-base">{promo.description}</p>
          </div>

          {/* Terms & Conditions */}
          {promo.rules && promo.rules.length > 0 && (
            <div className="pt-6 border-t border-gray-100 space-y-3">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-secondary-hover" />
                Điều kiện và thể lệ chương trình:
              </h3>
              <ul className="space-y-2 text-xs text-gray-600">
                {promo.rules.map((rule: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Call */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              Cần hỗ trợ giải đáp về chương trình? Gọi ngay Hotline{" "}
              <strong className="text-primary font-bold">078 992 4777</strong>.
            </p>
            <Link
              href="/menu"
              className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-hover shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
            >
              <span>Xem Menu & Đặt Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
