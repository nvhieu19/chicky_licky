import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number | string | { toString: () => string }): string {
  const numeric = typeof amount === "number" ? amount : Number(amount.toString());
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(numeric);
}

export function formatVNDShort(amount: number | string | { toString: () => string }): string {
  const numeric = typeof amount === "number" ? amount : Number(amount.toString());
  if (numeric >= 1000) {
    const k = numeric / 1000;
    return `${k}K`;
  }
  return `${numeric}đ`;
}

export function generateOrderCode(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `CL${timestamp}${random}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
