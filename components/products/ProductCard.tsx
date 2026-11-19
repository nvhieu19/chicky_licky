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
  onQuickView?: () => void;
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
  onQuickView,
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
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="liquid-glass liquid-glass-interactive group h-full rounded-2xl overflow-hidden flex flex-col justify-between">
      {/* Clickable Image & Badges */}
      <Link href={`/menu/${slug}`} className="block relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
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
            className="object-contain p-2.5 transition-transform duration-500 group-hover:scale-[1.04] sm:p-3"
          />
        )}

        {/* Badges container */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isBestSeller && (
            <span className="px-2.5 py-1 bg-primary text-white text-[10px] font-black uppercase rounded-lg shadow-md tracking-wider">
              Best Seller
            </span>
          )}
          {isNew && (
            <span className="px-2.5 py-1 bg-secondary text-gray-900 text-[10px] font-black uppercase rounded-lg shadow-md tracking-wider">
              Mới
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-extrabold rounded-md shadow-sm">
              -{discountPercent}%
            </span>
          )}
        </div>

        {!isAvailable && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 bg-gray-800 text-white text-xs font-bold rounded-full">
              Hết hàng
            </span>
          </div>
        )}
        {onQuickView && (
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onQuickView();
            }}
            className="absolute bottom-2.5 right-2.5 z-10 inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 text-[11px] font-black text-gray-800 shadow-lg backdrop-blur-xl transition-colors hover:bg-white sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`Xem nhanh ${name}`}
          >
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span>Xem nhanh</span>
          </button>
        )}
      </Link>

      {/* Product Content */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4">
        <div>
          <Link href={`/menu/${slug}`} className="block group-hover:text-primary transition-colors">
            <h3 className="line-clamp-2 text-xs font-extrabold leading-snug text-gray-900 sm:text-sm">
              {name}
            </h3>
          </Link>
          {shortDescription && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
              {shortDescription}
            </p>
          )}
        </div>

        {/* Price & CTA Button */}
        <div className="mt-3 flex items-center justify-between gap-1.5 border-t border-white/70 pt-3 sm:mt-4 sm:gap-2">
          <div className="flex flex-col">
            <span className="text-sm font-black text-primary sm:text-base">
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
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold transition-all cursor-pointer sm:h-11 sm:w-11 ${
              added
                ? "bg-green-600 text-white"
                : isAvailable
                ? "bg-primary hover:bg-primary-hover active:scale-95 text-white shadow-md shadow-red-200"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            title="Thêm vào giỏ"
            aria-label="Thêm vào giỏ"
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
