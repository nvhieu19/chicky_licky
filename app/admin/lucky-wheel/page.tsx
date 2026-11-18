"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import {
  Gift,
  History,
  Loader2,
  Plus,
  Save,
  Settings,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trophy,
  Users,
  X,
} from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";

type SettingsForm = {
  title: string;
  subtitle: string;
  noPrizeMessage: string;
  defaultClaimInstruction: string;
  isEnabled: boolean;
  showFloatingWidget: boolean;
};

type Prize = {
  id: string;
  name: string;
  type: "ITEM" | "EXTRA_SPIN";
  description: string | null;
  imageUrl: string;
  quantityTotal: number;
  quantityRemaining: number;
  winRateBps: number;
  claimInstruction: string | null;
  sortOrder: number;
  isActive: boolean;
  _count: { draws: number };
};

type PrizeForm = {
  name: string;
  type: "ITEM" | "EXTRA_SPIN";
  description: string;
  imageUrl: string;
  quantityTotal: string;
  winRate: string;
  claimInstruction: string;
  sortOrder: string;
  isActive: boolean;
};

type Draw = {
  id: string;
  resultType: "PRIZE" | "NO_PRIZE" | "EXTRA_SPIN";
  prizeNameSnapshot: string;
  prizeImageSnapshot: string | null;
  winRateBpsSnapshot: number;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

const initialSettings: SettingsForm = {
  title: "VÒNG QUAY MAY MẮN",
  subtitle: "Một cơ hội duy nhất - Một phần quà bất ngờ",
  noPrizeMessage: "Tiếc quá! Hẹn gặp bạn ở những ưu đãi tiếp theo của Chicky Licky.",
  defaultClaimInstruction: "",
  isEnabled: false,
  showFloatingWidget: false,
};

const emptyPrize: PrizeForm = {
  name: "",
  type: "ITEM",
  description: "",
  imageUrl: "",
  quantityTotal: "0",
  winRate: "0.00",
  claimInstruction: "",
  sortOrder: "0",
  isActive: true,
};

function formatRate(bps: number) {
  return `${(bps / 100).toLocaleString("vi-VN", {
    minimumFractionDigits: bps % 100 ? 2 : 0,
    maximumFractionDigits: 2,
  })}%`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function LuckyWheelAdminPage() {
  const [tab, setTab] = useState<"prizes" | "history" | "settings">("prizes");
  const [settings, setSettings] = useState<SettingsForm>(initialSettings);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [stats, setStats] = useState({
    totalDraws: 0,
    prizesAwarded: 0,
    noPrizeDraws: 0,
    remainingPrizes: 0,
    activePrizes: 0,
    participants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Prize | null>(null);
  const [form, setForm] = useState<PrizeForm>(emptyPrize);
  const [savingPrize, setSavingPrize] = useState(false);
  const [draws, setDraws] = useState<Draw[]>([]);
  const [drawTotal, setDrawTotal] = useState(0);
  const [drawPage, setDrawPage] = useState(1);
  const [historyFilter, setHistoryFilter] = useState({
    q: "",
    resultType: "",
    prizeId: "",
    from: "",
    to: "",
  });

  const totalWinRate = useMemo(
    () =>
      prizes
        .filter((prize) => prize.isActive)
        .reduce((sum, prize) => sum + prize.winRateBps, 0),
    [prizes]
  );
  const availableWinRate = useMemo(
    () =>
      prizes
        .filter(
          (prize) =>
            prize.isActive &&
            (prize.type === "EXTRA_SPIN" || prize.quantityRemaining > 0)
        )
        .reduce((sum, prize) => sum + prize.winRateBps, 0),
    [prizes]
  );
  const noPrizeRate = Math.max(0, 10_000 - availableWinRate);
  const ratesExceedLimit = totalWinRate > 10_000;

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [overviewResponse, prizesResponse] = await Promise.all([
        fetch("/api/admin/lucky-wheel", { cache: "no-store" }),
        fetch("/api/admin/lucky-wheel/prizes", { cache: "no-store" }),
      ]);
      const [overview, prizeData] = await Promise.all([
        overviewResponse.json(),
        prizesResponse.json(),
      ]);
      if (!overviewResponse.ok) throw new Error(overview.message || "Không thể tải cấu hình.");
      if (!prizesResponse.ok) throw new Error(prizeData.message || "Không thể tải phần thưởng.");
      setSettings({
        title: overview.settings.title,
        subtitle: overview.settings.subtitle,
        noPrizeMessage: overview.settings.noPrizeMessage,
        defaultClaimInstruction: overview.settings.defaultClaimInstruction,
        isEnabled: overview.settings.isEnabled,
        showFloatingWidget: overview.settings.showFloatingWidget,
      });
      setStats(overview.stats);
      setPrizes(prizeData.prizes);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDraws = useCallback(async () => {
    const params = new URLSearchParams({ page: String(drawPage), pageSize: "20" });
    Object.entries(historyFilter).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    try {
      const response = await fetch(`/api/admin/lucky-wheel/draws?${params}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể tải lịch sử quay.");
      setDraws(data.draws);
      setDrawTotal(data.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Không thể tải lịch sử quay.");
    }
  }, [drawPage, historyFilter]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (tab === "history") void loadDraws();
  }, [tab, loadDraws]);

  const openNewPrize = () => {
    setEditing(null);
    setForm(emptyPrize);
    setError("");
    setModalOpen(true);
  };

  const openEditPrize = (prize: Prize) => {
    setEditing(prize);
    setForm({
      name: prize.name,
      type: prize.type,
      description: prize.description ?? "",
      imageUrl: prize.imageUrl,
      quantityTotal: String(prize.quantityTotal),
      winRate: (prize.winRateBps / 100).toFixed(2),
      claimInstruction: prize.claimInstruction ?? "",
      sortOrder: String(prize.sortOrder),
      isActive: prize.isActive,
    });
    setError("");
    setModalOpen(true);
  };

  const saveSettings = async (event: FormEvent) => {
    event.preventDefault();
    setSavingSettings(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/lucky-wheel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể lưu cấu hình.");
      setNotice("Đã lưu cấu hình vòng quay.");
      await loadOverview();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu cấu hình.");
    } finally {
      setSavingSettings(false);
    }
  };

  const savePrize = async (event: FormEvent) => {
    event.preventDefault();
    const winRatePercent = Number(form.winRate);
    const winRateBps = Math.round(winRatePercent * 100);
    if (!Number.isFinite(winRatePercent) || winRatePercent < 0 || winRateBps / 100 !== winRatePercent) {
      setError("Tỷ lệ trúng phải là số từ 0 đến 100, tối đa 2 chữ số thập phân.");
      return;
    }

    setSavingPrize(true);
    setError("");
    try {
      const response = await fetch(
        editing
          ? `/api/admin/lucky-wheel/prizes/${editing.id}`
          : "/api/admin/lucky-wheel/prizes",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            type: form.type,
            description: form.description || null,
            imageUrl: form.imageUrl,
            quantityTotal: form.type === "ITEM" ? Number(form.quantityTotal) : 0,
            winRateBps,
            claimInstruction: form.claimInstruction || null,
            sortOrder: Number(form.sortOrder),
            isActive: form.isActive,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể lưu phần thưởng.");
      setModalOpen(false);
      setNotice(editing ? "Đã cập nhật phần thưởng." : "Đã thêm phần thưởng.");
      await loadOverview();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Không thể lưu phần thưởng.");
    } finally {
      setSavingPrize(false);
    }
  };

  const deactivatePrize = async (prize: Prize) => {
    if (!window.confirm(`Ngừng hoạt động phần thưởng “${prize.name}”? Lịch sử sẽ được giữ nguyên.`)) {
      return;
    }
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/lucky-wheel/prizes/${prize.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể ngừng phần thưởng.");
      setNotice(data.message);
      await loadOverview();
    } catch (deactivateError) {
      setError(deactivateError instanceof Error ? deactivateError.message : "Không thể ngừng phần thưởng.");
    }
  };

  const setSettingsValue = <K extends keyof SettingsForm>(
    key: K,
    value: SettingsForm[K]
  ) => setSettings((current) => ({ ...current, [key]: value }));

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Đang tải dữ liệu vòng quay...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-800">
            <Sparkles className="h-3.5 w-3.5" /> Chicky Licky Club
          </div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Vòng quay may mắn
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý phần thưởng, xác suất, lượt quay và cấu hình hiển thị.
          </p>
        </div>
        <button
          type="button"
          onClick={openNewPrize}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-900/10 transition hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> THÊM PHẦN THƯỞNG
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {notice}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Tổng lượt quay", value: stats.totalDraws, icon: History, color: "text-blue-600 bg-blue-50" },
          { label: "Phần thưởng đã phát", value: stats.prizesAwarded, icon: Trophy, color: "text-amber-600 bg-amber-50" },
          { label: "Lượt không trúng", value: stats.noPrizeDraws, icon: Sparkles, color: "text-rose-600 bg-rose-50" },
          { label: "Phần thưởng còn kho", value: stats.remainingPrizes, icon: Gift, color: "text-emerald-600 bg-emerald-50" },
          { label: "Khách hàng tham gia", value: stats.participants, icon: Users, color: "text-violet-600 bg-violet-50" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-gray-500">{item.label}</span>
                <span className={`grid h-9 w-9 place-items-center rounded-xl ${item.color}`}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <strong className="mt-3 block text-2xl font-black text-gray-900">
                {item.value.toLocaleString("vi-VN")}
              </strong>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap gap-1 border-b border-gray-100 px-4 pt-3">
          {[
            { id: "prizes", label: "Phần thưởng", icon: Gift },
            { id: "history", label: "Lịch sử quay", icon: History },
            { id: "settings", label: "Cấu hình", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                type="button"
                key={item.id}
                onClick={() => setTab(item.id as typeof tab)}
                className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition ${
                  tab === item.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </button>
            );
          })}
        </div>

        {tab === "prizes" && (
          <div className="space-y-4 p-4 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-emerald-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Tổng tỷ lệ trúng</span>
                <strong className="mt-1 block text-2xl font-black text-emerald-900">{formatRate(totalWinRate)}</strong>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Tỷ lệ không trúng (còn hàng)</span>
                <strong className="mt-1 block text-2xl font-black text-amber-900">{formatRate(noPrizeRate)}</strong>
              </div>
              <div className={`rounded-xl p-4 ${ratesExceedLimit ? "bg-red-50" : "bg-gray-50"}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Phần thưởng đang hoạt động</span>
                <strong className="mt-1 block text-2xl font-black text-gray-900">{stats.activePrizes}</strong>
                {ratesExceedLimit && <span className="text-xs font-bold text-red-600">Tổng tỷ lệ đang vượt 100%</span>}
              </div>
            </div>

            {totalWinRate > 10_000 && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                Tổng tỷ lệ vượt giới hạn 100%. Hãy chỉnh tỷ lệ trước khi kích hoạt vòng quay.
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400">
                    <th className="px-3 py-3 font-black">Phần thưởng</th>
                    <th className="px-3 py-3 font-black">Tồn kho</th>
                    <th className="px-3 py-3 font-black">Tỷ lệ trúng</th>
                    <th className="px-3 py-3 font-black">Đã phát</th>
                    <th className="px-3 py-3 font-black">Trạng thái</th>
                    <th className="px-3 py-3 text-right font-black">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {prizes.map((prize) => (
                    <tr key={prize.id} className="hover:bg-gray-50/60">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Image
                            src={prize.imageUrl}
                            alt=""
                            width={44}
                            height={44}
                            unoptimized
                            className="h-11 w-11 rounded-xl border border-gray-100 object-cover"
                          />
                          <div>
                            <strong className="block text-gray-900">{prize.name}</strong>
                            {prize.description && (
                              <span className="mt-0.5 block max-w-xs truncate text-[10px] text-gray-400">
                                {prize.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-bold text-gray-700">
                        {prize.type === "EXTRA_SPIN"
                          ? "Không giới hạn"
                          : <>
                              {prize.quantityRemaining.toLocaleString("vi-VN")}
                              <span className="font-normal text-gray-400"> / {prize.quantityTotal.toLocaleString("vi-VN")}</span>
                            </>}
                      </td>
                      <td className="px-3 py-3 font-black text-primary">{formatRate(prize.winRateBps)}</td>
                      <td className="px-3 py-3 font-bold text-gray-700">{prize._count.draws}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                          prize.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {prize.isActive ? "ĐANG HOẠT ĐỘNG" : "ĐÃ ẨN"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditPrize(prize)}
                            className="rounded-lg border border-gray-200 px-3 py-2 font-bold text-gray-700 hover:border-primary hover:text-primary"
                          >
                            Sửa
                          </button>
                          {prize.isActive && (
                            <button
                              type="button"
                              onClick={() => void deactivatePrize(prize)}
                              className="rounded-lg border border-red-100 px-3 py-2 font-bold text-red-600 hover:bg-red-50"
                            >
                              Ẩn
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!prizes.length && (
                    <tr>
                      <td colSpan={6} className="px-3 py-14 text-center text-sm text-gray-400">
                        Chưa có phần thưởng. Thêm phần thưởng đầu tiên để bắt đầu cấu hình.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-4 p-4 sm:p-6">
            <form
              className="grid gap-2 rounded-xl bg-gray-50 p-3 sm:grid-cols-2 xl:grid-cols-6"
              onSubmit={(event) => {
                event.preventDefault();
                setDrawPage(1);
              }}
            >
              <input
                value={historyFilter.q}
                onChange={(event) => setHistoryFilter((current) => ({ ...current, q: event.target.value }))}
                placeholder="Tên, email, phần thưởng..."
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs xl:col-span-2"
              />
              <select
                value={historyFilter.resultType}
                onChange={(event) => setHistoryFilter((current) => ({ ...current, resultType: event.target.value }))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
              >
                <option value="">Tất cả kết quả</option>
                <option value="PRIZE">Trúng thưởng</option>
                <option value="EXTRA_SPIN">Thêm lượt quay</option>
                <option value="NO_PRIZE">Không trúng</option>
              </select>
              <select
                value={historyFilter.prizeId}
                onChange={(event) => setHistoryFilter((current) => ({ ...current, prizeId: event.target.value }))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
              >
                <option value="">Tất cả phần thưởng</option>
                {prizes.map((prize) => <option key={prize.id} value={prize.id}>{prize.name}</option>)}
              </select>
              <input
                type="date"
                value={historyFilter.from}
                onChange={(event) => setHistoryFilter((current) => ({ ...current, from: event.target.value }))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
                aria-label="Từ ngày"
              />
              <input
                type="date"
                value={historyFilter.to}
                onChange={(event) => setHistoryFilter((current) => ({ ...current, to: event.target.value }))}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
                aria-label="Đến ngày"
              />
              <button type="submit" className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white xl:col-span-6">
                LỌC LỊCH SỬ
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-400">
                    <th className="px-3 py-3 font-black">Khách hàng</th>
                    <th className="px-3 py-3 font-black">Phần thưởng</th>
                    <th className="px-3 py-3 font-black">Kết quả</th>
                    <th className="px-3 py-3 font-black">Tỷ lệ lúc quay</th>
                    <th className="px-3 py-3 font-black">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {draws.map((draw) => (
                    <tr key={draw.id}>
                      <td className="px-3 py-3">
                        <strong className="block text-gray-900">{draw.user.name}</strong>
                        <span className="text-[10px] text-gray-400">{draw.user.email}</span>
                      </td>
                      <td className="px-3 py-3 font-bold text-gray-700">{draw.prizeNameSnapshot}</td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
                          draw.resultType !== "NO_PRIZE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {draw.resultType === "EXTRA_SPIN"
                            ? "THÊM LƯỢT QUAY"
                            : draw.resultType === "PRIZE"
                              ? "TRÚNG THƯỞNG"
                              : "KHÔNG TRÚNG"}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-gray-700">
                        {draw.resultType !== "NO_PRIZE"
                          ? formatRate(draw.winRateBpsSnapshot)
                          : "—"}
                      </td>
                      <td className="px-3 py-3 text-gray-500">{formatDate(draw.createdAt)}</td>
                    </tr>
                  ))}
                  {!draws.length && (
                    <tr><td colSpan={5} className="px-3 py-12 text-center text-gray-400">Chưa có lượt quay phù hợp.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{drawTotal.toLocaleString("vi-VN")} lượt quay</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={drawPage <= 1}
                  onClick={() => setDrawPage((page) => page - 1)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-bold disabled:opacity-40"
                >
                  Trước
                </button>
                <span>Trang {drawPage} / {Math.max(1, Math.ceil(drawTotal / 20))}</span>
                <button
                  type="button"
                  disabled={drawPage >= Math.ceil(drawTotal / 20)}
                  onClick={() => setDrawPage((page) => page + 1)}
                  className="rounded-lg border border-gray-200 px-3 py-2 font-bold disabled:opacity-40"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "settings" && (
          <form onSubmit={saveSettings} className="max-w-3xl space-y-5 p-4 sm:p-6">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
              Tắt tính năng chỉ ngăn lượt quay mới và ẩn widget. Lịch sử cùng phần thưởng đã phát luôn được giữ nguyên.
            </div>
            <ToggleSetting
              title="Kích hoạt hệ thống vòng quay"
              description="Cho phép khách hàng đủ điều kiện thực hiện lượt quay."
              value={settings.isEnabled}
              onChange={(value) => setSettingsValue("isEnabled", value)}
            />
            <ToggleSetting
              title="Hiển thị widget trên website"
              description="Widget không hiển thị trong khu vực /admin."
              value={settings.showFloatingWidget}
              onChange={(value) => setSettingsValue("showFloatingWidget", value)}
            />
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-gray-700">Tiêu đề vòng quay</span>
              <input
                value={settings.title}
                onChange={(event) => setSettingsValue("title", event.target.value)}
                required
                maxLength={191}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-gray-700">Nội dung giới thiệu</span>
              <input
                value={settings.subtitle}
                onChange={(event) => setSettingsValue("subtitle", event.target.value)}
                maxLength={500}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-gray-700">Nội dung khi không trúng</span>
              <textarea
                value={settings.noPrizeMessage}
                onChange={(event) => setSettingsValue("noPrizeMessage", event.target.value)}
                required
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-gray-700">Hướng dẫn nhận thưởng mặc định</span>
              <textarea
                value={settings.defaultClaimInstruction}
                onChange={(event) => setSettingsValue("defaultClaimInstruction", event.target.value)}
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={savingSettings || ratesExceedLimit}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              LƯU CẤU HÌNH
            </button>
          </form>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm">
          <form
            onSubmit={savePrize}
            className="my-auto max-h-[96dvh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Quản lý phần thưởng</span>
                <h2 className="mt-1 text-xl font-black text-gray-900">
                  {editing ? "Chỉnh sửa phần thưởng" : "Thêm phần thưởng"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full bg-gray-100 p-2 text-gray-600"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {error && <p className="rounded-lg bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-bold text-gray-700">Loại phần thưởng *</span>
                <select
                  value={form.type}
                  onChange={(event) => {
                    const type = event.target.value as PrizeForm["type"];
                    setForm((current) => ({
                      ...current,
                      type,
                      name:
                        type === "EXTRA_SPIN" && !current.name.trim()
                          ? "Thêm 1 lượt quay"
                          : current.name,
                      quantityTotal:
                        type === "ITEM" && current.quantityTotal === "0"
                          ? "1"
                          : current.quantityTotal,
                    }));
                  }}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm"
                >
                  <option value="ITEM">Quà tặng thông thường</option>
                  <option value="EXTRA_SPIN">Thêm 1 lượt quay</option>
                </select>
                {form.type === "EXTRA_SPIN" && (
                  <small className="block text-[10px] text-gray-500">
                    Người trúng được quay thêm một lần; lượt quay thêm không thể nhận tiếp phần thưởng này.
                  </small>
                )}
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-bold text-gray-700">Tên phần thưởng *</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  maxLength={191}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm"
                />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-bold text-gray-700">Mô tả</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm"
                />
              </label>
              <div className="sm:col-span-2">
                <ImageUploadField
                  label="Ảnh phần thưởng"
                  value={form.imageUrl}
                  onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
                  required
                  idPrefix="lucky-wheel-prize"
                />
              </div>
              {form.type === "ITEM" && (
                <label className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-700">Tổng số lượng *</span>
                  <input
                    type="number"
                    min={editing?.type === "ITEM" ? editing.quantityTotal - editing.quantityRemaining : 0}
                    max={1_000_000}
                    step={1}
                    value={form.quantityTotal}
                    onChange={(event) => setForm((current) => ({ ...current, quantityTotal: event.target.value }))}
                    required
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm"
                  />
                  {editing?.type === "ITEM" && (
                    <small className="block text-[10px] text-gray-400">
                      Đã phát {editing.quantityTotal - editing.quantityRemaining}; số lượng tổng không thể thấp hơn.
                    </small>
                  )}
                </label>
              )}
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-gray-700">Tỷ lệ trúng (%) *</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={form.winRate}
                  onChange={(event) => setForm((current) => ({ ...current, winRate: event.target.value }))}
                  required
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm"
                />
              </label>
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-xs font-bold text-gray-700">Hướng dẫn nhận thưởng</span>
                <textarea
                  value={form.claimInstruction}
                  onChange={(event) => setForm((current) => ({ ...current, claimInstruction: event.target.value }))}
                  rows={2}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-bold text-gray-700">Thứ tự hiển thị</span>
                <input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm"
                />
              </label>
              <label className="flex items-center gap-2 self-end rounded-xl bg-gray-50 px-3.5 py-3 text-xs font-bold text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="accent-primary"
                />
                Phần thưởng đang hoạt động
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-600"
              >
                HỦY
              </button>
              <button
                type="submit"
                disabled={savingPrize || !form.imageUrl}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-black text-white disabled:opacity-50"
              >
                {savingPrize && <Loader2 className="h-4 w-4 animate-spin" />}
                {editing ? "LƯU THAY ĐỔI" : "THÊM PHẦN THƯỞNG"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ToggleSetting({
  title,
  description,
  value,
  onChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
    >
      <span>
        <strong className="block text-sm text-gray-800">{title}</strong>
        <small className="mt-1 block text-xs text-gray-500">{description}</small>
      </span>
      {value ? (
        <ToggleRight className="h-7 w-7 shrink-0 text-emerald-600" />
      ) : (
        <ToggleLeft className="h-7 w-7 shrink-0 text-gray-400" />
      )}
    </button>
  );
}
