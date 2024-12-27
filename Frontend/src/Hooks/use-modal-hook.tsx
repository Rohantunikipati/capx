import { create } from "zustand";

interface useModalStoreInterface {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export const useModal = create<useModalStoreInterface>(set => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
