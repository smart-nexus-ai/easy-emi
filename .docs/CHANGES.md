# Change Log

## 2026-06-12 — PDF is a Payment Schedule Slip, Not an Invoice
**Type**: Feature Scope
**Decision**: The generated PDF is a payment schedule slip handed to the customer alongside the product invoice — not an invoice itself. Customer name and product/item fields are therefore not needed on the PDF.
**Reason**: Shop already provides a separate mobile invoice. This slip only shows the EMI schedule and finance provider terms.

---

## 2026-06-12 — Remark Column is Blank (Pen Use)
**Type**: Feature
**Decision**: The Remark column in the EMI schedule table is intentionally blank in the generated PDF. Shop owner fills it manually with a pen per installment as needed.
**Reason**: Remarks vary per installment and are not predictable at generation time.

---

## 2026-06-12 — Regular EMI Amount Moved from Provider to Home Form
**Type**: Architecture
**Before**: Regular EMI Amount was a fixed field stored on the Provider — same amount for all sessions using that provider.
**After**: Regular EMI Amount is shown inline on the Home Form after the 1st EMI is entered, pre-filled from the Provider's stored default, and editable per session without modifying the provider.
**Reason**: Different products sold under the same finance provider may have different regular EMI amounts. Storing it only at the provider level was too rigid.

---

## 2026-06-12 — Minimum Number of EMIs Set to 6
**Type**: Validation Rule
**Before**: No minimum defined for the Number of EMIs field.
**After**: Minimum value is 6. Input shows an inline validation error below 6.
**Reason**: All EMI finance providers in India enforce a minimum tenure of 6 months.

---

## 2026-06-12 — Print Action Added to Preview Screen
**Type**: Feature
**Before**: Preview screen had Download and Share actions only.
**After**: Preview screen has Download, Print, and Share.
**Reason**: Primary use case is a physical handout. Browser Print is faster and more direct than Download for a shop owner standing at a counter.

---

## 2026-06-12 — Onboarding Skip Option Added
**Type**: UX
**Before**: Onboarding had no skip option — users were forced through all steps.
**After**: Skip button available at every onboarding step.
**Reason**: Users may want to explore the app before committing to setup. Forcing setup on first launch adds friction.

---

## 2026-06-12 — Terms Sets Limit Increased from 3 to 5
**Type**: Feature
**Before**: Maximum 3 Terms Sets per provider.
**After**: Maximum 5 Terms Sets per provider.
**Reason**: The 3-set limit was arbitrary. Finance providers may have more varied schemes (online, offline, corporate, festive offer etc.) that each require different terms.

---

## 2026-06-12 — Total Amount Formula Defined
**Type**: Logic Specification
**Formula**: `Total = 1st EMI Amount + (Regular EMI Amount × (Number of EMIs − 1))`
**Example**: 1st EMI ₹2000, Regular EMI ₹2300, 12 EMIs → Total = ₹2000 + (₹2300 × 11) = ₹27,300
**Reason**: Explicit formula prevents ambiguity during PDF generation implementation.

---

## 2026-06-12 — SCHEMA.md Replaced with STORAGE.md
**Type**: Documentation
**Before**: SCHEMA.md from template covered SQL tables, API routes, auth model, RLS policies — none of which apply to this project.
**After**: STORAGE.md documents LocalStorage keys, JSON shapes, helper function signatures, and export/import format.
**Reason**: Project has no database, no backend, and no auth. All persistence is LocalStorage only.
