import {
  eachDayOfInterval,
  eachMonthOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { OrderStatusEnum } from "../constants/orderStatusEnum";
import prismaClient from "../database";

const getOrderStatistic = async (startDate: string, endDate: string) => {
  const orders = await prismaClient.orderDetail.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return orders;
};

const getMonthlyStatistics = async (
  year: number = new Date().getFullYear(),
) => {
  // Define start and end dates for the given year
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31); // December 31st

  // Get all orders for the year
  const orders = await prismaClient.orderDetail.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
    },
  });

  // Create month intervals
  const monthIntervals = eachMonthOfInterval({
    start: startDate,
    end: endDate,
  });

  // Initialize statistics for each month
  const monthlyStats = monthIntervals.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    // Filter orders for this month
    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });

    // Calculate total revenue for this month
    const revenue = monthOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      date: format(month, "MM"),
      "Đơn hàng": monthOrders.length,
      "Doanh thu": revenue,
    };
  });

  return monthlyStats;
};

const getOrderStatisticByMonth = async (
  year: number = new Date().getFullYear(),
) => {
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31); // December 31st

  const orders = await prismaClient.orderDetail.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return orders;
};

const getDailyStatisticsForMonth = async (
  shopId: number,
  { month, year }: { month: number; year: number },
) => {
  // Define start and end dates for the specified month
  const startDate = new Date(year, month, 1); // First day of month
  const endDate = endOfMonth(startDate); // Last day of month

  // Get all orders for the month
  const orders = await prismaClient.orderDetail.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      shopId: shopId,
    },
    include: {
      items: true,
    },
  });

  // Create day intervals for the month
  const dayIntervals = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Initialize statistics for each day
  const dailyStats = dayIntervals.map((day) => {
    // Get start and end of the day
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    // Filter orders for this day
    const dayOrders = orders.filter((order) => {
      if (!order.isDone) {
        return false;
      }
      const orderDate = new Date(order.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });

    // Calculate total revenue for this day
    const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      date: format(day, "dd/MM"),
      orderCount: dayOrders.length,
      "Doanh thu": revenue,
    };
  });

  return dailyStats;
};

// New method for admin to get daily statistics for all shops
const getAdminDailyStatisticsForMonth = async ({
  month,
  year,
}: {
  month: number;
  year: number;
}) => {
  // Define start and end dates for the specified month
  const startDate = new Date(year, month, 1); // First day of month
  const endDate = endOfMonth(startDate); // Last day of month

  // Get all orders for the month without shop filter
  const orders = await prismaClient.orderDetail.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
      shop: {
        select: {
          id: true,
          shopName: true,
        },
      },
    },
  });

  // Create day intervals for the month
  const dayIntervals = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Initialize statistics for each day
  const dailyStats = dayIntervals.map((day) => {
    // Get start and end of the day
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    // Filter orders for this day
    const dayOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });

    // Calculate total revenue for this day
    const revenue = dayOrders.reduce((sum, order) => sum + order.total, 0);

    // Count orders by shop
    const shopOrders = dayOrders.reduce((acc, order) => {
      const shopId = order.shopId;
      const shopName = order.shop?.shopName || `Shop ${shopId}`;

      if (!acc[shopId]) {
        acc[shopId] = {
          shopId,
          shopName,
          orderCount: 0,
          revenue: 0,
        };
      }

      acc[shopId].orderCount += 1;
      acc[shopId].revenue += order.total;

      return acc;
    }, {} as Record<number, { shopId: number; shopName: string; orderCount: number; revenue: number }>);

    return {
      date: format(day, "dd/MM"),
      totalOrderCount: dayOrders.length,
      totalRevenue: revenue,
      shopStats: Object.values(shopOrders),
    };
  });

  return dailyStats;
};

