# Easy EMI Manager — Project Requirements

## Name & Tagline
**Easy EMI Manager** — Generate EMI schedule slips instantly for your shop.

## Problem
Local mobile and electronics shop owners in India use third-party finance providers (Bajaj Finserv, TVS Finance, HDB Finance etc.) to sell products on EMI. They need to hand the customer a physical payment schedule slip alongside the product invoice. Currently this is done manually or with old Android apps that lack flexibility. There is no simple, offline, browser-based tool that handles multiple finance providers with their own terms and conditions.

## Target User
Local mobile/electronics shop owners in India who process EMI sales through third-party finance providers. They work primarily on mobile devices, need fast PDF generation, and do not want logins, cloud sync, or complex setup. The generated PDF is a **payment schedule slip** — a physical handout given to the customer alongside the product invoice. It is not an invoice itself.

## Phase 1 Scope
- [ ] Onboarding flow (shop info + first provider setup, skippable)
- [ ] Provider management (add, edit, delete)
- [ ] Terms Sets per provider (up to 5 per provider)
- [ ] EMI Form (provider, 1st EMI amount, regular EMI inline edit, EMI count, date, terms, template)
- [ ] PDF Preview screen
- [ ] PDF Generation — 3 built-in templates (Classic, Modern, Compact)
- [ ] Download, Print, Share PDF
- [ ] Settings screen (shop info, PDF defaults)
- [ ] Data export and import (JSON backup)
- [ ] Dark / Light theme toggle
- [ ] PWA (installable, offline capable)

## Phase 2+ (Future)
- [ ] Shop logo in PDF
- [ ] QR Code in PDF
- [ ] Custom PDF colors per template
- [ ] Multi-language terms
- [ ] Additional PDF templates

## Out of Scope (v1)
- No customer records or database
- No user accounts or login
- No cloud sync
- No payment processing
- No inventory management
- No customer name or item details on PDF (separate invoice handles this)

## User Stories
- As a shop owner, I want to select a finance provider and enter the 1st EMI amount so that the regular EMI auto-fills and I can adjust it per product if needed.
- As a shop owner, I want to preview the EMI schedule before printing so that I can verify it is correct.
- As a shop owner, I want to print/download the PDF directly from my phone so that I can hand a physical copy to the customer immediately.
- As a shop owner, I want to store multiple finance providers with their own terms so that I don't have to re-enter them for every sale.
- As a shop owner, I want to export and import my data so that I can back it up or restore it on a new device.

## Success Metrics
- Full EMI slip generated and ready to print in under 60 seconds
- Works fully offline after first install
- Zero data loss on page refresh or app restart
