import { create } from 'zustand';
import { EMIFormState } from '../lib/types';

interface EMIFormStore {
  formState: EMIFormState | null;
  setFormState: (state: EMIFormState) => void;
  clearFormState: () => void;
}

export const useEMIFormStore = create<EMIFormStore>((set) => ({
  formState: null,
  setFormState: (formState) => set({ formState }),
  clearFormState: () => set({ formState: null }),
}));
