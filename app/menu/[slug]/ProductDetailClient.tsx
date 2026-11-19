"use client";

import React, { useState } from "react";
import { Plus, Minus, ShoppingBag, Check } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/components/providers/CartContext";

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number | null;
    imageUrl: string;
    categoryName?: string;
    isAvailable?: boolean;
    [key: string]: any;
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const currentPrice = product.salePrice ?? product.price;
  const totalPrice = currentPrice * quantity;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  const handleAddToCart = () => {
    if (!product.isAvailable) return;
    addToCart(
      {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        salePrice: product.salePrice,
        imageUrl: product.imageUrl,
        categoryName: product.categoryName,
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <>
    <div className="liquid-glass space-y-5 rounded-2xl p-4 sm:p-5">
      {/* Price section */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black text-primary">
          {formatPrice(currentPrice)}
        </span>
        {hasDiscount && (
          <span className="text-sm text-gray-400 line-through font-medium">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {/* Quantity & Add to Cart button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Counter */}
        <div className="flex items-center justify-between border border-gray-200 bg-white rounded-xl p-1 w-full sm:w-36 shadow-sm">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Giảm số lượng"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-black text-base text-gray-900 px-3">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Tăng số lượng"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!product.isAvailable}
          className={`flex-1 py-3.5 px-6 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            added
              ? "bg-green-600 text-white"
              : product.isAvailable
              ? "bg-primary hover:bg-primary-hover active:scale-[0.99] text-white shadow-lg shadow-red-200"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {added ? (
            <>
              <Check className="w-5 h-5" />
              <span>Đã thêm {quantity} phần vào giỏ!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-5 h-5" />
              <span>
                Thêm vào giỏ hàng • {formatPrice(totalPrice)}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
    <div className="product-detail-mobile-cta sm:hidden">
      <div className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Tổng cộng</span>
        <span className="block truncate text-base font-black text-primary">{formatPrice(totalPrice)}</span>
      </div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!product.isAvailable}
        className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl px-4 text-xs font-black text-white shadow-lg shadow-red-200/50 transition-all active:scale-[0.98] disabled:bg-gray-300 ${
          added ? "bg-green-600" : "bg-primary"
        }`}
      >
        {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
        {added ? "Đã thêm vào giỏ" : "Thêm vào giỏ"}
      </button>
    </div>
    </>
  );
}
