"use client";

import { useState, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Check, FileText, User, Car, Camera, Upload, X, ImageIcon, Trash2, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Breadcrumbs } from "@/components/shared/breadcrumbs";
import { JobCardStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { jobCards } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import type { JobCard, JobCardStatus, ServiceItem } from "@/types";

const WORKFLOW_STATUSES: JobCardStatus[] = [
  "RECEIVED",
  "INSPECTION",
  "AWAITING_APPROVAL",
  "IN_SERVICE",
  "QUALITY_CHECK",
  "READY",
  "DELIVERED",
];

const STATUS_LABELS: Record<JobCardStatus, string> = {
  RECEIVED: "Received",
  INSPECTION: "Inspection",
  AWAITING_APPROVAL: "Awaiting Approval",
  IN_SERVICE: "In Service",
  QUALITY_CHECK: "Quality Check",
  READY: "Ready",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function JobCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const jobCard = useMemo(
    () => jobCards.find((jc) => jc.id === id),
    [id]
  );

  const [currentStatus, setCurrentStatus] = useState<JobCardStatus>(
    () => jobCard?.status ?? "RECEIVED"
  );
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>(
    () => jobCard?.services ?? []
  );
  const [notes, setNotes] = useState<string>(jobCard?.notes ?? "");
  const [newNote, setNewNote] = useState("");

  const [inspectionPhotos, setInspectionPhotos] = useState<
    { id: string; url: string; type: "BEFORE" | "AFTER"; label: string }[]
  >([
    { id: "ph-1", url: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=300&fit=crop", type: "BEFORE", label: "Front View" },
    { id: "ph-2", url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=400&h=300&fit=crop", type: "BEFORE", label: "Left Side" },
    { id: "ph-3", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=300&fit=crop", type: "BEFORE", label: "Rear View" },
    { id: "ph-4", url: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop", type: "BEFORE", label: "Engine Bay" },
    { id: "ph-5", url: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=400&h=300&fit=crop", type: "AFTER", label: "Front View" },
    { id: "ph-6", url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop", type: "AFTER", label: "Left Side" },
    { id: "ph-7", url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop", type: "AFTER", label: "Rear View" },
    { id: "ph-8", url: "https://images.unsplash.com/photo-1619405399517-d7fce0f13302?w=400&h=300&fit=crop", type: "AFTER", label: "Engine Bay" },
  ]);
  const [photoTab, setPhotoTab] = useState<"BEFORE" | "AFTER" | "COMPARE">("BEFORE");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      setInspectionPhotos((prev) => [
        ...prev,
        { id: `ph-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, url, type: photoTab === "COMPARE" ? "BEFORE" : photoTab, label: name },
      ]);
    });

    toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} added`);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const handleRemovePhoto = (photoId: string) => {
    setInspectionPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (viewingPhoto === photoId) setViewingPhoto(null);
  };

  const viewingPhotoData = viewingPhoto ? inspectionPhotos.find((p) => p.id === viewingPhoto) : null;
  const filteredPhotos = inspectionPhotos.filter((p) => p.type === photoTab);
  const viewingIndex = viewingPhoto ? filteredPhotos.findIndex((p) => p.id === viewingPhoto) : -1;

  const navigatePhoto = (dir: -1 | 1) => {
    const nextIdx = viewingIndex + dir;
    if (nextIdx >= 0 && nextIdx < filteredPhotos.length) {
      setViewingPhoto(filteredPhotos[nextIdx].id);
    }
  };

  const [dragId, setDragId] = useState<string | null>(null);

  const handleDragStart = (photoId: string) => {
    setDragId(photoId);
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;

    setInspectionPhotos((prev) => {
      const items = [...prev];
      const dragIdx = items.findIndex((p) => p.id === dragId);
      const targetIdx = items.findIndex((p) => p.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return prev;
      const [dragged] = items.splice(dragIdx, 1);
      items.splice(targetIdx, 0, dragged);
      return items;
    });
  };

  const handleDragEnd = () => {
    setDragId(null);
  };

  const currentStatusIndex = useMemo(() => {
    if (currentStatus === "CANCELLED") return -1;
    return WORKFLOW_STATUSES.indexOf(currentStatus);
  }, [currentStatus]);

  const completedCount = serviceItems.filter((s) => s.isCompleted).length;
  const totalCount = serviceItems.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleServiceComplete = (serviceId: string) => {
    setServiceItems((prev) =>
      prev.map((s) =>
        s.id === serviceId ? { ...s, isCompleted: !s.isCompleted } : s
      )
    );
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes((prev) => prev + (prev ? "\n\n" : "") + newNote.trim());
      setNewNote("");
    }
  };

  const handleUpdateStatus = () => {
    if (!jobCard || currentStatus === "DELIVERED" || currentStatus === "CANCELLED") return;
    const nextIndex = currentStatusIndex + 1;
    if (nextIndex < WORKFLOW_STATUSES.length) {
      const nextStatus = WORKFLOW_STATUSES[nextIndex];
      setCurrentStatus(nextStatus);
      toast.success("Status updated", {
        description: `Job card moved to "${STATUS_LABELS[nextStatus]}"`,
      });
    }
  };

  const handleCancel = () => {
    if (!jobCard || currentStatus === "DELIVERED") return;
    setCurrentStatus("CANCELLED");
    toast.error("Job card cancelled", {
      description: `${jobCard.jobNumber} has been cancelled.`,
    });
  };

  if (!jobCard) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <PageHeader
          title="Job Card Not Found"
          actions={
            <Link href="/job-cards">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Job Cards
              </Button>
            </Link>
          }
        />
        <p className="text-muted-foreground">The requested job card could not be found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <Breadcrumbs items={[
        { label: "Job Cards", href: "/job-cards" },
        { label: jobCard.jobNumber },
      ]} />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-tight">
            {jobCard.jobNumber}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <JobCardStatusBadge status={currentStatus} />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Created</p>
            <p className="font-medium">{formatDate(jobCard.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expected Delivery</p>
            <p className="font-medium">{formatDate(jobCard.expectedDelivery)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Mechanic</p>
            <p className="font-medium">{jobCard.mechanicName ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{jobCard.customerName}</p>
            <p className="text-sm text-muted-foreground">{jobCard.customerPhone}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vehicle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{jobCard.vehicleRegNumber}</p>
            <p className="text-sm text-muted-foreground">{jobCard.vehicleMakeModel}</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Workflow Bar */}
      {currentStatus !== "CANCELLED" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {WORKFLOW_STATUSES.map((status, index) => {
                const isCompleted = index < currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const isLast = index === WORKFLOW_STATUSES.length - 1;

                return (
                  <div key={status} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : isCurrent
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted-foreground/30 bg-muted/50 text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <span className="text-xs font-medium">{index + 1}</span>
                        )}
                      </div>
                      <span
                        className={`text-xs mt-1 text-center max-w-[70px] truncate ${
                          isCurrent ? "font-semibold text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                    {!isLast && (
                      <div
                        className={`w-8 sm:w-12 h-0.5 mx-1 ${
                          isCompleted ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleUpdateStatus}
                disabled={
                  currentStatus === "DELIVERED" ||
                  currentStatusIndex >= WORKFLOW_STATUSES.length - 1
                }
              >
                Update Status
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={currentStatus === "DELIVERED"}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Checklist Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Service Checklist</CardTitle>
          <div className="flex items-center gap-4 mt-2">
            <Progress value={progressPercent} className="w-32 h-2" />
            <span className="text-sm text-muted-foreground">
              {completedCount} of {totalCount} completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {serviceItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={item.isCompleted}
                    onCheckedChange={() => toggleServiceComplete(item.id)}
                  />
                  <div>
                    <p
                      className={`font-medium ${
                        item.isCompleted ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                      }).format(item.price)}
                    </p>
                  </div>
                </div>
                {item.isCompleted && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Done
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inspection Photos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Inspection Photos
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => setPhotoTab("BEFORE")}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${photoTab === "BEFORE" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  Before
                </button>
                <button
                  onClick={() => setPhotoTab("AFTER")}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${photoTab === "AFTER" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  After
                </button>
                <button
                  onClick={() => setPhotoTab("COMPARE")}
                  className={`px-3 py-1 text-xs font-medium transition-colors ${photoTab === "COMPARE" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  Compare
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {photoTab === "COMPARE" ? (
            <CompareView photos={inspectionPhotos} />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    draggable
                    onDragStart={() => handleDragStart(photo.id)}
                    onDragOver={(e) => handleDragOver(e, photo.id)}
                    onDragEnd={handleDragEnd}
                    className={`rounded-xl border border-border overflow-hidden bg-card transition-all ${dragId === photo.id ? "opacity-50 scale-95 ring-2 ring-primary" : "hover:shadow-lg"}`}
                  >
                    <div className="relative">
                      <img src={photo.url} alt={photo.label} className="w-full aspect-4/3 object-cover" />
                    </div>
                    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                      <button
                        onClick={() => setViewingPhoto(photo.id)}
                        className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border min-h-[220px] hover:border-primary/50 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
                >
                  <Upload className="w-7 h-7 mb-2" />
                  <span className="text-sm font-medium">Upload Photo</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              {filteredPhotos.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
                  <p className="text-sm">No {photoTab.toLowerCase()} photos yet</p>
                </div>
              )}
            </>
          )}

          {viewingPhotoData && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setViewingPhoto(null)}>
              <button onClick={() => setViewingPhoto(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
                <X className="w-5 h-5" />
              </button>

              {viewingIndex > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigatePhoto(-1); }}
                  className="absolute left-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              <div className="max-w-3xl max-h-[80vh] mx-16" onClick={(e) => e.stopPropagation()}>
                <img src={viewingPhotoData.url} alt={viewingPhotoData.label} className="w-full h-full object-contain rounded-lg" />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-white text-sm font-medium">{viewingPhotoData.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-white/60 text-xs">{viewingIndex + 1} / {filteredPhotos.length}</span>
                    <button
                      onClick={() => handleRemovePhoto(viewingPhotoData.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              {viewingIndex < filteredPhotos.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); navigatePhoto(1); }}
                  className="absolute right-4 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notes && (
            <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap">
              {notes}
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Textarea
              placeholder="Add a note..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              className="flex-1"
            />
            <Button onClick={addNote} variant="secondary" className="shrink-0 sm:self-end">
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Link href={`/billing?jobCardId=${jobCard.id}`}>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Generate Invoice
            </Button>
          </Link>
          <Link href={`/customers/${jobCard.customerId}`}>
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" />
              View Customer
            </Button>
          </Link>
          <Link href={`/vehicles/${jobCard.vehicleId}`}>
            <Button variant="outline">
              <Car className="w-4 h-4 mr-2" />
              View Vehicle
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function CompareView({ photos }: { photos: { id: string; url: string; type: "BEFORE" | "AFTER"; label: string }[] }) {
  const beforePhotos = photos.filter((p) => p.type === "BEFORE");
  const afterPhotos = photos.filter((p) => p.type === "AFTER");
  const maxLen = Math.max(beforePhotos.length, afterPhotos.length);

  if (beforePhotos.length === 0 && afterPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm">No photos to compare</p>
        <p className="text-xs mt-1">Upload Before and After photos first</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            Before
          </span>
        </div>
        <div className="text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
            After
          </span>
        </div>
      </div>
      {Array.from({ length: maxLen }).map((_, i) => (
        <div key={i} className="grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
            {beforePhotos[i] ? (
              <div>
                <img src={beforePhotos[i].url} alt={beforePhotos[i].label} className="w-full aspect-4/3 object-cover" />
                <p className="text-xs font-medium text-center py-2 border-t border-border">{beforePhotos[i].label}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-4/3 text-muted-foreground">
                <p className="text-xs">No photo</p>
              </div>
            )}
          </div>
          <div className="rounded-xl border border-border overflow-hidden bg-muted/30">
            {afterPhotos[i] ? (
              <div>
                <img src={afterPhotos[i].url} alt={afterPhotos[i].label} className="w-full aspect-4/3 object-cover" />
                <p className="text-xs font-medium text-center py-2 border-t border-border">{afterPhotos[i].label}</p>
              </div>
            ) : (
              <div className="flex items-center justify-center aspect-4/3 text-muted-foreground">
                <p className="text-xs">No photo</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
