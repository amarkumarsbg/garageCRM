export type UserRole = "ADMIN" | "MANAGER" | "RECEPTIONIST" | "MECHANIC";

export type JobCardStatus =
  | "RECEIVED"
  | "INSPECTION"
  | "AWAITING_APPROVAL"
  | "IN_SERVICE"
  | "QUALITY_CHECK"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID";

export type PaymentMethod = "CASH" | "UPI" | "CARD";

export type FuelType = "PETROL" | "DIESEL" | "CNG" | "ELECTRIC" | "HYBRID";

export type InspectionPhotoType = "BEFORE" | "AFTER";

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: string;
  avatar?: string;
  isActive: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  referralCode: string;
  referredBy?: string;
  totalVisits: number;
  rewardPoints: number;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  customerId: string;
  customerName: string;
  registrationNumber: string;
  make: string;
  model: string;
  variant?: string;
  fuelType: FuelType;
  color: string;
  year: number;
  notes?: string;
}

export interface ServiceCatalogItem {
  id: string;
  name: string;
  description: string;
  defaultPrice: number;
  category: string;
  isActive: boolean;
}

export interface ServiceItem {
  id: string;
  jobCardId: string;
  serviceCatalogId: string;
  name: string;
  price: number;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface JobCard {
  id: string;
  jobNumber: string;
  branchId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleRegNumber: string;
  vehicleMakeModel: string;
  mechanicId?: string;
  mechanicName?: string;
  status: JobCardStatus;
  reportedIssues: string;
  odometerReading?: number;
  expectedDelivery: string;
  actualDelivery?: string;
  services: ServiceItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  type: "SERVICE" | "PARTS" | "LABOR" | "OTHER";
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  referenceNumber?: string;
  paidAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobCardId: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleRegNumber: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  rewardDiscount: number;
  grandTotal: number;
  status: InvoiceStatus;
  payments: Payment[];
  createdAt: string;
}

export interface DashboardStats {
  carsReceivedToday: number;
  carsDeliveredToday: number;
  inProgressServices: number;
  dailyRevenue: number;
  newCustomersToday: number;
  monthlyRevenue: { month: string; revenue: number }[];
  serviceBreakdown: { name: string; count: number }[];
  todaysBookings: JobCard[];
  readyForDelivery: JobCard[];
}

// Inventory / Parts
export type PartCategory =
  | "Engine"
  | "Brakes"
  | "Electrical"
  | "Filters"
  | "Suspension"
  | "AC"
  | "Body"
  | "Lubricants"
  | "Tires"
  | "Other";

export interface Part {
  id: string;
  name: string;
  sku: string;
  category: PartCategory;
  quantity: number;
  unitPrice: number;
  reorderLevel: number;
  supplier: string;
  lastRestocked: string;
}

export interface StockMovement {
  id: string;
  partId: string;
  type: "IN" | "OUT";
  quantity: number;
  reason: string;
  performedBy: string;
  createdAt: string;
}

// Appointments
export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Appointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  vehicleId: string;
  vehicleRegNumber: string;
  vehicleMakeModel: string;
  serviceType: string;
  mechanicId?: string;
  mechanicName?: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

// Activity Log
export type ActivityEntityType =
  | "JOB_CARD"
  | "CUSTOMER"
  | "VEHICLE"
  | "INVOICE"
  | "APPOINTMENT"
  | "INVENTORY"
  | "STAFF";

export type ActivityAction =
  | "CREATED"
  | "UPDATED"
  | "STATUS_CHANGED"
  | "PAYMENT_RECEIVED"
  | "ASSIGNED"
  | "COMPLETED"
  | "CANCELLED"
  | "STOCK_ADJUSTED";

export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entityType: ActivityEntityType;
  entityId: string;
  entityLabel: string;
  userId: string;
  userName: string;
  details: string;
  createdAt: string;
}

// Service Reminders
export type ReminderStatus = "UPCOMING" | "DUE" | "OVERDUE" | "COMPLETED" | "DISMISSED";
export type ReminderType = "GENERAL_SERVICE" | "OIL_CHANGE" | "BRAKE_INSPECTION" | "TIRE_ROTATION" | "AC_SERVICE" | "BATTERY_CHECK" | "INSURANCE" | "PUC";

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  vehicleRegNumber: string;
  vehicleMakeModel: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  type: ReminderType;
  dueDate: string;
  lastServiceDate?: string;
  lastJobCardId?: string;
  odometerAtLastService?: number;
  nextDueOdometer?: number;
  status: ReminderStatus;
  notes?: string;
}
