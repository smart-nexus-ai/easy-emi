# Easy EMI Manager — Implementation Plan

## Phase Overview

| Phase | Name | Description |
|-------|------|-------------|
| 0 | Setup | Init project, install deps, deploy blank to Vercel |
| 1 | LocalStorage Layer | Types, storage helpers, EMI calculation logic |
| 2 | Onboarding Flow | 3-step wizard with skip option |
| 3 | Provider Management | Add, edit, delete providers and terms sets |
| 4 | Home Screen & EMI Form | Full form with inline Regular EMI editing |
| 5 | PDF Preview Screen | Schedule table, terms, total, signature |
| 6 | PDF Generation | 3 templates (Classic, Modern, Compact) using jsPDF |
| 7 | Settings Screen | Shop info, PDF defaults, export/import |
| 8 | PWA & Offline | next-pwa, manifest, service worker |
| 9 | Polish & Testing | Edge cases, empty states, responsive, print test |

---

## Phase 0 — Setup
### Goal
Working Next.js app deployed to Vercel with zero errors.

### Steps
1. Init Next.js 15 with TypeScript and Tailwind CSS
2. Install: shadcn/ui, jsPDF, Zustand, next-pwa, next-themes
3. Set up folder structure per TECH.md
4. Configure dark/light theme with `next-themes`
5. Deploy blank app to Vercel

### Done Criteria
- [ ] `npm run build` passes with zero errors
- [ ] App live on Vercel
- [ ] Dark/light theme toggle working

---

## Phase 1 — LocalStorage Layer
### Goal
All data types defined and all storage helpers working before any UI is built.

### Steps
1. Write all TypeScript types in `lib/types.ts`
2. Write storage helpers in `lib/storage.ts` (see STORAGE.md for all methods)
3. Write EMI calculation logic in `lib/emi.ts`:
   - `generateSchedule(params: EMIFormState, provider: Provider): EMIRow[]`
   - `calculateAdvanceDate(emiDate: Date, advanceDays: number): Date`
   - `calculateTotal(firstEmi: number, regularEmi: number, count: number): number`
4. Write Zustand store in `store/emiFormStore.ts` for passing form state to Preview

### Done Criteria
- [ ] All TypeScript types defined with no errors
- [ ] Storage helpers read/write correctly verified in browser console
- [ ] `generateSchedule` produces correct dates and amounts
- [ ] Advance date formula: `emiDate - advanceDays` working correctly
- [ ] Total formula: `firstEmi + (regularEmi × (count - 1))` working correctly

---

## Phase 2 — Onboarding Flow
### Goal
First-time users guided through setup without friction. Fully skippable.

### Steps
1. On app root load: check `preferences.onboardingComplete` → redirect to `/onboarding` if false
2. Build 3-step wizard UI at `/onboarding`
   - Step 1: Shop Info (name, phone, address)
   - Step 2: Add first provider — name, advance days, regular EMI (optional step)
   - Step 3: Select default PDF template
3. Add Skip button on each step
4. On complete or after final skip → set `onboardingComplete: true` → redirect to `/`

### Done Criteria
- [ ] Onboarding shows automatically on first launch
- [ ] Skip works at every step without error
- [ ] Completed data saves to LocalStorage correctly
- [ ] Onboarding does not show again after completion

---

## Phase 3 — Provider Management
### Goal
Full CRUD for providers and their terms sets.

### Steps
1. Build provider list page at `/providers`
2. Build provider add/edit form at `/providers/[id]`
   - Fields: Name, Description (optional), Advance Days, Regular EMI Amount
3. Build Terms Sets section within provider form
   - Add up to 5 Terms Sets per provider
   - Each Terms Set: Title (internal), Description, up to 5 Rules
   - Rules are plain text strings, one per input row
4. Delete provider with confirmation dialog

### Done Criteria
- [ ] Add new provider saves correctly
- [ ] Edit existing provider updates correctly
- [ ] Delete provider removes from LocalStorage
- [ ] Terms sets add, edit, delete within provider form
- [ ] Max 5 terms sets per provider enforced (Add button hidden at limit)
- [ ] Max 5 rules per terms set enforced (Add Rule button hidden at limit)

---

## Phase 4 — Home Screen & EMI Form
### Goal
Core form that collects all data needed to generate the EMI schedule.

### Steps
1. Build provider dropdown (populated from LocalStorage)
2. Build 1st EMI Amount number input
3. After 1st EMI entered: show Regular EMI row below it
   - Pre-filled from selected provider's `regularEmiAmount`
   - Displayed as read-only with an Edit button
   - On Edit: becomes an inline editable number input
   - On provider change: Regular EMI resets to new provider's default
4. Build Number of EMIs number input — minimum 6, show validation error below threshold
5. Build 1st EMI Date picker
6. Build Terms Template dropdown — filtered to selected provider's terms sets
7. Build PDF Template dropdown — defaults to `pdfSettings.defaultTemplate`
8. Build Add Total Amount checkbox — defaults to `pdfSettings.defaultAddTotal`
9. Preview PDF button: validate all required fields → save to Zustand store → navigate to `/preview`

