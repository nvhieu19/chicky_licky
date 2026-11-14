"use client";

import React, { useState } from "react";
import { Heart, Share2, Check } from "lucide-react";

export default function ProductShareButtons() {
  const [liked, setLiked] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex items-center gap-2 text-gray-400">
      <button
        type="button"
        onClick={() => setLiked(!liked)}
        className={`p-2 rounded-full transition-colors cursor-pointer ${
          liked ? "bg-red-50 text-primary" : "hover:bg-gray-100"
        }`}
        title="Yêu thích"
      >
        <Heart className={`w-5 h-5 ${liked ? "fill-current text-primary" : ""}`} />
      </button>
      <button
        type="button"
        onClick={handleShare}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
        title="Chia sẻ"
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Share2 className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
