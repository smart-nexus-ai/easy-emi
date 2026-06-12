# Easy EMI Manager — Technical Requirements

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| UI Components | Lucide Icons | Latest |
| PDF Generation | jsPDF | 2.x |
| Global State | Zustand | Latest |
| PWA | @ducanh2912/next-pwa | Latest (configured conditionally) |
| Hosting | Vercel | — |

## Folder Structure

```
app/
├── globals.css                    ← Global styling (Tailwind CSS v4)
├── layout.tsx                     ← Root layout metadata and layout wrapper
├── not-found.tsx                  ← Custom 404 page (resolves PWA build checks)
└── page.tsx                       ← SPA route switcher & Service Worker register
src/
├── components/
│   ├── forms/
│   │   └── OnboardingWizard.tsx   ← First-time setup wizard view
│   ├── shared/
│   │   ├── BottomNav.tsx          ← Bottom mobile navigation rail
│   │   └── ThemeToggle.tsx        ← Theme switching button
│   └── views/
│       ├── HomeView.tsx           ← EMI form and live STAT calculation panel
│       ├── PreviewView.tsx        ← jsPDF compiler layout action console
│       ├── ProviderDetailView.tsx ← Create or edit individual finance partner
│       ├── ProvidersListView.tsx  ← Grid cards list of saved partners
│       └── SettingsView.tsx       ← App preferences, templates, back-up logs
├── lib/
│   ├── emi.ts                     ← EMI calculations and schedule table logic
│   ├── storage.ts                 ← LocalStorage CRUD utilities and theme triggers
│   ├── types.ts                   ← Shared TypeScript interfaces
│   └── pdf/
│       ├── generators.ts          ← All 5 jsPDF invoice design templates
│       └── fonts/
│           └── NotoSansBengali.ts ← Bengali print font bundle
└── store/
    ├── emiFormStore.ts            ← Zustand state for EMI form values
    └── navigationStore.ts         ← Zustand client-side SPA routing state
```

## TypeScript Types (`src/lib/types.ts`)

```ts
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
```

## Architectural Rules
- App Router only — no Pages Router
- TypeScript strict mode enabled (`"strict": true` in `tsconfig.json`)
- Tailwind v4 only — no inline styles
- All pages are client components (`'use client'`) — no SSR needed, all data is LocalStorage
- All LocalStorage reads and writes go through `src/lib/storage.ts` helpers only — never access `localStorage` directly in components
- EMI calculation logic lives only in `src/lib/emi.ts`
- PDF generation logic lives only in `src/lib/pdf/generators.ts`
- Zustand store (`emiFormStore`) is used to pass EMI form state to the Preview screen
- Zustand store (`navigationStore`) manages SPA client-side routes

## Constraints
- Must work fully offline after first page load
- No API calls, no external data fetching at runtime
- Mobile-first — primary use on phone (375px–430px)
- Minimum Number of EMIs: **6** (India EMI provider minimum tenure)
- PDF output: black & white, A4, print-friendly
- jsPDF only — no server-side PDF rendering
- Custom service worker registered dynamically on the client side for offline caching support
