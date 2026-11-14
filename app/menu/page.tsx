import React from "react";
import prisma from "@/lib/prisma";
import MenuClient from "./MenuClient";

export const dynamic = "force-dynamic";


interface MenuItem {
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

export default async function MenuPage() {
  let categories: { id: string; name: string; slug: string }[] = [
    { id: "all", name: "Tất cả món", slug: "all" },
  ];
  let products: MenuItem[] = [];

  try {
    const [dbCategories, dbProducts] = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.product.findMany({
        where: { isAvailable: true },
        include: { category: true },
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    categories = [
      { id: "all", name: "Tất cả món", slug: "all" },
      ...dbCategories.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    ];

    products = dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.shortDescription,
      price: Number(p.price),
      salePrice: p.salePrice ? Number(p.salePrice) : null,
      imageUrl: p.imageUrl,
      categoryId: p.category.slug,
      isBestSeller: p.isBestSeller,
      isNew: p.isNew,
      isAvailable: p.isAvailable,
    }));
  } catch (error) {
    console.warn("Using fallback menu data:", error);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <MenuClient initialCategories={categories} initialProducts={products} />
    </div>
  );
}