const getDashboardCardStats = async (shopId: number) => {
  // Get all orders for the shop
  const orders = await prismaClient.orderDetail.findMany({
    where: {
      shopId: shopId,
    },
    include: {
      OrderStatus: {
        include: {
          status: true,
        },
        orderBy: {
          statusId: "desc",
        },
      },
    },
  });

  // Calculate total revenue
  const totalRevenue = orders
    .filter((order) => order.isDone)
    .reduce((sum, order) => sum + order.total, 0);

  // Count orders by status
  const completedOrders = orders.filter((order) => {
    const latestStatus = order.OrderStatus[0]?.status?.type;
    return latestStatus === OrderStatusEnum.DELIVERED;
  }).length;

  const shippingOrders = orders.filter((order) => {
    const latestStatus = order.OrderStatus[0]?.status?.type;
    return latestStatus === OrderStatusEnum.SHIPPED;
  }).length;

  const cancelledOrders = orders.filter((order) => {
    const latestStatus = order.OrderStatus[0]?.status?.type;
    return latestStatus === OrderStatusEnum.CANCELLED;
  }).length;

  return {
    totalRevenue,
    completedOrders,
    shippingOrders,
    cancelledOrders,
  };
};

const getAdminDashboardStats = async () => {
  // Get all shops
  const shops = await prismaClient.user.findMany({
    where: {
      role: "SELLER",
    },
    select: {
      id: true,
      shopName: true,
    },
  });

  // Get all orders
  const orders = await prismaClient.orderDetail.findMany({
    include: {
      OrderStatus: {
        include: {
          status: true,
        },
        orderBy: {
          statusId: "desc",
        },
      },
      shop: {
        select: {
          id: true,
          shopName: true,
        },
      },
    },
  });

  // Calculate overall statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const completedOrders = orders.filter((order) => {
    const latestStatus = order.OrderStatus[0]?.status?.type;
    return latestStatus === OrderStatusEnum.DELIVERED;
  }).length;

  const shippingOrders = orders.filter((order) => {
    const latestStatus = order.OrderStatus[0]?.status?.type;
    return latestStatus === OrderStatusEnum.SHIPPED;
  }).length;

  const cancelledOrders = orders.filter((order) => {
    const latestStatus = order.OrderStatus[0]?.status?.type;
    return latestStatus === OrderStatusEnum.CANCELLED;
  }).length;

  const totalOrders = orders.length;

  // Calculate statistics per shop
  const shopStats = shops.map((shop) => {
    const shopOrders = orders.filter((order) => order.shopId === shop.id);

    const shopRevenue = shopOrders.reduce((sum, order) => sum + order.total, 0);

    const shopCompletedOrders = shopOrders.filter((order) => {
      const latestStatus = order.OrderStatus[0]?.status?.type;
      return latestStatus === OrderStatusEnum.DELIVERED;
    }).length;

    const shopShippingOrders = shopOrders.filter((order) => {
      const latestStatus = order.OrderStatus[0]?.status?.type;
      return latestStatus === OrderStatusEnum.SHIPPED;
    }).length;

    const shopCancelledOrders = shopOrders.filter((order) => {
      const latestStatus = order.OrderStatus[0]?.status?.type;
      return latestStatus === OrderStatusEnum.CANCELLED;
    }).length;

    return {
      shopId: shop.id,
      shopName: shop.shopName || `Shop ${shop.id}`,
      totalRevenue: shopRevenue,
      totalOrders: shopOrders.length,
      completedOrders: shopCompletedOrders,
      shippingOrders: shopShippingOrders,
      cancelledOrders: shopCancelledOrders,
    };
  });

  return {
    overall: {
      totalRevenue,
      totalOrders,
      completedOrders,
      shippingOrders,
      cancelledOrders,
    },
    shopStats,
  };
};

const getAdminMonthlyStatistics = async (
  year: number = new Date().getFullYear(),
) => {
  // Define start and end dates for the given year
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31); // December 31st

  // Get all orders for the year with shop information
  const orders = await prismaClient.orderDetail.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
      shop: {
        select: {
          id: true,
          shopName: true,
        },
      },
    },
  });

  // Create month intervals
  const monthIntervals = eachMonthOfInterval({
    start: startDate,
    end: endDate,
  });

  // Initialize statistics for each month
  const monthlyStats = monthIntervals.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    // Filter orders for this month
    const monthOrders = orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart && orderDate <= monthEnd;
    });

    // Calculate total revenue for this month
    const totalRevenue = monthOrders.reduce(
      (sum, order) => sum + order.total,
      0,
    );

    // Group by shop
    const shopOrders = monthOrders.reduce((acc, order) => {
      const shopId = order.shopId;
      const shopName = order.shop?.shopName || `Shop ${shopId}`;

      if (!acc[shopId]) {
        acc[shopId] = {
          shopId,
          shopName,
          orderCount: 0,
          revenue: 0,
        };
      }

      acc[shopId].orderCount += 1;
      acc[shopId].revenue += order.total;

      return acc;
    }, {} as Record<number, { shopId: number; shopName: string; orderCount: number; revenue: number }>);

    return {
      month: format(month, "MM/yyyy"),
      orderCount: monthOrders.length,
      revenue: totalRevenue,
      shopStats: Object.values(shopOrders),
    };
  });

  return monthlyStats;
};

