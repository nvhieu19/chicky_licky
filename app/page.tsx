import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, Sparkles, Clock, Award, ShieldCheck, Gift } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";

export const dynamic = "force-dynamic";


async function getHomeData() {
  try {
    const [categories, bestSellers, newProducts, promotions, banners] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isBestSeller: true, isAvailable: true },
        take: 8,
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isNew: true, isAvailable: true },
        take: 4,
        orderBy: { createdAt: "desc" },
      }),
      prisma.promotion.findMany({
        where: { isActive: true },
        take: 3,
        orderBy: { createdAt: "desc" },
      }),
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return {
      categories,
      bestSellers: bestSellers.map((p) => ({
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
      })),
      newProducts: newProducts.map((p) => ({
        ...p,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
      })),
      promotions,
      banners,
    };
  } catch (error) {
    console.warn("Home data fetch error:", error);
    return {
      categories: [],
      bestSellers: [],
      newProducts: [],
      promotions: [],
      banners: [],
    };
  }
}

export default async function HomePage() {
  const { categories, bestSellers, newProducts, promotions, banners } = await getHomeData();

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* 1. Hero Section (matching screenshot 1) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Hero Card: Membership Greeting */}
          <div className="lg:col-span-4 bg-gradient-to-b from-[#E60028] to-[#B0001D] text-white rounded-3xl p-7 flex flex-col justify-between shadow-xl shadow-red-200/50 relative overflow-hidden min-h-[360px]">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              <span className="text-sm font-bold text-white/90 tracking-wide">
                Chào buổi sáng!
              </span>
              <div className="mt-4 mb-2">
                <span className="text-3xl font-black tracking-tight text-white block">
                  CHICKY LICKY
                </span>
                <span className="text-xs font-black text-secondary tracking-widest uppercase">
                  Fast Food & Chicken
                </span>
              </div>
              <p className="text-sm text-white/90 leading-relaxed mt-4 font-medium">
                Đăng ký membership ngay hôm nay! Tích điểm cho mỗi đơn hàng và đổi nhiều quà hấp dẫn cùng Chicky Club.
              </p>
            </div>

            <div className="relative z-10 pt-6">
              <Link
                href="/promotions"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 bg-secondary hover:bg-amber-400 active:scale-95 text-gray-900 font-black text-sm rounded-2xl shadow-lg transition-all"
              >
                <span>Nhận ưu đãi hội viên</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Hero Banner: Custom Banner from Admin or Welcome Card */}
          {banners && banners.length > 0 ? (
            <div className="lg:col-span-8 relative rounded-3xl overflow-hidden min-h-[360px] shadow-sm border border-gray-100 bg-gray-50 flex items-center justify-center">
              <Link href={banners[0].link || "/menu"} className="block w-full h-full relative aspect-[16/8] sm:aspect-[2/1]">
                <Image
                  src={banners[0].imageUrl}
                  alt={banners[0].title}
                  fill
                  priority
                  unoptimized={banners[0].imageUrl?.startsWith("data:")}
                  className="object-cover"
                />
              </Link>
            </div>
          ) : (
            <div className="lg:col-span-8 bg-gradient-to-br from-[#FFF5DC] via-[#FFF9ED] to-[#FFF0D4] border-2 border-amber-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
              {/* Top row */}
              <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-primary text-white text-xs font-black rounded-lg tracking-wider uppercase">
                    Hot Deal
                  </span>
                  <span className="text-sm font-extrabold text-gray-800">
                    CHICKY LICKY - GÀ GIÒN CHUẨN VỊ
                  </span>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-gray-900 rounded-xl font-black text-xs shadow-sm">
                  <Clock className="w-4 h-4" />
                  <span>Mở cửa: 08:00 - 22:30 mỗi ngày</span>
                </div>
              </div>

              {/* Middle showcase */}
              <div className="my-8 relative z-10 space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Khám phá thực đơn đồ ăn nhanh phong phú
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-lg leading-relaxed">
                  Gà rán giòn rụm đậm vị sốt Hàn Quốc và các combo siêu tiết kiệm chỉ từ 42K đang chờ đón bạn!
                </p>
                <div className="pt-2">
                  <Link
                    href="/menu"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl shadow-md transition-all"
                  >
                    <span>Xem Menu & Đặt Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Bottom footnote */}
              <div className="relative z-10 pt-2 border-t border-amber-200/70 text-[11px] text-gray-500 font-medium">
                Giao hàng nhanh tận nơi trong 10 phút • Cam kết an toàn vệ sinh thực phẩm HACCP
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Category Quick Navigation Bar */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-primary rounded-full" />
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                DANH MỤC MÓN ĂN
              </h2>
            </div>
            <Link
              href="/menu"
              className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả menu <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/menu?category=${cat.slug}`}
                className="group bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all text-center flex flex-col items-center justify-center"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2.5 bg-gray-50 border-2 border-gray-100 group-hover:border-primary transition-colors flex items-center justify-center">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      unoptimized={cat.imageUrl?.startsWith("data:")}
                      className="object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-amber-50 text-primary font-black text-xs sm:text-sm uppercase select-none">
                      {cat.name.slice(0, 2)}
                    </div>
                  )}
                </div>
                <span className="font-extrabold text-xs sm:text-sm text-gray-800 group-hover:text-primary transition-colors line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 3. BEST SELLER Section (matching screenshot 1) */}
      {bestSellers && bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                  BEST SELLER
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                  Những món ăn được yêu thích nhất tại Chicky Licky
                </span>
              </div>
            </div>
            <Link
              href="/menu?filter=best-seller"
              className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
            >
              Xem thêm <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                shortDescription={product.shortDescription}
                price={product.price}
                salePrice={product.salePrice}
                imageUrl={product.imageUrl}
                isBestSeller={product.isBestSeller}
                isNew={product.isNew}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. KHUYẾN MÃI NỔI BẬT Section */}
      {promotions && promotions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-secondary text-gray-900 flex items-center justify-center">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                  KHUYẾN MÃI NỔI BẬT
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                  Ưu đãi hot không thể bỏ lỡ trong tuần
                </span>
              </div>
            </div>
            <Link
              href="/promotions"
              className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {promotions.slice(0, 3).map((promo: any) => (
              <Link
                key={promo.id}
                href={`/promotions/${promo.slug}`}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-red-100 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-[16/9] overflow-hidden bg-gray-50">
                    <Image
                      src={promo.imageUrl}
                      alt={promo.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-secondary text-gray-900 text-[11px] font-black rounded-lg shadow-sm">
                      {promo.discountType === "PERCENT"
                        ? `Giảm ${promo.discountValue}%`
                        : `Giảm ${(Number(promo.discountValue) / 1000).toFixed(0)}K`}
                    </div>
                  </div>
                  <div className="p-5 space-y-1.5">
                    <h3 className="text-sm font-black text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {promo.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {promo.description}
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0">
                  <span className="text-xs font-bold text-primary flex items-center gap-1">
                    Xem chi tiết ưu đãi <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. MÓN MỚI TOANH Section */}
      {newProducts && newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                <Sparkles className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-none">
                  MÓN MỚI TOANH
                </h2>
                <span className="text-xs text-gray-500 font-medium">
                  Trải nghiệm hương vị mới bùng nổ từ Chicky Licky
                </span>
              </div>
            </div>
            <Link
              href="/menu?filter=new"
              className="text-xs font-extrabold text-primary hover:underline flex items-center gap-1"
            >
              Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {newProducts.slice(0, 4).map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                shortDescription={product.shortDescription}
                price={product.price}
                salePrice={product.salePrice}
                imageUrl={product.imageUrl}
                isBestSeller={product.isBestSeller}
                isNew={product.isNew}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Quality & Commitment Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-primary flex items-center justify-center mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-gray-900">Gà Tươi 100% Mỗi Ngày</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Nguồn thịt gà được tuyển chọn nghiêm ngặt từ các trang trại đạt chuẩn vệ sinh thú y.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-secondary-hover flex items-center justify-center mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-gray-900">Giao Nhanh 10 Phút Dưới 2 Km</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Món ăn luôn nóng hổi giòn rụm khi đến tay bạn nhờ túi giữ nhiệt chuyên dụng.
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-sm text-gray-900">Chuẩn HACCP & ISO</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-xs">
              Quy trình chế biến khép kín đảm bảo an toàn tuyệt đối cho sức khỏe người tiêu dùng.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
