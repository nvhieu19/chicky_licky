import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ShieldCheck } from "lucide-react";
import prisma from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";
import ProductCard from "@/components/products/ProductCard";
import ProductShareButtons from "@/components/products/ProductShareButtons";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

interface DetailProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  description?: string | null;
  price: number;
  salePrice?: number | null;
  imageUrl: string;
  categoryId?: string;
  categoryName?: string;
  categorySlug?: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  isAvailable?: boolean;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  let product: DetailProduct | null = null;
  let relatedProducts: any[] = [];

  try {
    const dbProduct = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (dbProduct) {
      product = {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        shortDescription: dbProduct.shortDescription,
        description: dbProduct.description,
        price: Number(dbProduct.price),
        salePrice: dbProduct.salePrice ? Number(dbProduct.salePrice) : null,
        imageUrl: dbProduct.imageUrl,
        categoryId: dbProduct.categoryId,
        categoryName: dbProduct.category.name,
        categorySlug: dbProduct.category.slug,
        isBestSeller: dbProduct.isBestSeller,
        isNew: dbProduct.isNew,
        isAvailable: dbProduct.isAvailable,
      };

      const dbRelated = await prisma.product.findMany({
        where: {
          categoryId: dbProduct.categoryId,
          id: { not: dbProduct.id },
          isAvailable: true,
        },
        take: 4,
      });

      relatedProducts = dbRelated.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : null,
        imageUrl: p.imageUrl,
        isBestSeller: p.isBestSeller,
        isNew: p.isNew,
      }));
    }
  } catch (error) {
    console.warn("Database lookup error for product detail:", error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 px-4 pb-24 py-6 sm:px-6 sm:py-8 sm:pb-8 lg:px-8">
      {/* Back button */}
      <div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại thực đơn
        </Link>
      </div>

      {/* Product Detail Layout */}
      <div className="liquid-glass grid grid-cols-1 gap-6 rounded-3xl p-4 sm:gap-8 sm:p-8 md:grid-cols-12 lg:gap-12 lg:p-10">
        {/* Left: Product Image */}
        <div className="md:col-span-6 flex flex-col justify-center">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 shadow-inner">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              unoptimized={product.imageUrl?.startsWith("data:")}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 sm:p-8"
            />
            {product.isBestSeller && (
              <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-black uppercase rounded-lg shadow-md tracking-wider">
                Best Seller
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 bg-secondary/30 text-gray-900 rounded-full text-xs font-black uppercase tracking-wider">
                {product.categoryName}
              </span>
              <ProductShareButtons />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {product.shortDescription}
              </p>
            )}

            <div className="pt-2 pb-4 border-y border-gray-100">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-2">
                Mô tả chi tiết
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description ||
                  "Món ăn được chế biến từ những nguyên liệu tươi ngon nhất, tẩm ướp gia vị độc quyền của Chicky Licky mang đến trải nghiệm vị giác giòn rụm bên ngoài và mềm mọng bên trong."}
              </p>
            </div>
          </div>

          {/* Interactive Buy Section */}
          <ProductDetailClient product={product} />

          {/* Trust points */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-secondary-hover shrink-0" />
              <span>Giao hàng nóng hổi 10 phút</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              <span>Chứng nhận HACCP an toàn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-primary rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              GỢI Ý CÙNG DANH MỤC
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                slug={p.slug}
                shortDescription={p.shortDescription}
                price={p.price}
                salePrice={p.salePrice}
                imageUrl={p.imageUrl}
                isBestSeller={p.isBestSeller}
                isNew={p.isNew}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
