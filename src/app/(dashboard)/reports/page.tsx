"use client";

import { useState, useMemo } from "react";
import { jobCards, invoices, serviceCatalog, staff } from "@/lib/mock-data";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Download, IndianRupee, TrendingUp, Wrench, Users } from "lucide-react";
import { toast } from "sonner";

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];
const CHART_TEXT_CLASSES = ["text-blue-500", "text-violet-500", "text-emerald-500", "text-amber-500", "text-red-500", "text-cyan-500", "text-pink-500", "text-lime-500"];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("30d");

  const revenueData = useMemo(() => {
    const monthlyMap: Record<string, { collected: number; pending: number }> = {};
    const months = ["Jan", "Feb", "Mar"];
    months.forEach((m) => { monthlyMap[m] = { collected: 0, pending: 0 }; });

    invoices.forEach((inv) => {
      const month = new Date(inv.createdAt).toLocaleString("en", { month: "short" });
      if (!monthlyMap[month]) monthlyMap[month] = { collected: 0, pending: 0 };
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      monthlyMap[month].collected += paid;
      monthlyMap[month].pending += inv.grandTotal - paid;
    });

    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      ...data,
    }));
  }, []);

  const totalCollected = invoices.reduce(
    (sum, inv) => sum + inv.payments.reduce((s, p) => s + p.amount, 0),
    0
  );
  const totalPending = invoices.reduce(
    (sum, inv) => sum + inv.grandTotal - inv.payments.reduce((s, p) => s + p.amount, 0),
    0
  );

  const serviceData = useMemo(() => {
    const countMap: Record<string, number> = {};
    jobCards.forEach((jc) => {
      jc.services.forEach((svc) => {
        const category = serviceCatalog.find((sc) => sc.id === svc.serviceCatalogId)?.category ?? "Other";
        countMap[category] = (countMap[category] || 0) + 1;
      });
    });
    return Object.entries(countMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const topServices = useMemo(() => {
    const countMap: Record<string, number> = {};
    jobCards.forEach((jc) => {
      jc.services.forEach((svc) => {
        countMap[svc.name] = (countMap[svc.name] || 0) + 1;
      });
    });
    return Object.entries(countMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, []);

  const mechanicData = useMemo(() => {
    const mechanics = staff.filter((s) => s.role === "MECHANIC");
    return mechanics.map((m) => {
      const jobs = jobCards.filter((jc) => jc.mechanicId === m.id);
      const completed = jobs.filter((jc) => jc.status === "DELIVERED").length;
      const active = jobs.filter((jc) => !["DELIVERED", "CANCELLED"].includes(jc.status)).length;
      return { name: m.name.split(" ")[0], completed, active, total: jobs.length };
    });
  }, []);

  const vehicleData = useMemo(() => {
    const makeMap: Record<string, number> = {};
    jobCards.forEach((jc) => {
      const make = jc.vehicleMakeModel.split(" ")[0];
      makeMap[make] = (makeMap[make] || 0) + 1;
    });
    return Object.entries(makeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, []);

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((h) => String(row[h] ?? "")).join(","));
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename}.csv downloaded`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="Insights across revenue, services, and performance"
        actions={
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5! flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalCollected)}</p>
                  <p className="text-sm text-muted-foreground">Collected</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5! flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                  <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Monthly Revenue</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportCSV(revenueData, "revenue-report")}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" tick={{ fill: "currentColor" }} />
                    <YAxis width={60} className="text-xs" tick={{ fill: "currentColor" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--popover-foreground)" }}
                      formatter={(value) => [formatCurrency(Number(value)), ""]}
                    />
                    <Bar dataKey="collected" name="Collected" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">Service Category Breakdown</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportCSV(serviceData, "service-categories")}>
                  <Download className="w-4 h-4 mr-2" />Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] sm:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={serviceData} cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                        {serviceData.map((_, idx) => (
                          <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--popover-foreground)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Most Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px] sm:h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topServices} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis type="number" className="text-xs" tick={{ fill: "currentColor" }} />
                      <YAxis dataKey="name" type="category" width={120} className="text-xs" tick={{ fill: "currentColor" }} />
                      <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--popover-foreground)" }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mechanics" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Jobs per Mechanic</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportCSV(mechanicData, "mechanic-performance")}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mechanicData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: "currentColor" }} />
                    <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--popover-foreground)" }} />
                    <Bar dataKey="completed" name="Completed" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="active" name="Active" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {mechanicData.map((m) => (
              <Card key={m.name}>
                <CardContent className="p-5! text-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-2xl font-bold mt-1">{m.total}</p>
                  <p className="text-xs text-muted-foreground">total jobs</p>
                  <div className="flex justify-center gap-4 mt-2 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">{m.completed} done</span>
                    <span className="text-blue-600 dark:text-blue-400">{m.active} active</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vehicles" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Most Serviced Makes</CardTitle>
              <Button variant="outline" size="sm" onClick={() => exportCSV(vehicleData, "vehicle-makes")}>
                <Download className="w-4 h-4 mr-2" />Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] sm:h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vehicleData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" tick={{ fill: "currentColor" }} />
                    <YAxis className="text-xs" tick={{ fill: "currentColor" }} />
                    <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "0.5rem", color: "var(--popover-foreground)" }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {vehicleData.slice(0, 4).map((v, i) => (
              <Card key={v.name}>
                <CardContent className="p-5! text-center">
                  <p className={`text-3xl font-bold ${CHART_TEXT_CLASSES[i]}`}>{v.count}</p>
                  <p className="font-medium mt-1">{v.name}</p>
                  <p className="text-xs text-muted-foreground">vehicles serviced</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
