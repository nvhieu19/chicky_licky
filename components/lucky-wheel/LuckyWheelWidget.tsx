"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Image from "next/image";
import { Gift, Loader2, LockKeyhole, Sparkles, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthModal } from "@/components/providers/AuthModalContext";

type WheelPrize = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string;
  winRateBps: number;
  claimInstruction: string | null;
};

type WheelDraw = {
  id: string;
  resultType: "PRIZE" | "NO_PRIZE";
  prizeName: string;
  prizeImage: string | null;
  winRateBps: number;
  claimInstruction?: string;
  createdAt: string;
  prizeId?: string | null;
};

type WheelStatus = {
  enabled: boolean;
  showFloatingWidget: boolean;
  requiresLogin: boolean;
  isEligible: boolean;
  hasDrawn: boolean;
  draw: WheelDraw | null;
  settings: {
    title: string;
    subtitle: string;
    noPrizeMessage: string;
    defaultClaimInstruction?: string;
  } | null;
  prizes: WheelPrize[];
  noPrizeBps: number;
};

type WheelSegment = {
  id: string;
  name: string;
  imageUrl: string | null;
  weight: number;
  prize: WheelPrize | null;
};

const colors = ["#c8102e", "#f7bd4c", "#e4553c", "#f5e2a8", "#8d1d2e", "#e8a82c"];

function pointAt(angle: number, radius: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: 180 + radius * Math.cos(radians),
    y: 180 + radius * Math.sin(radians),
  };
}

function formatRate(bps: number) {
  return `${(bps / 100).toLocaleString("vi-VN", {
    minimumFractionDigits: bps % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  })}%`;
}

