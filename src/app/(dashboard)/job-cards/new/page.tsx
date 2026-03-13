"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  customers,
  vehicles,
  staff,
  serviceCatalog,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { ServiceCatalogItem } from "@/types";

interface NewJobCardFormData {
  customerId: string;
  vehicleId: string;
  serviceIds: string[];
  mechanicId: string;
  expectedDelivery: string;
  reportedIssues?: string;
  odometerReading?: number;
  notes?: string;
}

export default function NewJobCardPage() {
  const router = useRouter();
  const mechanics = useMemo(
    () => staff.filter((s) => s.role === "MECHANIC"),
    []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewJobCardFormData>({
    defaultValues: {
      customerId: "",
      vehicleId: "",
      serviceIds: [],
      mechanicId: "",
      expectedDelivery: "",
      reportedIssues: "",
      odometerReading: undefined,
      notes: "",
    },
  });

  const customerId = watch("customerId");
  const vehicleId = watch("vehicleId");
  const serviceIds = watch("serviceIds") ?? [];

  const customerVehicles = useMemo(() => {
    if (!customerId) return [];
    return vehicles.filter((v) => v.customerId === customerId);
  }, [customerId]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customerId]
  );

  const selectedServices = useMemo(() => {
    return serviceCatalog.filter((s) => serviceIds.includes(s.id));
  }, [serviceIds]);

  const totalEstimate = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.defaultPrice, 0);
  }, [selectedServices]);

  const toggleService = (id: string) => {
    setValue(
      "serviceIds",
      serviceIds.includes(id)
        ? serviceIds.filter((s) => s !== id)
        : [...serviceIds, id],
      { shouldValidate: true }
    );
  };

  const onSubmit = (_data: NewJobCardFormData) => {
    toast.success("Job card created successfully", {
      description: "The new job card has been added to the system.",
    });
    router.push("/job-cards");
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="New Job Card"
        actions={
          <Link href="/job-cards">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-8">
        {/* Customer & Vehicle Section */}
        <Card>
          <CardHeader>
            <CardTitle>Customer & Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">Customer</Label>
                <Select
                  value={customerId}
                  onValueChange={(v) => {
                    setValue("customerId", v);
                    setValue("vehicleId", "");
                  }}
                >
                  <SelectTrigger id="customerId">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-destructive">
                    {errors.customerId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle</Label>
                <Select
                  value={vehicleId}
                  onValueChange={(v) => setValue("vehicleId", v)}
                  disabled={!customerId}
                >
                  <SelectTrigger id="vehicleId">
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {customerVehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.registrationNumber} - {v.make} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleId && (
                  <p className="text-sm text-destructive">
                    {errors.vehicleId.message}
                  </p>
                )}
              </div>
            </div>
            {selectedCustomer && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <p className="font-medium">{selectedCustomer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCustomer.phone} · {selectedCustomer.email}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedCustomer.address}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Service Details Section */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Services</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-4">
                {serviceCatalog
                  .filter((s) => s.isActive)
                  .map((item: ServiceCatalogItem) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`svc-${item.id}`}
                        checked={serviceIds.includes(item.id)}
                        onCheckedChange={() => toggleService(item.id)}
                      />
                      <label
                        htmlFor={`svc-${item.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                      >
                        {item.name} - {formatCurrency(item.defaultPrice)}
                      </label>
                    </div>
                  ))}
              </div>
              {errors.serviceIds && (
                <p className="text-sm text-destructive">
                  {errors.serviceIds.message}
                </p>
              )}
            </div>
            {selectedServices.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Selected Services</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {selectedServices.map((s) => (
                      <li key={s.id}>
                        {s.name} - {formatCurrency(s.defaultPrice)}
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold mt-2">
                    Total Estimate: {formatCurrency(totalEstimate)}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Assignment Section */}
        <Card>
          <CardHeader>
            <CardTitle>Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mechanicId">Mechanic</Label>
                <Select
                  value={watch("mechanicId")}
                  onValueChange={(v) => setValue("mechanicId", v)}
                >
                  <SelectTrigger id="mechanicId">
                    <SelectValue placeholder="Select mechanic" />
                  </SelectTrigger>
                  <SelectContent>
                    {mechanics.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mechanicId && (
                  <p className="text-sm text-destructive">
                    {errors.mechanicId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedDelivery">Expected Delivery</Label>
                <Input
                  id="expectedDelivery"
                  type="datetime-local"
                  {...register("expectedDelivery")}
                />
                {errors.expectedDelivery && (
                  <p className="text-sm text-destructive">
                    {errors.expectedDelivery.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportedIssues">Reported Issues</Label>
              <Textarea
                id="reportedIssues"
                {...register("reportedIssues")}
                placeholder="Describe the issues reported by the customer"
                rows={3}
              />
            </div>
            <div className="space-y-2 max-w-full sm:max-w-xs">
              <Label htmlFor="odometerReading">Odometer Reading</Label>
              <Input
                id="odometerReading"
                type="number"
                {...register("odometerReading")}
                placeholder="e.g. 25000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Internal notes"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Create Job Card</Button>
        </div>
      </form>
    </div>
  );
}
