import type { DashboardStats } from "@/types";
import { jobCards } from "./job-cards";

// Today's bookings: active job cards (RECEIVED, INSPECTION, AWAITING_APPROVAL, IN_SERVICE)
const todaysBookings = jobCards.filter((jc) =>
  ["RECEIVED", "INSPECTION", "AWAITING_APPROVAL", "IN_SERVICE"].includes(jc.status)
);

// Ready for delivery: job cards in READY status
const readyForDelivery = jobCards.filter((jc) => jc.status === "READY");

export const dashboardStats: DashboardStats = {
  carsReceivedToday: 3,
  carsDeliveredToday: 2,
  inProgressServices: 12,
  dailyRevenue: 42850,
  newCustomersToday: 1,
  monthlyRevenue: [
    { month: "Apr 2025", revenue: 185000 },
    { month: "May 2025", revenue: 212000 },
    { month: "Jun 2025", revenue: 198500 },
    { month: "Jul 2025", revenue: 235000 },
    { month: "Aug 2025", revenue: 248000 },
    { month: "Sep 2025", revenue: 221000 },
    { month: "Oct 2025", revenue: 265000 },
    { month: "Nov 2025", revenue: 278500 },
    { month: "Dec 2025", revenue: 312000 },
    { month: "Jan 2026", revenue: 285000 },
    { month: "Feb 2026", revenue: 298000 },
    { month: "Mar 2026", revenue: 156000 },
  ],
  serviceBreakdown: [
    { name: "General Service", count: 45 },
    { name: "Engine", count: 12 },
    { name: "Brakes", count: 18 },
    { name: "AC", count: 22 },
    { name: "Electrical", count: 8 },
    { name: "Body", count: 6 },
    { name: "Tires", count: 28 },
  ],
  todaysBookings: todaysBookings.length > 0 ? todaysBookings : [jobCards[0], jobCards[1], jobCards[2]],
  readyForDelivery:
    readyForDelivery.length > 0 ? readyForDelivery : [jobCards.find((jc) => jc.status === "READY")!].filter(Boolean),
};
