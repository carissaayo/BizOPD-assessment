import { getRedis } from "../../core/cache/redis";
import { orderRepository } from "../../repositories/order.repository";

export const DASHBOARD_CACHE_KEY = "dashboard:stats";
const CACHE_TTL_SECONDS = 60;

export type DashboardStats = {
  totalOrders: number;
  inProduction: number;
  delivered: number;
};

async function fetchDashboardStats(): Promise<DashboardStats> {
  const [totalOrders, delivered] = await Promise.all([
    orderRepository.count({}),
    orderRepository.count({ stage: "Delivered" }),
  ]);

  return {
    totalOrders,
    inProduction: totalOrders - delivered,
    delivered,
  };
}

export async function getDashboard() {
  try {
    const cached = await getRedis().get(DASHBOARD_CACHE_KEY);

    if (cached) {
      const stats = JSON.parse(cached) as DashboardStats;

      return {
        message: "Dashboard stats retrieved successfully",
        ...stats,
      };
    }
  } catch {
    // Fall through to recompute if Redis is unavailable.
  }

  const stats = await fetchDashboardStats();

  try {
    await getRedis().set(
      DASHBOARD_CACHE_KEY,
      JSON.stringify(stats),
      "EX",
      CACHE_TTL_SECONDS,
    );
  } catch {
    // Stats are still returned even if caching fails.
  }

  return {
    message: "Dashboard stats retrieved successfully",
    ...stats,
  };
}

export async function invalidateDashboardCache(): Promise<void> {
  try {
    await getRedis().del(DASHBOARD_CACHE_KEY);
  } catch {
    // Cache will refresh via TTL if Redis is unavailable.
  }
}
