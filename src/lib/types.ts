export interface ShopInfo {
  name: string;
  phone: string;
  address: string;
}

export interface TermsSet {
  id: string;
  title: string;        // internal label only — not shown in preview or PDF
  description: string;
  rules: string[];      // max 5
}

export interface Provider {
  id: string;
  name: string;
  description?: string;
  advanceDays: number;        // default: 5
  emiIncrement: number;
  termsSets: TermsSet[];      // max 5
}

export interface PdfSettings {
  defaultTemplate: 'classic' | 'modern' | 'compact' | 'elegant' | 'minimalist';
  defaultAddTotal: boolean;
}

export interface Preferences {
  theme: 'light' | 'dark' | 'system';
  onboardingComplete: boolean;
}

export interface EMIRow {
  index: number;
  advanceDate: string;   // formatted DD/MM/YYYY
  emiDate: string;       // formatted DD/MM/YYYY
  amount: number;
  remark: string;        // always empty — filled by pen
}

export interface EMIFormState {
  providerId: string;
  firstEmiAmount: number;
  emiIncrement: number;
  emiCount: number;
  firstEmiDate: string;
  termsSetId: string;
  template: 'classic' | 'modern' | 'compact' | 'elegant' | 'minimalist';
  addTotal: boolean;
}
