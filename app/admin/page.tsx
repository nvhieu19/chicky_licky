import AdminOverview from "@/components/ui/AdminOverview";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const trendStart = new Date(startToday);
  trendStart.setDate(trendStart.getDate() - 29);

  const [
    totalProducts,
    totalCategories,
    totalOrders,
    pendingOrders,
    totalCustomers,
    revenue,
    todayRevenue,
    recentOrders,
    trendOrders,
    topProductRows,
    orderStatusRows,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.aggregate({
      where: { status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: startToday },
      },
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderCode: true,
        recipientName: true,
        totalAmount: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.order.findMany({
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: trendStart },
      },
      select: { totalAmount: true, createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      where: {
        order: {
          is: {
            status: { not: "CANCELLED" },
            createdAt: { gte: trendStart },
          },
        },
      },
      _sum: { quantity: true, subtotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const dailyRevenue = new Map<string, { revenue: number; orders: number }>();
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  for (const order of trendOrders) {
    const key = dateKey(order.createdAt);
    const day = dailyRevenue.get(key) ?? { revenue: 0, orders: 0 };
    day.revenue += Number(order.totalAmount);
    day.orders += 1;
    dailyRevenue.set(key, day);
  }

  const revenueTrend = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(trendStart);
    date.setDate(trendStart.getDate() + index);
    const totals = dailyRevenue.get(dateKey(date)) ?? { revenue: 0, orders: 0 };
    return {
      date: dateKey(date),
      label: new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      }).format(date),
      ...totals,
    };
  });

  return (
    <AdminOverview
      totalRevenue={Number(revenue._sum.totalAmount ?? 0)}
      todayRevenue={Number(todayRevenue._sum.totalAmount ?? 0)}
      totalOrders={totalOrders}
      pendingOrders={pendingOrders}
      totalProducts={totalProducts}
      totalCategories={totalCategories}
      totalCustomers={totalCustomers}
      revenueTrend={revenueTrend}
      recentOrders={recentOrders.map((order) => ({
        ...order,
        totalAmount: Number(order.totalAmount),
        createdAtLabel: new Intl.DateTimeFormat("vi-VN", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(order.createdAt),
      }))}
      topProducts={topProductRows.map((product) => ({
        name: product.productName,
        quantity: product._sum.quantity ?? 0,
        subtotal: Number(product._sum.subtotal ?? 0),
      }))}
      orderStatuses={orderStatusRows.map((status) => ({
        status: status.status,
        count: status._count._all,
      }))}
    />
  );
}
