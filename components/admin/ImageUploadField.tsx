"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Upload, Link as LinkIcon, X, Loader2 } from "lucide-react";

interface ImageUploadFieldProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
  helperText?: string;
  idPrefix?: string;
}

export default function ImageUploadField({
  label = "Hình ảnh",
  value,
  onChange,
  required = false,
  helperText = "Hỗ trợ JPG, PNG, WEBP (Tự động nén & lưu trực tiếp vào database)",
  idPrefix = "upload",
}: ImageUploadFieldProps) {
  const [source, setSource] = useState<"upload" | "url">("upload");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync source when value is set externally (e.g., editing existing record)
  React.useEffect(() => {
    if (value && !value.startsWith("data:")) {
      setSource("url");
    } else if (!value) {
      setSource("upload");
    }
  }, [value]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Vui lòng chọn file hình ảnh hợp lệ (JPG, PNG, WEBP)");
      return;
    }

    setError(null);
    setProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_DIMENSION = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = Math.round(width);
        canvas.height = Math.round(height);
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        onChange(dataUrl);
        setProcessing(false);
      };
      img.onerror = () => {
        setProcessing(false);
        setError("Không thể đọc file ảnh này");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const inputId = `${idPrefix}-file-input`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700 uppercase">
          {label} {required && <span className="text-primary">*</span>}
        </label>
        <div className="flex items-center gap-1.5 text-[11px]">
          <button
            type="button"
            onClick={() => setSource("upload")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              source === "upload"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Tải từ máy tính</span>
          </button>
          <button
            type="button"
            onClick={() => setSource("url")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              source === "url"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            <span>Nhập link URL</span>
          </button>
        </div>
      </div>

      {source === "upload" ? (
        <div className="space-y-2">
          <div className="border-2 border-dashed border-gray-200 hover:border-primary/50 rounded-2xl p-4 transition-colors text-center bg-gray-50/50">
            <input
              type="file"
              id={inputId}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor={inputId}
              className="flex flex-col items-center justify-center cursor-pointer space-y-2 py-1"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 text-primary flex items-center justify-center">
                {processing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-primary hover:underline">
                  {processing ? "Đang xử lý ảnh..." : "Nhấn để chọn ảnh từ máy tính"}
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">{helperText}</p>
              </div>
            </label>
          </div>
          {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:border-primary"
        />
      )}

      {/* Image Preview */}
      {value && (
        <div className="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-100">
            <Image
              src={value}
              alt="Preview"
              fill
              unoptimized={value.startsWith("data:")}
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-800 truncate">
              {value.startsWith("data:")
                ? "Ảnh từ máy tính (Sẽ lưu trực tiếp vào database)"
                : value}
            </p>
            <p className="text-[10px] text-green-600 font-medium">✓ Đã sẵn sàng lưu</p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
            title="Xóa ảnh"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
