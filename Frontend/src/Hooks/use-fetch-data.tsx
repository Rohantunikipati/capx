import { create } from "zustand";

interface PortfolioStore {
  data: any[]; // Use a specific type here if possible
  setData: (data: any[]) => void; // Use a specific type
}



export const usePortfolioStore = create<PortfolioStore>((set) => ({
  data: [],
  setData: (data) => set({ data }),
}));
