"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Check } from "lucide-react";
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
}: ProductCardProps) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

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
        <Image
          src={imageUrl}
          alt={name}
          fill
          unoptimized={imageUrl?.startsWith("data:")}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-3 group-hover:scale-[1.04] transition-transform duration-500"
        />

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
      </Link>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/menu/${slug}`} className="block group-hover:text-primary transition-colors">
            <h3 className="font-extrabold text-gray-900 text-sm leading-snug line-clamp-2">
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
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-black text-primary">
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
            className={`p-2.5 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer ${
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