### Done Criteria
- [ ] All fields functional
- [ ] Regular EMI shows after 1st EMI is entered
- [ ] Regular EMI inline edit works
- [ ] Regular EMI resets when provider changes
- [ ] Min 6 EMIs enforced with inline error message
- [ ] Terms dropdown updates when provider changes
- [ ] Validation prevents preview with empty required fields
- [ ] Empty state shown when no providers exist

---

## Phase 5 — PDF Preview Screen
### Goal
Accurate on-screen preview of the slip that will be printed/downloaded.

### Steps
1. Read EMI form state from Zustand store
2. Generate `EMIRow[]` using `lib/emi.ts` → `generateSchedule()`
3. Build preview layout:
   - Shop info header (name, phone, address)
   - EMI schedule table (Advance Date | EMI Date | EMI Amount | Remark)
   - Remark column cells: blank
   - Terms & Conditions section (description + numbered rules)
   - Total Amount section (only if `addTotal === true`)
   - Signature section: "Customer Signature" line
4. Add action buttons: Download, Print, Share, Back
5. Print button: `window.print()` with print-specific CSS to hide UI chrome

### Done Criteria
- [ ] All EMI rows display with correct dates and amounts
- [ ] Advance dates calculated correctly per provider's `advanceDays`
- [ ] Remark column is blank in all rows
- [ ] Total shows/hides correctly based on form state
- [ ] Terms display correctly — description + all rules
- [ ] Print button triggers browser print dialog
- [ ] Back returns to Home without losing form state

---

## Phase 6 — PDF Generation (3 Templates)
### Goal
Downloadable and shareable PDF in 3 visual styles using jsPDF.

### Steps
1. Build Classic template (`lib/pdf/classic.ts`) — layout similar to old Android app
2. Build Modern template (`lib/pdf/modern.ts`) — cleaner typography and spacing
3. Build Compact template (`lib/pdf/compact.ts`) — single-page condensed layout
4. Wire Download button → generate selected template → `doc.save('emi-schedule.pdf')`
5. Wire Share button → generate PDF → Blob → Web Share API
6. Fallback: if Web Share API unavailable → show Download only

### Done Criteria
- [ ] All 3 templates generate without errors
- [ ] Download works on mobile Chrome and Safari
- [ ] Share works on Android via Web Share API
- [ ] PDF is black & white, A4, readable when printed
- [ ] Remark column present but blank in all templates

---

## Phase 7 — Settings Screen
### Goal
Central screen for all persistent configuration and data management.

### Steps
1. Build Shop Information section — edit name, phone, address and save
2. Build PDF Settings section — default template selector, default add total checkbox
3. Build Providers section — list all providers with View, Edit, Delete actions and Add New button
4. Build Export Data button — serialize all LocalStorage keys to JSON → download as `easy-emi-backup.json`
5. Build Import Data button — file picker → parse JSON → validate structure
6. Import Replace flow: confirm dialog → clear all keys → write imported data
7. Import Merge flow: compare providers by name → show conflict resolution UI per conflicting provider (Skip / Replace / Rename)

### Done Criteria
- [ ] Shop info saves and persists across sessions
- [ ] PDF settings save and persist
- [ ] Export downloads valid JSON with correct structure
- [ ] Import Replace works and restores all data
- [ ] Import Merge adds non-conflicting providers directly
- [ ] Conflict resolution (Skip / Replace / Rename) works correctly

---

## Phase 8 — PWA & Offline
### Goal
App is installable on Android and works fully offline.

### Steps
1. Configure `next-pwa` in `next.config.js`
2. Create `public/manifest.json` — name, short_name, icons, theme_color, display: standalone
3. Add app icons (192×192, 512×512 PNG)
4. Verify service worker caches all routes and assets
5. Test: disable network → reload app → all screens must work

### Done Criteria
- [ ] App installable on Android Chrome ("Add to Home Screen")
- [ ] App works offline after first install
- [ ] All routes accessible offline
- [ ] App icon appears correctly on home screen

---

## Phase 9 — Polish & Testing
### Goal
Production-ready, all edge cases handled, PDF verified on real paper.

### Steps
1. Test all empty states (no providers, no terms sets)
2. Test all error states (invalid import, PDF fail, min EMI validation)
3. Verify responsive layout at 375px, 390px, 430px widths
4. Verify dark and light mode across every screen
5. Generate PDF and print on real A4 paper — verify alignment and readability
6. Fix any jsPDF rendering or spacing issues
7. Final Vercel deploy

### Done Criteria
- [ ] No broken layouts at any tested screen width
- [ ] No visual inconsistencies between dark and light mode
- [ ] Printed PDF is readable and well-aligned on A4 paper
- [ ] All empty and error states handled gracefully
- [ ] `npm run build` passes with zero warnings or errors
- [ ] Final production URL live
