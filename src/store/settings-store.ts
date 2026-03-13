"use client";

import { create } from "zustand";

interface SettingsState {
  businessName: string;
  businessPhone: string;
  businessEmail: string;
  businessAddress: string;
  gstin: string;
  setBusinessProfile: (profile: Partial<Pick<SettingsState, "businessName" | "businessPhone" | "businessEmail" | "businessAddress" | "gstin">>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  businessName: "GarageCRM",
  businessPhone: "+91-80-4123-4567",
  businessEmail: "hello@garagecrm.in",
  businessAddress: "80 Feet Road, Koramangala 4th Block, Bengaluru 560034",
  gstin: "29AABCT1234F1ZP",
  setBusinessProfile: (profile) => set((state) => ({ ...state, ...profile })),
}));
