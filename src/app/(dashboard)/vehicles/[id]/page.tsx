"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { vehicles, jobCards, serviceReminders } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JobCardStatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";
import { ArrowLeft, Bell, AlertTriangle, Clock, Calendar, Wrench, Droplets, Disc3, Snowflake, Battery, Shield, FileCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";

function getColorHex(colorName: string): string {
  const lower = colorName.toLowerCase();
  if (lower.includes("white") || lower.includes("arctic") || lower.includes("polar")) return "#f8fafc";
  if (lower.includes("black") || lower.includes("midnight") || lower.includes("oberon") || lower.includes("abyss")) return "#1e293b";
  if (lower.includes("grey") || lower.includes("gray") || lower.includes("silver") || lower.includes("steel")) return "#64748b";
  if (lower.includes("red") || lower.includes("fiery") || lower.includes("radiant")) return "#dc2626";
  if (lower.includes("blue") || lower.includes("nexa") || lower.includes("teal")) return "#2563eb";
  if (lower.includes("orange")) return "#ea580c";
  if (lower.includes("beige") || lower.includes("rocky")) return "#d4a574";
  if (lower.includes("green")) return "#16a34a";
  return "#6366f1";
}

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id as string;

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const vehicleJobCards = jobCards
    .filter((jc) => jc.vehicleId === vehicleId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (!vehicle) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <Button variant="ghost" onClick={() => router.push("/vehicles")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Vehicles
        </Button>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Vehicle not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const hex = getColorHex(vehicle.color);

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumbs items={[
        { label: "Vehicles", href: "/vehicles" },
        { label: vehicle.registrationNumber },
      ]} />

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-3xl font-bold font-mono tracking-tight">{vehicle.registrationNumber}</p>
              <p className="text-lg text-muted-foreground mt-1">
                {vehicle.make} {vehicle.model}
                {vehicle.variant && ` ${vehicle.variant}`}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{vehicle.fuelType}</Badge>
              <span className="text-sm text-muted-foreground">{vehicle.year}</span>
              <span className="flex items-center gap-1.5 text-sm">
                <span
                  className="size-4 rounded-full shrink-0 border border-border"
                  style={{ backgroundColor: hex }}
                />
                {vehicle.color}
              </span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>
              Customer:{" "}
              <Link
                href={`/customers/${vehicle.customerId}`}
                className="font-medium text-primary hover:underline"
              >
                {vehicle.customerName}
              </Link>
            </span>
          </div>
          {vehicle.notes && (
            <p className="mt-3 text-sm text-muted-foreground">{vehicle.notes}</p>
          )}
        </CardHeader>
      </Card>

      <VehicleReminders vehicleId={vehicleId} />

      <div>
        <h2 className="text-lg font-semibold mb-4">Service History</h2>
        {vehicleJobCards.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No service history for this vehicle
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            <div className="absolute left-[15px] sm:left-[72px] top-8 bottom-8 w-px bg-border" />
            <div className="space-y-0">
              {vehicleJobCards.map((jc, index) => (
                <div key={jc.id} className="relative flex gap-3 sm:gap-6 pb-8 last:pb-0">
                  <div className="hidden sm:block w-20 shrink-0 pt-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {formatDate(jc.createdAt)}
                    </p>
                  </div>
                  <div className="relative z-10 flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-primary mt-0">
                    <span className="text-xs font-medium text-primary">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
                      <p className="text-xs text-muted-foreground mb-2 sm:hidden">
                        {formatDate(jc.createdAt)}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-sm font-medium">{jc.jobNumber}</span>
                        <JobCardStatusBadge status={jc.status} />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {jc.services.map((s) => s.name).join(", ")}
                      </p>
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs text-muted-foreground">
                        {jc.mechanicName && (
                          <span>Mechanic: {jc.mechanicName}</span>
                        )}
                        {jc.odometerReading != null && (
                          <span>Odometer: {jc.odometerReading.toLocaleString()} km</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const REMINDER_ICONS: Record<string, React.ElementType> = {
  GENERAL_SERVICE: Wrench,
  OIL_CHANGE: Droplets,
  BRAKE_INSPECTION: Disc3,
  TIRE_ROTATION: Disc3,
  AC_SERVICE: Snowflake,
  BATTERY_CHECK: Battery,
  INSURANCE: Shield,
  PUC: FileCheck,
};

const REMINDER_LABELS: Record<string, string> = {
  GENERAL_SERVICE: "General Service",
  OIL_CHANGE: "Oil Change",
  BRAKE_INSPECTION: "Brake Inspection",
  TIRE_ROTATION: "Tire Rotation",
  AC_SERVICE: "AC Service",
  BATTERY_CHECK: "Battery Check",
  INSURANCE: "Insurance Renewal",
  PUC: "PUC Certificate",
};

function VehicleReminders({ vehicleId }: { vehicleId: string }) {
  const reminders = serviceReminders
    .filter((r) => r.vehicleId === vehicleId && r.status !== "COMPLETED" && r.status !== "DISMISSED")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  if (reminders.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bell className="w-5 h-5 text-amber-500" />
        Service Reminders
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reminders.map((r) => {
          const days = Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isOverdue = days < 0;
          const isDue = days >= 0 && days <= 3;
          const Icon = REMINDER_ICONS[r.type] ?? Wrench;

          const borderColor = isOverdue
            ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
            : isDue
            ? "border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
            : "border-border";

          return (
            <Card key={r.id} className={`${borderColor} transition-all`}>
              <CardContent className="p-4! flex items-center gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 ${
                  isOverdue ? "bg-red-100 dark:bg-red-900/30" : isDue ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"
                }`}>
                  <Icon className={`w-5 h-5 ${
                    isOverdue ? "text-red-600 dark:text-red-400" : isDue ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{REMINDER_LABELS[r.type] ?? r.type}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        {Math.abs(days)}d overdue
                      </span>
                    ) : isDue ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                        <Clock className="w-3 h-3" />
                        {days === 0 ? "Due today" : `${days}d left`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        Due {formatDate(r.dueDate)}
                      </span>
                    )}
                  </div>
                  {r.notes && <p className="text-xs text-muted-foreground mt-0.5 truncate">{r.notes}</p>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
