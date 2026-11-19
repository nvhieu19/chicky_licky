import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "white";
  showSlogan?: boolean;
  href?: string;
  className?: string;
  sloganClassName?: string;
  imageSrc?: string;
}

export default function BrandLogo({
  size = "md",
  variant = "default",
  showSlogan = true,
  href = "/",
  className = "",
  sloganClassName = "",
  imageSrc = "/logo.png",
}: BrandLogoProps) {
  const isWhite = variant === "white";
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const sizeStyles = {
    sm: {
      badge: "w-8 h-8 rounded-xl text-base",
      title: "text-lg",
      slogan: "text-[9px]",
    },
    md: {
      badge: "w-10 h-10 rounded-2xl text-xl",
      title: "text-xl sm:text-2xl",
      slogan: "text-[10px]",
    },
    lg: {
      badge: "w-12 h-12 rounded-2xl text-2xl",
      title: "text-2xl sm:text-3xl",
      slogan: "text-xs",
    },
  }[size];

  const content = (
    <div className={`flex items-center gap-2.5 shrink-0 ${className}`}>
      <div
        className={`${sizeStyles.badge} relative overflow-hidden bg-primary flex items-center justify-center text-white font-black shadow-md shadow-red-200/50 shrink-0 select-none`}
      >
        {(!imageSrc || imageFailed || !imageLoaded) && "CL"}
        {imageSrc && !imageFailed && (
          <Image
            src={imageSrc}
            alt="Chicky Licky"
            fill
            sizes="48px"
            className="object-contain"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
          />
        )}
      </div>

      <div className="flex flex-col">
        <span
          className={`${sizeStyles.title} font-black tracking-tight leading-none ${
            isWhite ? "text-white" : "text-primary"
          }`}
        >
          CHICKY LICKY
        </span>
        {showSlogan && (
          <span
            className={`${sizeStyles.slogan} font-black tracking-widest uppercase mt-0.5 ${sloganClassName} ${
              isWhite ? "text-secondary" : "text-secondary-hover"
            }`}
          >
            LƯỚT WEB CHỌN MÓN - TRỌN VẸN CUỘC VUI
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
