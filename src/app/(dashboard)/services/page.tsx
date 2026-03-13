"use client";

import { useState, useMemo } from "react";
import { serviceCatalog } from "@/lib/mock-data";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Wrench, Tag, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const categories = Array.from(new Set(serviceCatalog.map((s) => s.category)));

export default function ServicesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    let result = serviceCatalog;
    if (categoryFilter !== "all") {
      result = result.filter((s) => s.category === categoryFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return result;
  }, [search, categoryFilter]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Service added successfully");
    setDialogOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Service Catalog"
        description="Manage your service offerings and pricing"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" />Add Service</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Service</DialogTitle>
                <DialogDescription>Add a new service to the catalog.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="svc-name">Service Name</Label>
                  <Input id="svc-name" placeholder="e.g. Oil Change" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="svc-desc">Description</Label>
                  <Input id="svc-desc" placeholder="Brief description" required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="svc-category">Category</Label>
                    <Select required>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                        <SelectItem value="__new">+ New Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="svc-price">Base Price (₹)</Label>
                    <Input id="svc-price" type="number" placeholder="0" required />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Service</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5!">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                    <Wrench className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm">{service.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{service.description}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-1 text-sm">
                  <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">{service.category}</span>
                </div>
                <span className="font-semibold text-sm">
                  {formatCurrency(service.defaultPrice)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                <ToggleRight className={`w-4 h-4 ${service.isActive ? "text-emerald-500" : "text-gray-400"}`} />
                <span className={`text-xs font-medium ${service.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
                  {service.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No services found matching your criteria.
        </div>
      )}
    </div>
  );
}
