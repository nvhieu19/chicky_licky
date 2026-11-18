import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Gift,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Layers,
  Tag,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import ComboOrderButton from "@/components/promotions/ComboOrderButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PromotionDetailPage({ params }: Props) {
  const { slug } = await params;

  let promo: any = null;

  try {
    const dbPromo = await prisma.promotion.findUnique({
      where: { slug },
      include: {
        comboItems: {
          include: { product: true },
        },
      },
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
        comboPrice: dbPromo.comboPrice != null ? Number(dbPromo.comboPrice) : null,
        startDate: new Date(dbPromo.startDate).toLocaleDateString("vi-VN"),
        endDate: new Date(dbPromo.endDate).toLocaleDateString("vi-VN"),
        isActive: dbPromo.isActive,
        comboItems: dbPromo.comboItems.map((ci) => ({
          productId: ci.productId,
          quantity: ci.quantity,
          product: {
            id: ci.product.id,
            name: ci.product.name,
            slug: ci.product.slug,
            price: Number(ci.product.price),
            salePrice: ci.product.salePrice != null ? Number(ci.product.salePrice) : null,
            imageUrl: ci.product.imageUrl,
          },
        })),
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
    notFound();
  }

  const isCombo = promo.discountType === "COMBO";

  // Tính tổng giá gốc các món combo
  const comboTotalOriginal = isCombo
    ? promo.comboItems.reduce((sum: number, ci: any) => {
        return sum + (ci.product.salePrice ?? ci.product.price) * ci.quantity;
      }, 0)
    : 0;
  const comboSaving = isCombo ? Math.max(0, comboTotalOriginal - (promo.comboPrice ?? 0)) : 0;

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
            unoptimized={promo.imageUrl?.startsWith("data:")}
            className="object-cover"
          />
          <div className="absolute top-4 left-4">
            {promo.discountType === "PERCENT" && (
              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-secondary text-gray-900 text-xs font-black rounded-xl shadow-md">
                <Tag className="w-3.5 h-3.5" />
                Ưu đãi {promo.discountValue}%
              </span>
            )}
            {promo.discountType === "FIXED" && (
              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-secondary text-gray-900 text-xs font-black rounded-xl shadow-md">
                <Tag className="w-3.5 h-3.5" />
                Giảm {formatPrice(promo.discountValue)}
              </span>
            )}
            {isCombo && (
              <span className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-primary text-white text-xs font-black rounded-xl shadow-md">
                <Layers className="w-3.5 h-3.5" />
                COMBO ĐẶC BIỆT
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-6 sm:p-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1.5 font-bold text-primary bg-red-50 px-3 py-1 rounded-full">
              <Gift className="w-3.5 h-3.5" />
              Chương trình khuyến mãi
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Thời gian: {promo.startDate} - {promo.endDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
            {promo.title}
          </h1>

          {promo.description && (
            <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-medium">
              <p className="text-sm sm:text-base">{promo.description}</p>
            </div>
          )}

          {/* COMBO: hiện danh sách món + giá */}
          {isCombo && promo.comboItems.length > 0 && (
            <div className="bg-orange-50 rounded-2xl border border-orange-100 p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-black text-orange-800 uppercase tracking-wide">
                  Combo gồm các món:
                </h3>
              </div>

              <div className="space-y-3">
                {promo.comboItems.map((ci: any) => (
                  <div
                    key={ci.productId}
                    className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-orange-100"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      <Image
                        src={ci.product.imageUrl}
                        alt={ci.product.name}
                        fill
                        unoptimized={ci.product.imageUrl?.startsWith("data:")}
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-black text-gray-900 line-clamp-1">
                        {ci.product.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        Giá gốc: {formatPrice(ci.product.salePrice ?? ci.product.price)}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm font-black text-orange-600">
                      ×{ci.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pricing summary */}
              <div className="border-t border-orange-100 pt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Tổng giá gốc</span>
                  <span className="line-through">{formatPrice(comboTotalOriginal)}</span>
                </div>
                {comboSaving > 0 && (
                  <div className="flex justify-between text-xs text-green-600 font-bold">
                    <span>Tiết kiệm</span>
                    <span>-{formatPrice(comboSaving)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-primary">
                  <span>Giá Combo</span>
                  <span>{formatPrice(promo.comboPrice ?? 0)}</span>
                </div>
              </div>

              {/* Combo order button */}
              <ComboOrderButton
                comboItems={promo.comboItems}
                comboPrice={promo.comboPrice ?? 0}
                comboTitle={promo.title}
              />
            </div>
          )}

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

          {/* CTA footer */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              Cần hỗ trợ? Gọi Hotline{" "}
              <strong className="text-primary font-bold">078 992 4777</strong>.
            </p>
            {!isCombo && (
              <Link
                href="/menu"
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-hover shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
              >
                <span>Xem Menu &amp; Đặt Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
