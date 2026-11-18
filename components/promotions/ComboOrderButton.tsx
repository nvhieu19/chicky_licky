"use client";

import { useCart, CartProduct } from "@/components/providers/CartContext";
import { useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";

interface ComboItem {
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    salePrice: number | null;
    imageUrl: string;
  };
}

interface ComboOrderButtonProps {
  comboItems: ComboItem[];
  comboPrice: number;
  comboTitle: string;
  className?: string;
}

export default function ComboOrderButton({
  comboItems,
  comboPrice,
  comboTitle,
  className,
}: ComboOrderButtonProps) {
  const { addToCart, applyCoupon, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleOrder = () => {
    if (comboItems.length === 0) return;
    setLoading(true);

    // Tính tổng giá gốc các món trong combo
    const totalOriginalPrice = comboItems.reduce((sum, ci) => {
      const unitPrice = ci.product.salePrice ?? ci.product.price;
      return sum + unitPrice * ci.quantity;
    }, 0);

    // Xóa giỏ hàng cũ, thêm các món combo
    clearCart();

    for (const ci of comboItems) {
      const cartProduct: CartProduct = {
        id: ci.product.id,
        name: ci.product.name,
        slug: ci.product.slug,
        price: ci.product.price,
        salePrice: ci.product.salePrice,
        imageUrl: ci.product.imageUrl,
      };
      addToCart(cartProduct, ci.quantity);
    }

    // Áp dụng discount = chênh lệch giữa tổng giá gốc và giá combo
    const discountAmount = Math.max(0, totalOriginalPrice - comboPrice);
    if (discountAmount > 0) {
      applyCoupon({
        code: `COMBO_${comboTitle.toUpperCase().replace(/\s+/g, "_").slice(0, 20)}`,
        discountType: "FIXED",
        discountValue: discountAmount,
        maximumDiscount: discountAmount,
      });
    }

    setTimeout(() => {
      setLoading(false);
      router.push("/cart");
    }, 300);
  };

  const totalOriginal = comboItems.reduce((sum, ci) => {
    return sum + (ci.product.salePrice ?? ci.product.price) * ci.quantity;
  }, 0);

  const saving = Math.max(0, totalOriginal - comboPrice);

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      {saving > 0 && (
        <p className="text-xs text-green-600 font-bold text-center">
          🎉 Tiết kiệm {formatPrice(saving)} so với đặt riêng lẻ!
        </p>
      )}
      <button
        onClick={handleOrder}
        disabled={loading || comboItems.length === 0}
        className="w-full py-3 bg-primary hover:bg-primary-hover active:scale-95 text-white text-sm font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Đặt ngay Combo • {formatPrice(comboPrice)}</span>
          </>
        )}
      </button>
    </div>
  );
}
