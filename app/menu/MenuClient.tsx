"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ArrowUpDown } from "lucide-react";
import ProductCard from "@/components/products/ProductCard";

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

  return (
    <div className="space-y-7 pb-6">
      {/* 1. Header Banner of Menu */}
      <div className="bg-gradient-to-br from-[#f0002e] via-primary to-[#ad001f] rounded-[2rem] p-6 sm:p-10 text-white shadow-xl shadow-red-200/50 relative overflow-hidden isolate">
        <div className="relative z-10 max-w-xl">
          <span className="px-3.5 py-1.5 bg-white/15 border border-white/20 rounded-full text-[11px] font-extrabold text-amber-200 uppercase tracking-[0.18em] inline-block mb-3 backdrop-blur-sm">
            Thực đơn Chicky Licky
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.08]">
            MÓN NGON MỖI NGÀY <br />
            <span className="text-secondary">ĂN LÀ MÊ NGAY</span>
          </h1>
          <p className="text-sm sm:text-base text-white/85 mt-3 font-medium">
            Lướt web chọn món - trọn vẹn cuộc vui
          </p>
        </div>
        <div className="absolute -bottom-24 -right-12 w-72 h-72 bg-secondary/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 right-[18%] w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-8 bottom-5 hidden sm:block text-white/10 text-8xl font-black italic -rotate-12 select-none pointer-events-none">
          CL
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[205px_minmax(0,1fr)] lg:gap-7">
        {/* 2. Category navigation */}
        <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm sm:p-4">
            <h2 className="mb-3 hidden px-2 text-[11px] font-black uppercase tracking-[0.16em] text-gray-400 lg:block">
              Danh mục món
            </h2>
            <nav aria-label="Danh mục món ăn" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {initialCategories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`shrink-0 rounded-xl px-4 py-2.5 text-left text-xs font-extrabold transition-all duration-200 cursor-pointer lg:w-full ${
                      isSelected
                        ? "bg-primary text-white shadow-md shadow-red-200/60"
                        : "bg-gray-50 text-gray-700 hover:bg-red-50 hover:text-primary"
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
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên món ăn..."
                  aria-label="Tìm theo tên món ăn"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-red-100"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
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
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition-all duration-200 cursor-pointer ${
                        filterType === filter.id
                          ? filter.id === "new"
                            ? "bg-secondary text-gray-900 shadow-sm"
                            : "bg-primary text-white shadow-sm shadow-red-200/60"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                    className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 transition-colors focus:border-primary cursor-pointer"
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
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500">
                Hiển thị <span className="font-black text-gray-900">{filteredProducts.length}</span> món ăn
              </p>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="mx-auto my-8 max-w-md rounded-3xl border border-gray-100 bg-white p-12 text-center shadow-sm">
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
