import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, Flame, Sparkles, Utensils } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BrandStoryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-bold text-gray-700 hover:text-primary hover:border-primary transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại</span>
        </Link>
      </div>

      {/* Main Story Container */}
      <div className="bg-white rounded-3xl p-6 sm:p-12 border border-gray-100 shadow-sm space-y-8">
        {/* Title */}
        <div className="text-center space-y-2 border-b border-gray-100 pb-6">
          <span className="text-xs font-black text-secondary uppercase tracking-widest">
            Câu chuyện thương hiệu
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            GIỚI THIỆU VỀ CHICKY LICKY VIỆT NAM
          </h1>
          <p className="text-xs text-gray-500 font-medium max-w-lg mx-auto">
            Thế giới gà rán pop giòn rụm, cơm gà dẻo thơm, khoai tây chiên vàng ruộm và các loại sốt gà đẫm vị bùng nổ vị giác.
          </p>
        </div>

        {/* Story Paragraphs */}
        <div className="space-y-5 text-xs sm:text-sm text-gray-600 leading-relaxed text-justify">
          <p>
            <strong className="text-gray-900 font-extrabold">Chicky Licky</strong> tự hào là thương hiệu ẩm thực đường phố và đồ ăn nhanh chuyên biệt, tập trung phát triển trọn vẹn 4 dòng sản phẩm cốt lõi:{" "}
            <strong className="text-primary font-bold">Gà Rán Pop giòn tan</strong>,{" "}
            <strong className="text-primary font-bold">Cơm Gà thơm ngon đượm vị</strong>,{" "}
            <strong className="text-primary font-bold">Khoai tây chiên vàng giòn</strong> và linh hồn không thể thiếu là{" "}
            <strong className="text-primary font-bold">Bộ sưu tập Sốt Gà đẫm vị độc quyền</strong>.
          </p>

          {/* 4 Core Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-black text-sm">
                <Flame className="w-4 h-4" />
                <span>Gà Rán Pop Giòn Rụm</span>
              </div>
              <p className="text-xs text-gray-600">
                Từng viên gà pop không xương được tẩm ướp đậm đà, chiên vàng ươm ở nhiệt độ chuẩn xác, giữ trọn độ ẩm ngọt mềm bên trong và lớp vỏ ngoài giòn rụm khó cưỡng.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-secondary-hover font-black text-sm">
                <Utensils className="w-4 h-4" />
                <span>Cơm Gà Nóng Hổi Đậm Đà</span>
              </div>
              <p className="text-xs text-gray-600">
                Hạt cơm dẻo thơm nấu cùng nước cốt thanh ngọt, kết hợp cùng gà sốt đậm vị và rau dưa tươi mát, tạo nên bữa ăn no bụng, cân bằng dinh dưỡng.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-secondary-hover font-black text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Khoai Tây Chiên Vàng Giòn</span>
              </div>
              <p className="text-xs text-gray-600">
                Khoai tây hảo hạng được cắt lát vừa vặn, chiên ráo dầu với lớp vỏ giòn rụm và độ bùi béo tự nhiên, là món ăn kèm hoàn hảo cho mọi cuộc vui.
              </p>
            </div>

            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-4 space-y-1.5">
              <div className="flex items-center gap-2 text-primary font-black text-sm">
                <Flame className="w-4 h-4" />
                <span>Sốt Gà Đẫm Vị Đặc Trưng</span>
              </div>
              <p className="text-xs text-gray-600">
                Công thức sốt độc quyền được nấu sánh mịn, phủ đều đẫm từng miếng gà: từ sốt cay ngọt Hàn Quốc, sốt phô mai béo ngậy, đến sốt bơ tỏi thơm lừng.
              </p>
            </div>
          </div>

          <p>
            Với cam kết sử dụng nguồn nguyên liệu thịt gà tươi sạch 100% được kiểm định gắt gao mỗi ngày, Chicky Licky không ngừng hoàn thiện quy trình chế biến khép kín nhằm bảo đảm an toàn vệ sinh thực phẩm tối đa cho từng bữa ăn của quý khách.
          </p>

          {/* Quality Badges */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-2.5 text-xs font-bold text-gray-800">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>Thịt gà tươi 100% mỗi ngày, không sử dụng chất bảo quản gây hại</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>Quy trình chế biến khép kín chuẩn vệ sinh an toàn thực phẩm (RVA HACCP)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>Hệ thống quản lý chất lượng đạt tiêu chuẩn quốc tế ISO 9001</span>
            </div>
          </div>

          <p>
            Dù bạn ghé trực tiếp cửa hàng thưởng thức hay đặt giao hàng tận nơi qua website, Chicky Licky luôn sẵn sàng phục vụ nhanh chóng trong 10 phút với những phần gà pop và cơm gà nóng hổi, giòn rụm và đẫm sốt nhất!
          </p>
        </div>

        {/* Company Info Box & Storefront Image */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-gray-100">
          {/* Storefront Image */}
          <div className="md:col-span-6 relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <Image
              src="/brand.png"
              alt="Nhà hàng Chicky Licky"
              fill
              className="object-cover"
            />
          </div>

          {/* Legal / Company text */}
          <div className="md:col-span-6 flex flex-col justify-center space-y-3">
            <h3 className="text-base font-black text-primary tracking-tight">
              VIETNAM CHICKY LICKY CO.LTD
            </h3>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p>
                <strong className="text-gray-800">Địa chỉ:</strong> 167 Hà Huy Tập, Thanh Khê, Đà Nẵng
              </p>
              <p>
                <strong className="text-gray-800">Điện thoại:</strong>{" "}
                <a href="tel:0789924777" className="hover:text-primary">078 992 4777</a>
              </p>
              <p>
                <strong className="text-gray-800">Email:</strong>{" "}
                <a href="mailto:info.chickylicky@gmail.com" className="hover:text-primary">
                  info.chickylicky@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