const getAdminStoreStats = async () => {
  // Get counts from database
  const [
    totalShops,
    totalBuyers,
    totalAdmins,
    totalProducts,
    totalOrders,
    totalRevenue,
    totalActiveShops,
    totalActiveProducts,
  ] = await Promise.all([
    // Count shops
    prismaClient.user.count({
      where: {
        role: "SELLER",
      },
    }),
    // Count buyers
    prismaClient.user.count({
      where: {
        role: "BUYER",
      },
    }),
    // Count admins
    prismaClient.user.count({
      where: {
        role: "ADMIN",
      },
    }),
    // Count products
    prismaClient.product.count(),
    // Count orders
    prismaClient.orderDetail.count(),
    // Calculate total revenue
    prismaClient.orderDetail.aggregate({
      _sum: {
        total: true,
      },
    }),
    // Count active shops
    prismaClient.user.count({
      where: {
        role: "SELLER",
        isActive: true,
      },
    }),
    // Count active products
    prismaClient.product.count({
      where: {
        isActive: true,
      },
    }),
  ]);

  // Get order status counts
  const orderStatusCounts = await prismaClient.orderStatus.groupBy({
    by: ["statusId"],
    _count: {
      orderId: true,
    },
    orderBy: {
      statusId: "asc",
    },
  });

  // Get statuses
  const statuses = await prismaClient.status.findMany();

  // Map status counts
  const statusStats = statuses.map((status) => {
    const statusCount = orderStatusCounts.find(
      (os) => os.statusId === status.id,
    );
    return {
      statusId: status.id,
      statusName: status.name,
      statusType: status.type,
      count: statusCount?._count.orderId || 0,
    };
  });

  return {
    users: {
      totalShops,
      totalBuyers,
      totalAdmins,
      totalUsers: totalShops + totalBuyers + totalAdmins,
    },
    shops: {
      total: totalShops,
      active: totalActiveShops,
      inactive: totalShops - totalActiveShops,
    },
    products: {
      total: totalProducts,
      active: totalActiveProducts,
      inactive: totalProducts - totalActiveProducts,
    },
    orders: {
      total: totalOrders,
      byStatus: statusStats,
    },
    revenue: {
      total: totalRevenue._sum.total || 0,
    },
  };
};

const getAdminUserMonthlyStatistics = async (
  year: number = new Date().getFullYear(),
) => {
  const startDate = new Date(year, 0, 1); // January 1st
  const endDate = new Date(year, 11, 31); // December 31st

  const monthIntervals = eachMonthOfInterval({
    start: startDate,
    end: endDate,
  });

  const monthlyStats = await Promise.all(
    monthIntervals.map(async (month) => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);

      const [totalShops, totalBuyers, totalAdmins] = await Promise.all([
        prismaClient.user.count({
          where: {
            role: "SELLER",
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        prismaClient.user.count({
          where: {
            role: "BUYER",
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
        prismaClient.user.count({
          where: {
            role: "ADMIN",
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
        }),
      ]);

      return {
        month: format(month, "MM/yyyy"),
        "Người mua": totalBuyers,
        "Người bán": totalShops,
        "Quản trị viên": totalAdmins,
      };
    }),
  );

  return monthlyStats;
};

const StatisticService = {
  getOrderStatistic,
  getMonthlyStatistics,
  getOrderStatisticByMonth,
  getDailyStatisticsForMonth,
  getDashboardCardStats,
  getAdminDailyStatisticsForMonth,
  getAdminDashboardStats,
  getAdminMonthlyStatistics,
  getAdminStoreStats,
  getAdminUserMonthlyStatistics,
};

export default StatisticService;
