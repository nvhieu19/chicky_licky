"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronDown,
  Flame,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import ProductCard from "@/components/products/ProductCard";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/providers/CartContext";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl: string;
  categoryId: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  isAvailable?: boolean;
}

interface MenuClientProps {
  initialCategories: CategoryItem[];
  initialProducts: ProductItem[];
}

export default function MenuClient({
  initialCategories,
  initialProducts,
}: MenuClientProps) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const searchParam = searchParams.get("search") || "";
  const filterParam = searchParams.get("filter") || "all";

  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);
  const [filterType, setFilterType] = useState<string>(filterParam);
  const [sortBy, setSortBy] = useState<string>("default");
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);
  const [quickViewQuantity, setQuickViewQuantity] = useState(1);
  const [quickViewAdded, setQuickViewAdded] = useState(false);
  const { addToCart, totalItems, subtotal } = useCart();
  const heroProduct = initialProducts.find((product) => product.isBestSeller) ?? initialProducts[0];

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return initialProducts
      .filter((product) => {
        // Category filter
        if (selectedCategory !== "all" && product.categoryId !== selectedCategory) {
          return false;
        }

        // Quick filter
        if (filterType === "best-seller" && !product.isBestSeller) {
          return false;
        }
        if (filterType === "new" && !product.isNew) {
          return false;
        }
        if (filterType === "sale" && (!product.salePrice || product.salePrice >= product.price)) {
          return false;
        }

        // Search text
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase().trim();
          const matchName = product.name.toLowerCase().includes(query);
          const matchDesc = product.shortDescription?.toLowerCase().includes(query);
          if (!matchName && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;

        if (sortBy === "price-asc") return priceA - priceB;
        if (sortBy === "price-desc") return priceB - priceA;
        if (sortBy === "name-asc") return a.name.localeCompare(b.name);
        return 0;
      });
  }, [initialProducts, selectedCategory, filterType, searchQuery, sortBy]);

  React.useEffect(() => {
    if (!quickViewProduct) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setQuickViewProduct(null);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [quickViewProduct]);

  return (
    <>
    <div className="space-y-7 pb-28 sm:pb-6">
      {/* 1. Header Banner of Menu */}
      <div className="liquid-glass-red relative isolate overflow-hidden rounded-[2rem] p-5 text-white sm:p-9">
        <div className="relative z-10 grid items-center gap-5 sm:gap-8 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.72fr)]">
          <div className="max-w-xl">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber-200 backdrop-blur-sm sm:text-[11px]">
              <Sparkles className="h-3.5 w-3.5" />
              Thực đơn Chicky Licky
            </span>
            <h1 className="text-[clamp(1.8rem,6vw,3.25rem)] font-black leading-[1.08] tracking-tight">
              MÓN NGON MỖI NGÀY
              <span className="block text-secondary">ĂN LÀ MÊ NGAY</span>
            </h1>
            <p className="mt-3 text-sm font-medium text-white/85 sm:text-base">
              Chọn món bạn yêu thích, giao nóng hổi đến tận nơi.
            </p>
            <a
              href="#products"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-secondary px-5 py-2.5 text-xs font-black text-gray-950 shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95"
            >
              Khám phá món ngon <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {heroProduct && (
            <Link
              href={`/menu/${heroProduct.slug}`}
              className="group relative hidden min-h-48 items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/25 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur-sm sm:flex"
              aria-label={`Xem món ${heroProduct.name}`}
            >
              <div className="relative h-40 w-full">
                <Image
                  src={heroProduct.imageUrl}
                  alt={heroProduct.name}
                  fill
                  priority
                  unoptimized={heroProduct.imageUrl?.startsWith("data:")}
                  sizes="(max-width: 768px) 50vw, 320px"
                  className="object-contain drop-shadow-[0_18px_18px_rgba(55,0,13,0.35)] transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-2xl border border-white/30 bg-white/85 px-3 py-2 text-gray-900 shadow-lg backdrop-blur-xl">
                <span className="min-w-0">
                  <span className="block truncate text-xs font-black">{heroProduct.name}</span>
                  <span className="mt-0.5 block text-[11px] font-bold text-primary">
                    {formatPrice(heroProduct.salePrice ?? heroProduct.price)}
                  </span>
                </span>
                {heroProduct.isBestSeller ? (
                  <Flame className="h-5 w-5 shrink-0 fill-current text-primary" />
                ) : (
                  <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
                )}
              </span>
            </Link>
          )}
        </div>
        <div className="pointer-events-none absolute -bottom-24 -right-12 h-72 w-72 rounded-full bg-secondary/25 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-[18%] h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-5 right-8 hidden select-none -rotate-12 text-8xl font-black italic text-white/10 sm:block">
          CL
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[205px_minmax(0,1fr)] lg:gap-7">
        {/* 2. Category navigation */}
        <aside className="sticky top-[7.25rem] z-30 -mx-4 min-w-0 px-4 lg:top-32 lg:mx-0 lg:self-start lg:px-0">
          <div className="liquid-glass rounded-2xl p-2.5 sm:p-3 lg:p-4">
            <h2 className="mb-3 hidden px-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400 lg:block">
              Danh mục món
            </h2>
            <nav aria-label="Danh mục món ăn" className="hide-scrollbar flex gap-2 overflow-x-auto pb-0.5 lg:flex-col lg:overflow-visible lg:pb-0">
              {initialCategories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`min-h-11 shrink-0 rounded-xl px-4 py-2.5 text-left text-xs font-extrabold transition-all duration-200 cursor-pointer lg:w-full ${
                      isSelected
                        ? "bg-primary text-white shadow-md shadow-red-200/60"
                        : "bg-white/55 text-gray-700 hover:bg-red-50 hover:text-primary"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <section className="min-w-0 space-y-5">
          {/* 3. Search & filter bar */}
          <div className="liquid-glass rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bạn đang thèm món gì hôm nay?"
                  aria-label="Tìm theo tên món ăn"
                  className="glass-input min-h-12 w-full rounded-2xl py-3 pl-11 pr-12 text-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
                    aria-label="Xóa nội dung tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                  {[
                    { id: "all", label: "Tất cả" },
                    { id: "best-seller", label: "Bán chạy" },
                    { id: "new", label: "Món mới" },
                    { id: "sale", label: "Khuyến mãi" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      aria-pressed={filterType === filter.id}
                      onClick={() => setFilterType(filter.id)}
                      className={`min-h-11 shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                        filterType === filter.id
                          ? filter.id === "new"
                            ? "border-secondary bg-secondary text-gray-900 shadow-sm"
                            : "border-primary bg-primary text-white shadow-sm shadow-red-200/60"
                          : "border-white/80 bg-white/50 text-gray-600 hover:bg-white/85"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="sr-only">Sắp xếp món ăn</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="glass-input min-h-11 min-w-0 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 transition-colors focus:border-primary cursor-pointer"
                  >
                    <option value="default">Mặc định</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                    <option value="name-asc">Tên món A-Z</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {/* 4. Products grid */}
          <div id="products" className="scroll-mt-40">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">
                <span className="font-black text-gray-900">{filteredProducts.length}</span> món ngon dành cho bạn
              </p>
              {(selectedCategory !== "all" || filterType !== "all" || searchQuery || sortBy !== "default") && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setFilterType("all");
                    setSortBy("default");
                  }}
                  className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-bold text-primary hover:bg-white/70"
                >
                  Xóa bộ lọc <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <div className="liquid-glass mx-auto my-8 max-w-md rounded-3xl p-8 text-center sm:p-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-primary">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Không tìm thấy món ăn phù hợp</h3>
                <p className="mb-6 mt-1 text-sm text-gray-500">
                  Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ các bộ lọc đang chọn.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                    setFilterType("all");
                  }}
                  className="rounded-xl bg-primary px-6 py-2.5 text-sm font-extrabold text-white shadow-md transition-all hover:bg-primary-hover hover:shadow-lg cursor-pointer"
                >
                  Xem lại tất cả món ăn
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4 max-[359px]:grid-cols-1">
                {filteredProducts.map((p) => (
                  <div key={p.id} className="menu-card-enter h-full">
                    <ProductCard
                      id={p.id}
                      name={p.name}
                      slug={p.slug}
                      shortDescription={p.shortDescription}
                      price={p.price}
                      salePrice={p.salePrice}
                      imageUrl={p.imageUrl}
                      isBestSeller={p.isBestSeller}
                      isNew={p.isNew}
                      isAvailable={p.isAvailable}
                      onQuickView={() => {
                        setQuickViewQuantity(1);
                        setQuickViewAdded(false);
                        setQuickViewProduct(p);
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
    {quickViewProduct && (
      <div
        className="glass-modal-backdrop"
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) setQuickViewProduct(null);
        }}
      >
        <section
          className="glass-quick-view"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-view-title"
        >
          <button
            type="button"
            onClick={() => setQuickViewProduct(null)}
            className="glass-modal-close"
            aria-label="Đóng xem nhanh"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="grid sm:grid-cols-2">
            <div className="relative min-h-64 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 sm:min-h-[380px]">
              <Image
                src={quickViewProduct.imageUrl}
                alt={quickViewProduct.name}
                fill
                unoptimized={quickViewProduct.imageUrl?.startsWith("data:")}
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-contain p-8"
              />
            </div>
            <div className="flex flex-col justify-center p-5 sm:p-8">
              <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary">
                {quickViewProduct.isBestSeller ? <Flame className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                {quickViewProduct.isBestSeller ? "Món bán chạy" : quickViewProduct.isNew ? "Món mới" : "Chicky Licky"}
              </span>
              <h2 id="quick-view-title" className="text-xl font-black text-gray-900 sm:text-2xl">
                {quickViewProduct.name}
              </h2>
              {quickViewProduct.shortDescription && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {quickViewProduct.shortDescription}
                </p>
              )}
              <p className="mt-5 text-2xl font-black text-primary">
                {formatPrice(quickViewProduct.salePrice ?? quickViewProduct.price)}
              </p>
              {quickViewProduct.salePrice && quickViewProduct.salePrice < quickViewProduct.price && (
                <p className="text-sm text-gray-400 line-through">{formatPrice(quickViewProduct.price)}</p>
              )}
              <div className="mt-6 flex items-center gap-3">
                <div className="glass-stepper flex h-12 items-center rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => setQuickViewQuantity((quantity) => Math.max(1, quantity - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/80"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-9 text-center text-sm font-black">{quickViewQuantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuickViewQuantity((quantity) => quantity + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-white/80"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  {quickViewProduct.isAvailable ? "Còn phục vụ" : "Tạm hết món"}
                </span>
              </div>
              <button
                type="button"
                disabled={!quickViewProduct.isAvailable}
                onClick={() => {
                  addToCart(
                    {
                      id: quickViewProduct.id,
                      name: quickViewProduct.name,
                      slug: quickViewProduct.slug,
                      price: quickViewProduct.price,
                      salePrice: quickViewProduct.salePrice,
                      imageUrl: quickViewProduct.imageUrl,
                    },
                    quickViewQuantity
                  );
                  setQuickViewAdded(true);
                  window.setTimeout(() => setQuickViewAdded(false), 1400);
                }}
                className={`mt-5 flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black text-white shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 ${
                  quickViewAdded ? "bg-green-600" : "bg-primary hover:bg-primary-hover"
                }`}
              >
                {quickViewAdded ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
                {quickViewAdded
                  ? "Đã thêm vào giỏ"
                  : `Thêm • ${formatPrice((quickViewProduct.salePrice ?? quickViewProduct.price) * quickViewQuantity)}`}
              </button>
              <Link
                href={`/menu/${quickViewProduct.slug}`}
                className="mt-3 inline-flex min-h-11 items-center justify-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                Xem chi tiết món <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    )}
    {totalItems > 0 && (
      <Link href="/cart" className="menu-cart-summary liquid-glass group" aria-label={`Xem giỏ hàng, ${totalItems} món, ${formatPrice(subtotal)}`}>
        <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-red-200/50">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-secondary px-1 text-[10px] font-black text-gray-900">
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Giỏ hàng • {totalItems} món</span>
          <span className="mt-0.5 block text-sm font-black text-gray-900">{formatPrice(subtotal)}</span>
        </span>
        <span className="inline-flex min-h-11 items-center gap-1 rounded-xl bg-primary px-4 text-xs font-black text-white transition-colors group-hover:bg-primary-hover">
          Xem giỏ <ChevronDown className="h-4 w-4 -rotate-90" />
        </span>
      </Link>
    )}
    </>
  );
}
