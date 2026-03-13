"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";
import {
  Building2,
  Receipt,
  Gift,
  Bell,
  Save,
  Percent,
  IndianRupee,
  Coins,
  Clock,
  Mail,
  Phone,
  MapPin,
  FileText,
} from "lucide-react";

function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      enabled ? "bg-primary" : "bg-muted"
    )}>
      <span className={cn(
        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
        enabled ? "translate-x-6" : "translate-x-1"
      )} />
    </button>
  );
}

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [businessName, setBusinessName] = useState(settings.businessName);
  const [businessPhone, setBusinessPhone] = useState(settings.businessPhone);
  const [businessEmail, setBusinessEmail] = useState(settings.businessEmail);
  const [businessAddress, setBusinessAddress] = useState(settings.businessAddress);
  const [gstin, setGstin] = useState(settings.gstin);

  const [defaultTaxRate, setDefaultTaxRate] = useState("18");
  const [taxRates, setTaxRates] = useState([
    { id: "1", category: "General Service", rate: "18" },
    { id: "2", category: "Spare Parts", rate: "28" },
    { id: "3", category: "Labour", rate: "18" },
    { id: "4", category: "AC Service", rate: "18" },
    { id: "5", category: "Body Work", rate: "18" },
  ]);

  const [earningRate, setEarningRate] = useState("1");
  const [redemptionValue, setRedemptionValue] = useState("0.25");
  const [referralBonus, setReferralBonus] = useState("100");
  const [minRedeemPoints, setMinRedeemPoints] = useState("200");

  const [notifJobUpdate, setNotifJobUpdate] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);
  const [notifReminder, setNotifReminder] = useState(true);
  const [notifNewCustomer, setNotifNewCustomer] = useState(false);
  const [notifLowStock, setNotifLowStock] = useState(true);
  const [autoCleanupDays, setAutoCleanupDays] = useState("10");
  const [currency, setCurrency] = useState("INR");
  const [timeZone, setTimeZone] = useState("Asia/Kolkata");

  const handleSave = (section: string) => {
    if (section === "Business profile") {
      settings.setBusinessProfile({ businessName, businessPhone, businessEmail, businessAddress, gstin });
    }
    toast.success(`${section} saved successfully`);
  };

  const handleTaxRateChange = (id: string, rate: string) => {
    setTaxRates((prev) => prev.map((t) => (t.id === id ? { ...t, rate } : t)));
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Settings" />

      <Tabs defaultValue="business" className="space-y-4">
        <TabsList>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="tax">Tax & Billing</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-w-xl">
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />Phone</Label>
                    <Input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />Email</Label>
                    <Input value={businessEmail} onChange={(e) => setBusinessEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />Address</Label>
                  <Input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" />GSTIN</Label>
                  <Input value={gstin} onChange={(e) => setGstin(e.target.value)} className="font-mono" />
                </div>
                <Separator />
                <Button onClick={() => handleSave("Business profile")}>
                  <Save className="w-4 h-4 mr-2" />Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="w-4 h-4" />
                Tax Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-w-xl">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Percent className="w-3.5 h-3.5" />Default Tax Rate (%)</Label>
                  <Input type="number" value={defaultTaxRate} onChange={(e) => setDefaultTaxRate(e.target.value)} className="max-w-32" />
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium">Category-wise Tax Rates</p>
                  {taxRates.map((t) => (
                    <div key={t.id} className="flex items-center gap-4">
                      <span className="text-sm min-w-[140px]">{t.category}</span>
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="number"
                          value={t.rate}
                          onChange={(e) => handleTaxRateChange(t.id, e.target.value)}
                          className="w-20 h-9"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <Button onClick={() => handleSave("Tax configuration")}>
                  <Save className="w-4 h-4 mr-2" />Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Gift className="w-4 h-4" />
                Rewards & Referral Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-w-xl">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Coins className="w-3.5 h-3.5" />Points Earning Rate</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={earningRate} onChange={(e) => setEarningRate(e.target.value)} className="w-24" />
                    <span className="text-sm text-muted-foreground">points per ₹100 spent</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" />Redemption Value</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">1 point =</span>
                    <span className="text-sm text-muted-foreground">₹</span>
                    <Input type="number" step="0.01" value={redemptionValue} onChange={(e) => setRedemptionValue(e.target.value)} className="w-24" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Gift className="w-3.5 h-3.5" />Referral Bonus Points</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={referralBonus} onChange={(e) => setReferralBonus(e.target.value)} className="w-24" />
                    <span className="text-sm text-muted-foreground">points for both referrer and new customer</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Points to Redeem</Label>
                  <Input type="number" value={minRedeemPoints} onChange={(e) => setMinRedeemPoints(e.target.value)} className="w-24" />
                </div>
                <Separator />
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium mb-2">Example Calculation</p>
                  <p className="text-xs text-muted-foreground">
                    Customer spends ₹5,000 → Earns {(5000 / 100 * Number(earningRate)).toFixed(0)} points →
                    Worth ₹{(5000 / 100 * Number(earningRate) * Number(redemptionValue)).toFixed(2)} discount
                  </p>
                </div>
                <Button onClick={() => handleSave("Rewards configuration")}>
                  <Save className="w-4 h-4 mr-2" />Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 max-w-xl">
                {[
                  { label: "Job card status updates", desc: "Notify when job card status changes", enabled: notifJobUpdate, toggle: () => setNotifJobUpdate((v) => !v) },
                  { label: "Payment received", desc: "Notify when a payment is recorded", enabled: notifPayment, toggle: () => setNotifPayment((v) => !v) },
                  { label: "Service reminders", desc: "Notify when a service reminder is due", enabled: notifReminder, toggle: () => setNotifReminder((v) => !v) },
                  { label: "New customer registration", desc: "Notify when a new customer signs up", enabled: notifNewCustomer, toggle: () => setNotifNewCustomer((v) => !v) },
                  { label: "Low stock alerts", desc: "Notify when inventory items are below reorder level", enabled: notifLowStock, toggle: () => setNotifLowStock((v) => !v) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-4 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <ToggleSwitch enabled={item.enabled} onToggle={item.toggle} />
                  </div>
                ))}
                <div className="pt-4">
                  <Button onClick={() => handleSave("Notification preferences")}>
                    <Save className="w-4 h-4 mr-2" />Save Changes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5 max-w-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><IndianRupee className="w-3.5 h-3.5" />Currency</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Time Zone</Label>
                    <Select value={timeZone} onValueChange={setTimeZone}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Auto-delete Inspection Photos After</Label>
                  <div className="flex items-center gap-2">
                    <Input type="number" value={autoCleanupDays} onChange={(e) => setAutoCleanupDays(e.target.value)} className="w-20" />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Set to 0 to keep photos indefinitely</p>
                </div>
                <Separator />
                <Button onClick={() => handleSave("General preferences")}>
                  <Save className="w-4 h-4 mr-2" />Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
