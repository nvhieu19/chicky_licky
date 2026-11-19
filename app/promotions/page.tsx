import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, Gift, Layers, Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import ComboOrderButton from "@/components/promotions/ComboOrderButton";

export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  let promotions: any[] = [];
  try {
    const dbPromos = await (prisma.promotion as any).findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      include: {
        comboItems: {
          include: { product: true },
        },
      },
    });
    promotions = dbPromos.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description || "",
      imageUrl: p.imageUrl,
      discountType: p.discountType,
      discountValue: Number(p.discountValue),
      comboPrice: p.comboPrice != null ? Number(p.comboPrice) : null,
      startDate: new Date(p.startDate).toISOString().split("T")[0],
      endDate: new Date(p.endDate).toISOString().split("T")[0],
      comboItems: (p.comboItems ?? []).map((ci: any) => ({
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
    }));
  } catch (err) {
    console.warn("Promotions lookup warning:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Banner hero */}
      <div className="bg-gradient-to-r from-red-600 via-primary to-amber-500 rounded-3xl p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-yellow-300 uppercase tracking-wider mb-3">
            <Gift className="w-4 h-4" />
            <span>Chương trình khuyến mãi</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            ƯU ĐÃI ĐẶC BIỆT <br />
            <span className="text-secondary">TIỆC VUI HẾT CỠ</span>
          </h1>
          <p className="text-xs sm:text-sm text-white/90 mt-2 font-medium">
            Cập nhật liên tục các deal hot, combo giảm giá và quà tặng bất ngờ từ Chicky Licky.
          </p>
        </div>
      </div>

      {/* Promotions list */}
      {promotions.length === 0 ? (
        <div className="liquid-glass mx-auto max-w-lg space-y-3 rounded-3xl p-8 text-center sm:p-16">
          <div className="w-16 h-16 rounded-full bg-red-50 text-primary flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-gray-900">Chưa có khuyến mãi nào</h3>
          <p className="text-xs text-gray-500">
            Các chương trình khuyến mãi và ưu đãi sẽ sớm được cập nhật. Bạn vui lòng quay lại sau nhé!
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary-hover shadow-md transition-all mt-2"
          >
            <span>Khám phá thực đơn</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className="liquid-glass liquid-glass-interactive group overflow-hidden rounded-3xl flex flex-col"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                <Image
                  src={promo.imageUrl}
                  alt={promo.title}
                  fill
                  unoptimized={promo.imageUrl?.startsWith("data:")}
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  {promo.discountType === "PERCENT" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-gray-900 text-xs font-black rounded-lg shadow-sm">
                      <Tag className="w-3 h-3" />
                      Giảm {promo.discountValue}%
                    </span>
                  )}
                  {promo.discountType === "FIXED" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-gray-900 text-xs font-black rounded-lg shadow-sm">
                      <Tag className="w-3 h-3" />
                      Giảm {formatPrice(promo.discountValue)}
                    </span>
                  )}
                  {promo.discountType === "COMBO" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary text-white text-xs font-black rounded-lg shadow-sm">
                      <Layers className="w-3 h-3" />
                      COMBO • {formatPrice(promo.comboPrice ?? 0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium mb-2">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Áp dụng đến: {promo.endDate}</span>
                </div>

                <Link href={`/promotions/${promo.slug}`}>
                  <h3 className="text-base font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {promo.title}
                  </h3>
                </Link>

                {promo.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
                    {promo.description}
                  </p>
                )}

                {/* Combo items preview */}
                {promo.discountType === "COMBO" && promo.comboItems.length > 0 && (
                  <div className="mb-3 p-3 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-[10px] font-black text-orange-700 uppercase tracking-wider mb-2">
                      Gồm các món:
                    </p>
                    <div className="space-y-1">
                      {promo.comboItems.map((ci: any) => (
                        <div key={ci.productId} className="flex items-center justify-between text-xs">
                          <span className="text-gray-700 font-medium line-clamp-1">{ci.product.name}</span>
                          <span className="text-orange-600 font-bold shrink-0 ml-2">×{ci.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-auto pt-3 flex gap-2">
                  {promo.discountType === "COMBO" ? (
                    <>
                      <Link
                        href={`/promotions/${promo.slug}`}
                        className="py-2.5 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center shrink-0"
                      >
                        Chi tiết
                      </Link>
                      <ComboOrderButton
                        comboItems={promo.comboItems}
                        comboPrice={promo.comboPrice ?? 0}
                        comboTitle={promo.title}
                        className="flex-1"
                      />
                    </>
                  ) : (
                    <>
                      <Link
                        href={`/promotions/${promo.slug}`}
                        className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center"
                      >
                        Chi tiết
                      </Link>
                      <Link
                        href="/menu"
                        className="flex-1 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>Đặt ngay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
