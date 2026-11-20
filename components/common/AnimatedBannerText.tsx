import type { CSSProperties, ReactNode } from "react";

type AnimatedBannerTextProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

type BannerTypingStyle = CSSProperties & {
  "--banner-type-steps": number;
  "--banner-type-delay": string;
};

export default function AnimatedBannerText({
  children,
  className = "",
  delay = 0,
}: AnimatedBannerTextProps) {
  const text = typeof children === "string" ? children : "";

  return (
    <span
      className={`banner-typewriter ${className}`}
      style={
        {
          "--banner-type-steps": Math.max(Array.from(text).length, 1),
          "--banner-type-delay": `${delay}ms`,
        } as BannerTypingStyle
      }
    >
      {children}
    </span>
  );
}
