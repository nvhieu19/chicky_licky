import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, ArrowRight, Gift } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";


export default async function PromotionsPage() {
  let promotions: any[] = [];
  try {
    const dbPromos = await prisma.promotion.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    promotions = dbPromos.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      description: p.description || "",
      imageUrl: p.imageUrl,
      discountType: p.discountType,
      discountValue: Number(p.discountValue),
      startDate: p.startDate.toISOString().split("T")[0],
      endDate: p.endDate.toISOString().split("T")[0],
    }));
  } catch (err) {
    console.warn("Promotions lookup warning:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Banner */}
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

      {/* Promotions List or Empty State */}
      {promotions.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm max-w-lg mx-auto space-y-3">
          <div className="w-16 h-16 rounded-full bg-red-50 text-primary flex items-center justify-center mx-auto">
            <Gift className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-gray-900">Chưa có khuyến mãi nào</h3>
          <p className="text-xs text-gray-500">
            Các chương trình khuyến mãi và voucher giảm giá sẽ sớm được cập nhật. Bạn vui lòng quay lại sau nhé!
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
            className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-50">
                <Image
                  src={promo.imageUrl}
                  alt={promo.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 px-3 py-1 bg-secondary text-gray-900 text-xs font-black rounded-lg shadow-sm">
                  {promo.discountType === "PERCENT"
                    ? `Giảm ${promo.discountValue}%`
                    : `Giảm ${(promo.discountValue / 1000).toFixed(0)}K`}
                </div>
              </div>

              <div className="p-6 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Áp dụng đến: {promo.endDate}</span>
                </div>
                <Link href={`/promotions/${promo.slug}`}>
                  <h3 className="text-base font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                    {promo.title}
                  </h3>
                </Link>
                <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                  {promo.description}
                </p>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-2">
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
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
