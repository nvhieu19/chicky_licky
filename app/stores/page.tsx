import React from "react";
import Image from "next/image";
import { MapPin, Phone, Clock, Navigation } from "lucide-react";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  let stores: any[] = [];
  try {
    const dbStores = await prisma.store.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    stores = dbStores.map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      phone: s.phone,
      openingHours: s.openingHours,
      imageUrl: s.imageUrl || null,
    }));
  } catch (err) {
    console.warn("Stores lookup error:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-black text-secondary uppercase tracking-widest">
          Hệ thống cửa hàng
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
          TÌM CỬA HÀNG GẦN BẠN
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Ghé ngay cửa hàng Chicky Licky gần nhất để thưởng thức gà giòn nóng hổi trong không gian hiện đại, mát lạnh.
        </p>
      </div>

      {/* Empty state */}
      {stores.length === 0 ? (
        <div className="py-20 text-center text-gray-400 space-y-3">
          <MapPin className="w-12 h-12 mx-auto text-gray-200" />
          <p className="font-bold text-sm">Chưa có cửa hàng nào được thêm</p>
          <p className="text-xs">Hệ thống cửa hàng đang được cập nhật. Vui lòng quay lại sau.</p>
        </div>
      ) : (
        /* Stores Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col sm:flex-row"
            >
              <div className="relative w-full sm:w-48 aspect-video sm:aspect-auto shrink-0 bg-gray-100">
                {store.imageUrl ? (
                  <Image
                    src={store.imageUrl}
                    alt={store.name}
                    fill
                    unoptimized={store.imageUrl?.startsWith("data:")}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
                    <MapPin className="w-10 h-10 text-primary/30" />
                  </div>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-0.5 bg-red-50 text-primary text-[10px] font-black rounded-full uppercase">
                    Đang mở cửa
                  </span>
                  <h3 className="text-base font-black text-gray-900">{store.name}</h3>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-secondary-hover shrink-0" />
                      <span>Giờ mở cửa: {store.openingHours}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Chỉ đường trên Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