export default function LuckyWheelWidget() {
  const pathname = usePathname();
  const { currentUser, isLoading: authLoading, openLogin } = useAuthModal();
  const [status, setStatus] = useState<WheelStatus | null>(null);
  const [open, setOpen] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [animationSegments, setAnimationSegments] = useState<WheelSegment[] | null>(null);
  const [result, setResult] = useState<WheelDraw | null>(null);
  const [pendingResult, setPendingResult] = useState<WheelDraw | null>(null);
  const [error, setError] = useState("");
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refreshStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const response = await fetch("/api/lucky-wheel/status", { cache: "no-store" });
      if (!response.ok) throw new Error("Không thể tải trạng thái vòng quay.");
      const data = (await response.json()) as WheelStatus;
      setStatus(data);
      setResult(data.draw);
    } catch (loadError) {
      console.error("Lucky wheel widget status error:", loadError);
      setError("Không thể tải vòng quay lúc này. Vui lòng thử lại.");
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || pathname.startsWith("/admin")) return;
    void refreshStatus();
  }, [authLoading, currentUser?.id, currentUser?.role, pathname, refreshStatus]);

  useEffect(() => {
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  const segments = useMemo<WheelSegment[]>(() => {
    if (!status) return [];
    const prizeSegments: WheelSegment[] = status.prizes
      .filter((prize) => prize.winRateBps > 0)
      .map((prize) => ({
        id: prize.id,
        name: prize.name,
        imageUrl: prize.imageUrl,
        weight: prize.winRateBps,
        prize,
      }));
    if (status.noPrizeBps > 0) {
      prizeSegments.push({
        id: "no-prize",
        name: "Chúc bạn may mắn lần sau",
        imageUrl: null,
        weight: status.noPrizeBps,
        prize: null,
      });
    }
    return prizeSegments;
  }, [status]);

  const onTransitionEnd = () => {
    if (!spinning || !pendingResult) return;
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    setSpinning(false);
    setResult(pendingResult);
    setPendingResult(null);
  };

  const closeModal = () => {
    if (!spinning) setOpen(false);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open && !spinning) setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, spinning]);

  const spin = async () => {
    if (spinning || !status?.isEligible || !currentUser || currentUser.role !== "USER") {
      return;
    }
    setError("");
    setSpinning(true);
    try {
      const response = await fetch("/api/lucky-wheel/spin", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setSpinning(false);
        setPendingResult(null);
        setError(data.message || "Không thể thực hiện lượt quay.");
        await refreshStatus();
        return;
      }

      const draw = data.draw as WheelDraw;
      if (data.replayed || !Array.isArray(data.wheelSegments)) {
        setSpinning(false);
        setPendingResult(null);
        setResult(draw);
        await refreshStatus();
        return;
      }

      const currentPrizes = new Map(status.prizes.map((prize) => [prize.id, prize]));
      const spinSegments: WheelSegment[] = data.wheelSegments.map(
        (segment: { id: string; name: string; imageUrl: string | null; weight: number }) => ({
          id: segment.id,
          name: segment.name,
          imageUrl: segment.imageUrl,
          weight: segment.weight,
          prize:
            segment.id === "no-prize"
              ? null
              : currentPrizes.get(segment.id) ?? {
                  id: segment.id,
                  name: segment.name,
                  description: null,
                  imageUrl: segment.imageUrl ?? "",
                  winRateBps: segment.weight,
                  claimInstruction: null,
                },
        })
      );
      setAnimationSegments(spinSegments);
      const selectedIndex = spinSegments.findIndex((segment) =>
        draw.resultType === "NO_PRIZE"
          ? segment.id === "no-prize"
          : segment.id === draw.prizeId
      );
      if (selectedIndex < 0 || !spinSegments.length) {
        setSpinning(false);
        setPendingResult(null);
        setResult(draw);
        await refreshStatus();
        return;
      }

      const totalWeight = spinSegments.reduce((sum, segment) => sum + segment.weight, 0);
      const previousWeight = spinSegments
        .slice(0, selectedIndex)
        .reduce((sum, segment) => sum + segment.weight, 0);
      const midpoint =
        ((previousWeight + spinSegments[selectedIndex].weight / 2) / totalWeight) * 360;
      const target = rotation + 6 * 360 + ((360 - midpoint) % 360);
      const finalResult = {
        ...draw,
        claimInstruction:
          draw.claimInstruction ||
          spinSegments[selectedIndex].prize?.claimInstruction ||
          status.settings?.defaultClaimInstruction ||
          "",
      };
      setPendingResult(finalResult);
      setRotation(target);
      fallbackTimer.current = setTimeout(() => {
        setSpinning(false);
        setResult(finalResult);
        setPendingResult(null);
      }, 6100);
      setStatus((current) =>
        current ? { ...current, isEligible: false, hasDrawn: true } : current
      );
    } catch (spinError) {
      console.error("Lucky wheel spin request error:", spinError);
      setSpinning(false);
      setPendingResult(null);
      setError("Kết nối bị gián đoạn. Hãy tải lại trạng thái trước khi thử lại.");
      await refreshStatus();
    }
  };

  if (
    authLoading ||
    pathname.startsWith("/admin") ||
    !status?.enabled ||
    !status.showFloatingWidget ||
    currentUser?.role === "ADMIN"
  ) {
    return null;
  }

  const renderWheel = () => {
    let startAngle = 0;
    const visibleSegments = animationSegments ?? segments;
    return (
      <div className="lucky-wheel-frame">
        <div className="lucky-wheel-pointer" aria-hidden="true" />
        <svg
          viewBox="0 0 360 360"
          role="img"
          aria-label="Vòng quay may mắn với các phần thưởng theo tỷ lệ thực tế"
          className="lucky-wheel-svg"
          style={{ transform: `rotate(${rotation}deg)` }}
          onTransitionEnd={onTransitionEnd}
        >
          <circle cx="180" cy="180" r="176" fill="#6b3314" />
          <circle cx="180" cy="180" r="170" fill="#f3d37b" />
          <circle cx="180" cy="180" r="162" fill="#fff5da" />
          {visibleSegments.map((segment, index) => {
            const span = (segment.weight / 10_000) * 360;
            const endAngle = startAngle + span;
            const start = pointAt(startAngle, 157);
            const end = pointAt(endAngle, 157);
            const largeArc = span > 180 ? 1 : 0;
            const path = [
              span >= 359.999
                ? `M 180 180 L ${start.x} ${start.y} A 157 157 0 1 1 180 337 A 157 157 0 1 1 ${start.x} ${start.y} Z`
                : `M 180 180 L ${start.x} ${start.y} A 157 157 0 ${largeArc} 1 ${end.x} ${end.y} Z`,
            ].join(" ");
            const midAngle = startAngle + span / 2;
            const textPoint = pointAt(midAngle, 111);
            const imagePoint = pointAt(midAngle, 139);
            const displayName =
              segment.name.length > 16 ? `${segment.name.slice(0, 15)}…` : segment.name;
            const showLabel = span >= 9;
            startAngle = endAngle;
            return (
              <g key={segment.id}>
                <path
                  d={path}
                  fill={colors[index % colors.length]}
                  stroke="#ffedba"
                  strokeWidth="1.5"
                />
                {segment.imageUrl && span > 15 && (
                  <image
                    href={segment.imageUrl}
                    x={imagePoint.x - 12}
                    y={imagePoint.y - 12}
                    width="24"
                    height="24"
                    preserveAspectRatio="xMidYMid slice"
                  />
                )}
                {showLabel && (
                  <text
                    x={textPoint.x}
                    y={textPoint.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${midAngle}, ${textPoint.x}, ${textPoint.y})`}
                    fill={index % 2 === 1 ? "#4b2511" : "#fff8e4"}
                    fontSize={span < 18 ? 6 : span < 32 ? 7 : 9}
                    fontWeight="800"
                  >
                    {displayName}
                  </text>
                )}
              </g>
            );
          })}
          <circle cx="180" cy="180" r="35" fill="#fff7df" stroke="#e7b74e" strokeWidth="6" />
          <image
            href="/logo.png"
            x="157"
            y="157"
            width="46"
            height="46"
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
      </div>
    );
  };

  return (
    <>
      <button
        type="button"
        className="lucky-wheel-float"
        onClick={() => {
          setOpen(true);
          setError("");
        }}
        aria-label={
          status.hasDrawn
            ? "Xem lại phần thưởng vòng quay"
            : currentUser
              ? "Mở vòng quay may mắn, bạn có một lượt quay"
              : "Mở vòng quay may mắn"
        }
      >
        <span className="lucky-wheel-float-orbit" />
        <span className="lucky-wheel-float-icon">
          <Gift aria-hidden="true" />
        </span>
        <span className="lucky-wheel-float-copy">
          <strong>QUÀ TẶNG MAY MẮN</strong>
          <small>{status.hasDrawn ? "Xem phần quà" : "1 LƯỢT QUAY"}</small>
        </span>
        <Sparkles className="lucky-wheel-float-spark" aria-hidden="true" />
      </button>

      {open && (
        <div
          className="lucky-wheel-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section
            className="lucky-wheel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lucky-wheel-title"
          >
            <button
              type="button"
              onClick={closeModal}
              disabled={spinning}
              className="lucky-wheel-close"
              aria-label="Đóng vòng quay"
            >
              <X />
            </button>
            <div className="lucky-wheel-heading">
              <span className="lucky-wheel-eyebrow">
                <Sparkles size={14} /> CHICKY LICKY CLUB
              </span>
              <h2 id="lucky-wheel-title">{status.settings?.title ?? "VÒNG QUAY MAY MẮN"}</h2>
              <p>{status.settings?.subtitle}</p>
            </div>

            {loadingStatus && !status ? (
              <div className="lucky-wheel-loading">
                <Loader2 className="animate-spin" /> Đang tải vòng quay...
              </div>
            ) : (
              <>
                <div className="lucky-wheel-stage">
                  {renderWheel()}
                  <div className="lucky-wheel-ornament" aria-hidden="true">
                    <Sparkles />
                  </div>
                </div>

                {result ? (
                  <div className="lucky-wheel-result">
                    {result.resultType === "PRIZE" && (
                      <div className="lucky-wheel-confetti" aria-hidden="true">
                        {Array.from({ length: 18 }, (_, index) => (
                          <i
                            key={index}
                            style={{
                              "--confetti-index": index,
                              left: `${(index * 47) % 97}%`,
                            } as CSSProperties & { "--confetti-index": number }}
                          />
                        ))}
                      </div>
                    )}
                    <p className="lucky-wheel-result-kicker">
                      {result.resultType === "PRIZE" ? "CHÚC MỪNG BẠN!" : "CẢM ƠN BẠN ĐÃ THAM GIA"}
                    </p>
                    <h3>
                      {result.resultType === "PRIZE"
                        ? `Bạn đã nhận được ${result.prizeName}`
                        : result.prizeName}
                    </h3>
                    {result.prizeImage && (
                      <Image
                        src={result.prizeImage}
                        alt={result.prizeName}
                        width={92}
                        height={92}
                        unoptimized
                      />
                    )}
                    <p className="lucky-wheel-result-message">
                      {result.resultType === "PRIZE"
                        ? result.claimInstruction ||
                          status.settings?.defaultClaimInstruction ||
                          "Vui lòng liên hệ cửa hàng để nhận phần thưởng."
                        : status.settings?.noPrizeMessage}
                    </p>
                    <button type="button" className="lucky-wheel-primary" onClick={closeModal}>
                      ĐÓNG
                    </button>
                  </div>
                ) : (
                  <div className="lucky-wheel-controls">
                    {currentUser?.role === "USER" && status.isEligible ? (
                      <button
                        type="button"
                        className="lucky-wheel-primary"
                        disabled={spinning}
                        onClick={spin}
                      >
                        {spinning ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        {spinning ? "ĐANG QUAY..." : "QUAY NGAY"}
                      </button>
                    ) : !currentUser ? (
                      <button
                        type="button"
                        className="lucky-wheel-primary"
                        onClick={openLogin}
                      >
                        <LockKeyhole /> ĐĂNG NHẬP NGAY
                      </button>
                    ) : (
                      <p className="lucky-wheel-used">
                        <Gift /> Lượt quay đã được sử dụng cho tài khoản này.
                      </p>
                    )}
                    <p className="lucky-wheel-help">
                      {currentUser
                        ? "Mỗi tài khoản có duy nhất một lượt quay."
                        : "Đăng nhập để kiểm tra và sử dụng lượt quay may mắn."}
                    </p>
                    {error && <p className="lucky-wheel-error">{error}</p>}
                  </div>
                )}

                <div className="lucky-wheel-legend">
                  <span>PHẦN THƯỞNG CÓ THỂ NHẬN</span>
                  <div>
                    {status.prizes.map((prize) => (
                      <span key={prize.id}>
                        <Image
                          src={prize.imageUrl}
                          alt=""
                          width={25}
                          height={25}
                          unoptimized
                        />
                        <b>{prize.name}</b>
                        <small>{formatRate(prize.winRateBps)}</small>
                      </span>
                    ))}
                    <span>
                      <i className="lucky-wheel-no-prize-dot" />
                      <b>May mắn lần sau</b>
                      <small>{formatRate(status.noPrizeBps)}</small>
                    </span>
                    {!status.prizes.length && (
                      <p>Hiện chưa có phần thưởng khả dụng.</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
