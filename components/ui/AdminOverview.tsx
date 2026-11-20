"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Package,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
  Users,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

type RevenuePoint = {
  date: string;
  label: string;
  revenue: number;
  orders: number;
};

type DashboardOrder = {
  id: string;
  orderCode: string;
  recipientName: string;
  totalAmount: number;
  status: string;
  createdAtLabel: string;
};

type DashboardProduct = {
  name: string;
  quantity: number;
  subtotal: number;
};

type DashboardStatus = {
  status: string;
  count: number;
};

export type AdminOverviewProps = {
  totalRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  revenueTrend: RevenuePoint[];
  recentOrders: DashboardOrder[];
  topProducts: DashboardProduct[];
  orderStatuses: DashboardStatus[];
};

const statusLabels: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn tất",
  CANCELLED: "Đã hủy",
};

const statusTones: Record<string, string> = {
  PENDING: "admin-status-amber",
  CONFIRMED: "admin-status-blue",
  PREPARING: "admin-status-orange",
  SHIPPING: "admin-status-purple",
  COMPLETED: "admin-status-green",
  CANCELLED: "admin-status-gray",
};

export default function AdminOverview({
  totalRevenue,
  todayRevenue,
  totalOrders,
  pendingOrders,
  totalProducts,
  totalCategories,
  totalCustomers,
  revenueTrend,
  recentOrders,
  topProducts,
  orderStatuses,
}: AdminOverviewProps) {
  const [range, setRange] = useState<7 | 30>(7);
  const chartData = useMemo(
    () => revenueTrend.slice(-range),
    [range, revenueTrend]
  );
  const chart = useMemo(() => {
    const width = 720;
    const height = 190;
    const inset = 12;
    const maxRevenue = Math.max(1, ...chartData.map((point) => point.revenue)) * 1.15;
    const points = chartData.map((point, index) => {
      const x =
        chartData.length < 2
          ? width / 2
          : inset + (index / (chartData.length - 1)) * (width - inset * 2);
      const y = height - inset - (point.revenue / maxRevenue) * (height - inset * 2);
      return { x, y };
    });
    const line = points
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ");
    const area = points.length
      ? `${line} L ${points[points.length - 1].x} ${height - inset} L ${points[0].x} ${height - inset} Z`
      : "";

    return { width, height, points, line, area };
  }, [chartData]);
  const chartTotal = chartData.reduce((sum, point) => sum + point.revenue, 0);
  const visibleStatuses = orderStatuses.filter(({ count }) => count > 0);

  const metrics = [
    {
      title: "Doanh thu tích lũy",
      value: formatPrice(totalRevenue),
      detail: `Hôm nay ${formatPrice(todayRevenue)}`,
      icon: <CircleDollarSign aria-hidden="true" />,
      tone: "coral",
    },
    {
      title: "Đơn hàng",
      value: totalOrders.toLocaleString("vi-VN"),
      detail: `${pendingOrders} đơn chờ xác nhận`,
      icon: <ShoppingBag aria-hidden="true" />,
      tone: "amber",
    },
    {
      title: "Sản phẩm",
      value: totalProducts.toLocaleString("vi-VN"),
      detail: `${totalCategories} danh mục`,
      icon: <UtensilsCrossed aria-hidden="true" />,
      tone: "purple",
    },
    {
      title: "Khách hàng",
      value: totalCustomers.toLocaleString("vi-VN"),
      detail: "Tài khoản khách hàng",
      icon: <Users aria-hidden="true" />,
      tone: "green",
    },
  ];

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-heading">
        <div>
          <span className="admin-dashboard-eyebrow">CHICKY LICKY · QUẢN TRỊ</span>
          <h1>Tổng quan kinh doanh</h1>
          <p>Theo dõi doanh thu, đơn hàng và hoạt động cửa hàng.</p>
        </div>
        <Link href="/admin/orders" className="admin-dashboard-action">
          Quản lý đơn hàng <ArrowRight aria-hidden="true" />
        </Link>
      </header>

      <section className="admin-dashboard-metrics" aria-label="Chỉ số kinh doanh">
        {metrics.map((metric, index) => (
          <article
            key={metric.title}
            className="admin-glass-panel admin-metric-card"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div className="admin-metric-copy">
              <span>{metric.title}</span>
              <strong>{metric.value}</strong>
              <small>{metric.detail}</small>
            </div>
            <span className={`admin-metric-icon admin-metric-${metric.tone}`}>
              {metric.icon}
            </span>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-overview">
        <article className="admin-glass-panel admin-revenue-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-panel-eyebrow">DOANH THU</span>
              <h2>Xu hướng bán hàng</h2>
              <p>{range === 7 ? "7 ngày gần nhất" : "30 ngày gần nhất"}</p>
            </div>
            <div className="admin-range-toggle" role="group" aria-label="Khoảng thời gian biểu đồ">
              <button type="button" aria-pressed={range === 7} onClick={() => setRange(7)}>
                7 ngày
              </button>
              <button type="button" aria-pressed={range === 30} onClick={() => setRange(30)}>
                30 ngày
              </button>
            </div>
          </div>
          <div className="admin-chart-summary">
            <strong>{formatPrice(chartTotal)}</strong>
            <span><TrendingUp aria-hidden="true" /> Tổng doanh thu trong kỳ</span>
          </div>
          {chartData.some((point) => point.revenue > 0) ? (
            <div className="admin-revenue-chart">
              <svg
                viewBox={`0 0 ${chart.width} ${chart.height}`}
                preserveAspectRatio="none"
                role="img"
                aria-label={`Biểu đồ doanh thu ${range} ngày`}
              >
                <defs>
                  <linearGradient id="admin-revenue-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#e60028" stopOpacity=".25" />
                    <stop offset="100%" stopColor="#e60028" stopOpacity=".01" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3].map((line) => (
                  <line
                    key={line}
                    x1="0"
                    x2={chart.width}
                    y1={16 + line * 52}
                    y2={16 + line * 52}
                    className="admin-chart-gridline"
                  />
                ))}
                <path d={chart.area} fill="url(#admin-revenue-fill)" />
                <path d={chart.line} className="admin-chart-line" />
                {chart.points.map((point, index) => (
                  <circle
                    key={chartData[index].date}
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    className="admin-chart-point"
                  >
                    <title>
                      {chartData[index].label}: {formatPrice(chartData[index].revenue)}
                    </title>
                  </circle>
                ))}
              </svg>
              <div className="admin-chart-labels" aria-hidden="true">
                {chartData.map((point, index) => {
                  const step = Math.max(1, Math.ceil(chartData.length / 7));
                  return index % step === 0 || index === chartData.length - 1 ? (
                    <span key={point.date}>{point.label}</span>
                  ) : (
                    <span key={point.date} />
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="admin-dashboard-empty">
              Chưa có doanh thu trong khoảng thời gian này.
            </div>
          )}
        </article>

        <article className="admin-glass-panel admin-order-status-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-panel-eyebrow">ĐƠN HÀNG</span>
              <h2>Trạng thái xử lý</h2>
              <p>{totalOrders.toLocaleString("vi-VN")} đơn hàng tổng cộng</p>
            </div>
            <span className="admin-status-total">
              <Package aria-hidden="true" />
            </span>
          </div>
          {visibleStatuses.length > 0 ? (
            <div className="admin-status-list">
              {visibleStatuses.map(({ status, count }) => (
                <div className="admin-status-row" key={status}>
                  <div className="admin-status-label">
                    <span className={`admin-status-dot ${statusTones[status] ?? "admin-status-gray"}`} />
                    <span>{statusLabels[status] ?? status}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="admin-status-track">
                    <span
                      className={statusTones[status] ?? "admin-status-gray"}
                      style={{ width: `${Math.min(100, (count / Math.max(totalOrders, 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-dashboard-empty">Chưa có đơn hàng.</div>
          )}
          <Link href="/admin/orders" className="admin-panel-link">
            Mở danh sách đơn <ArrowUpRight aria-hidden="true" />
          </Link>
        </article>
      </section>

      <section className="admin-dashboard-lists">
        <article className="admin-glass-panel admin-orders-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-panel-eyebrow">MỚI NHẤT</span>
              <h2>Đơn hàng gần đây</h2>
              <p>Các đơn mới nhất được đặt trên website</p>
            </div>
            <Link href="/admin/orders" className="admin-panel-link">
              Xem tất cả <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="admin-recent-orders">
              {recentOrders.map((order) => (
                <Link
                  href="/admin/orders"
                  className="admin-order-row"
                  key={order.id}
                  aria-label={`Đơn ${order.orderCode}, ${order.recipientName}, ${formatPrice(order.totalAmount)}`}
                >
                  <span className="admin-order-icon"><ShoppingBag aria-hidden="true" /></span>
                  <span className="admin-order-info">
                    <strong>#{order.orderCode}</strong>
                    <small>{order.recipientName} · {order.createdAtLabel}</small>
                  </span>
                  <span className="admin-order-total">{formatPrice(order.totalAmount)}</span>
                  <span className={`admin-status-badge ${statusTones[order.status] ?? "admin-status-gray"}`}>
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="admin-dashboard-empty">
              <Clock3 aria-hidden="true" /> Chưa có đơn hàng nào.
            </div>
          )}
        </article>

        <article className="admin-glass-panel admin-products-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-panel-eyebrow">30 NGÀY GẦN NHẤT</span>
              <h2>Món được chọn nhiều</h2>
              <p>Theo số lượng bán ra</p>
            </div>
            <Link href="/admin/products" className="admin-panel-link" aria-label="Quản lý sản phẩm">
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
          {topProducts.length > 0 ? (
            <div className="admin-top-products">
              {topProducts.map((product, index) => (
                <div className="admin-product-row" key={product.name}>
                  <span className="admin-product-rank">{String(index + 1).padStart(2, "0")}</span>
                  <span className="admin-product-info">
                    <strong>{product.name}</strong>
                    <small>{product.quantity} phần đã bán</small>
                  </span>
                  <span className="admin-product-sales">{formatPrice(product.subtotal)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-dashboard-empty">
              <CheckCircle2 aria-hidden="true" /> Chưa có dữ liệu bán món trong 30 ngày qua.
            </div>
          )}
        </article>
      </section>
    </div>
  );
}
