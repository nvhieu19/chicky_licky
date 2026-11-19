"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, Plus, Check, UtensilsCrossed } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/providers/CartContext";

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  isAvailable?: boolean;
  categoryName?: string;
  imageAspect?: "square" | "landscape";
  onQuickView?: () => void;
  onAdded?: (productName: string) => void;
}

export default function ProductCard({
  id,
  name,
  slug,
  shortDescription,
  price,
  salePrice,
  imageUrl,
  isBestSeller,
  isNew,
  isAvailable = true,
  categoryName,
  imageAspect = "landscape",
  onQuickView,
  onAdded,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasDiscount = salePrice && salePrice < price;
  const currentPrice = salePrice ?? price;
  const discountPercent = hasDiscount
    ? Math.round(((price - salePrice) / price) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;

    addToCart(
      {
        id,
        name,
        slug,
        price,
        salePrice,
        imageUrl,
        categoryName,
      },
      1
    );

    setAdded(true);
    onAdded?.(name);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="liquid-glass liquid-glass-interactive menu-product-card group flex h-full flex-col justify-between overflow-hidden">
      {/* Clickable Image & Badges */}
      <div className={`product-image-stage relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 ${imageAspect === "square" ? "aspect-square sm:aspect-[4/3]" : "aspect-[4/3]"}`}>
        <Link href={`/menu/${slug}`} className="relative z-[1] block h-full w-full">
          {imageError ? (
            <div className="flex h-full items-center justify-center text-primary/35">
              <UtensilsCrossed className="h-12 w-12" aria-hidden="true" />
              <span className="sr-only">Không thể tải ảnh {name}</span>
            </div>
          ) : (
            <Image
              src={imageUrl}
              alt={name}
              fill
              unoptimized={imageUrl?.startsWith("data:")}
              sizes="(max-width: 359px) 100vw, (max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
              onError={() => setImageError(true)}
              className="object-contain p-1 transition-transform duration-500 group-hover:scale-[1.04] sm:p-2"
            />
          )}

          <div className="absolute left-2.5 top-2.5 z-10 flex flex-wrap gap-1.5 sm:left-3 sm:top-3">
            {isBestSeller && (
              <span className="rounded-full border border-white/70 bg-primary/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow-sm backdrop-blur-md sm:text-[10px]">
                Bán chạy
              </span>
            )}
            {isNew && (
              <span className="rounded-full border border-white/80 bg-white/85 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-gray-800 shadow-sm backdrop-blur-md sm:text-[10px]">
                Món mới
              </span>
            )}
            {hasDiscount && (
              <span className="rounded-full border border-white/70 bg-secondary/95 px-2.5 py-1 text-[9px] font-black text-gray-900 shadow-sm backdrop-blur-md sm:text-[10px]">
                -{discountPercent}%
              </span>
            )}
          </div>

          {!isAvailable && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-gray-950/25 backdrop-blur-[2px]">
              <span className="rounded-full border border-white/70 bg-white/90 px-4 py-2 text-xs font-black text-gray-800 shadow-lg backdrop-blur-md">
                Hết hàng
              </span>
            </div>
          )}
        </Link>
        {onQuickView && (
          <button
            type="button"
            onClick={onQuickView}
            className="absolute bottom-2.5 right-2.5 z-10 inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 text-[11px] font-black text-gray-800 shadow-lg backdrop-blur-xl transition-all hover:bg-white sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
            aria-label={`Xem nhanh ${name}`}
          >
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span>Xem nhanh</span>
          </button>
        )}
      </div>

      {/* Product Content */}
      <div className="menu-product-card-content flex flex-1 flex-col justify-between p-3.5 sm:p-4">
        <div>
          <Link href={`/menu/${slug}`} className="block group-hover:text-primary transition-colors">
            <h3 className="line-clamp-2 text-[13px] font-extrabold leading-snug tracking-[-0.01em] text-gray-900 sm:text-sm">
              {name}
            </h3>
          </Link>
          {shortDescription && (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-gray-500 sm:text-xs">
              {shortDescription}
            </p>
          )}
        </div>

        {/* Price & CTA Button */}
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-900/[0.045] pt-3.5 sm:mt-4 sm:pt-4">
          <div className="flex flex-col">
            <span className="text-[15px] font-black tracking-tight text-primary sm:text-base">
              {formatPrice(currentPrice)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(price)}
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={!isAvailable}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold transition-all duration-200 hover:scale-[1.04] active:scale-95 cursor-pointer ${
              added
                ? "bg-green-600 text-white shadow-md shadow-green-200/70"
                : isAvailable
                ? "bg-gradient-to-br from-[#f0193d] to-[#cf0028] text-white shadow-[0_6px_16px_rgba(230,0,40,0.22)] hover:shadow-[0_8px_20px_rgba(230,0,40,0.3)]"
                : "bg-gray-200 text-gray-400 shadow-none cursor-not-allowed"
            }`}
            title="Thêm vào giỏ"
            aria-label={`Thêm ${name} vào giỏ hàng`}
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
