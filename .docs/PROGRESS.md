# Easy EMI Manager — Progress

- [x] **Phase 0 — Setup**
  - [x] Init Next.js 15 with TypeScript + Tailwind
  - [x] Install shadcn/ui, jsPDF, Zustand, next-pwa, next-themes
  - [x] Set up folder structure
  - [x] Configure dark/light theme
  - [x] Deploy blank app to Vercel

- [x] **Phase 1 — LocalStorage Layer**
  - [x] TypeScript types (`src/lib/types.ts`)
  - [x] Storage helpers (`src/lib/storage.ts`)
  - [x] EMI calculation logic (`src/lib/emi.ts`)
  - [x] Zustand EMI form store (`src/store/emiFormStore.ts`)

- [x] **Phase 2 — Onboarding Flow**
  - [x] First-launch redirect logic
  - [x] Step 1: Shop Info
  - [x] Step 2: First Provider (optional)
  - [x] Step 3: Default PDF Template
  - [x] Skip functionality at every step

- [x] **Phase 3 — Provider Management**
  - [x] Provider list page (`/providers` view)
  - [x] Add/edit provider form (`/providers/[id]` view)
  - [x] Terms Sets CRUD within provider form
  - [x] Delete provider with confirmation
  - [x] Max 5 terms sets enforced
  - [x] Max 5 rules per terms set enforced

- [x] **Phase 4 — Home Screen & EMI Form**
  - [x] Provider dropdown
  - [x] 1st EMI Amount input
  - [x] Regular EMI inline display + Edit
  - [x] Regular EMI resets on provider change
  - [x] Number of EMIs input (min 6 validation)
  - [x] 1st EMI Date picker
  - [x] Terms Set dropdown (filtered by provider)
  - [x] PDF Template dropdown
  - [x] Add Total Amount checkbox
  - [x] Preview button with full validation
  - [x] Empty state when no providers

- [x] **Phase 5 — PDF Preview Screen**
  - [x] Shop info header
  - [x] EMI schedule table (blank Remark column)
  - [x] Terms & Conditions section
  - [x] Total Amount (conditional)
  - [x] Signature section
  - [x] Download button
  - [x] Print button (natively redirects to `window.print()` for CTL support)
  - [x] Share button (Web Share API)
  - [x] Back to Home (form state preserved)

- [x] **Phase 6 — PDF Generation**
  - [x] Classic template (`src/lib/pdf/generators.ts`)
  - [x] Modern template (`src/lib/pdf/generators.ts`)
  - [x] Compact template (`src/lib/pdf/generators.ts`)
  - [x] Elegant template (`src/lib/pdf/generators.ts`)
  - [x] Minimalist template (`src/lib/pdf/generators.ts`)
  - [x] Download on mobile Chrome/Safari
  - [x] Web Share API (with fallback)

- [x] **Phase 7 — Settings Screen**
  - [x] Shop info section
  - [x] PDF settings section
  - [x] Providers list section
  - [x] Export data (JSON download)
  - [x] Import data — Replace flow
  - [x] Import data — Merge flow
  - [x] Merge conflict resolution UI

- [x] **Phase 8 — PWA & Offline**
  - [x] next-pwa configured
  - [x] manifest.json created
  - [x] App icons added
  - [x] Offline test passed
  - [x] Installable on Android Chrome

- [x] **Phase 9 — Polish & Testing**
  - [x] All empty states tested
  - [x] All error states tested
  - [x] Responsive at 375px, 390px, 430px
  - [x] Dark/light mode audit across all screens
  - [x] PDF print test on real A4 paper
  - [x] Final Vercel deploy

- [x] **Phase 10 — Indic Script (Bengali) & Layout Optimization**
  - [x] Imported Google Fonts Noto Sans Bengali for correct browser fallback
  - [x] Configured native browser print routing on a hidden, print-only A4 virtual sheet layout to leverage native CTL (Complex Text Layout) font shaping
  - [x] Created `preprocessBengali` Unicode vowel-reordering helper in `generators.ts` to swap left-vowels and split-vowels before writing to jsPDF, resolving dotted circles and misplaced markers in downloads
  - [x] Added Printing Tip notice box to UI recommending Direct Standard Print
