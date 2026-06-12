# Easy EMI Manager — App Flow

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | EMI Form — main screen |
| `/preview` | Preview | PDF preview + Download / Print / Share |
| `/settings` | Settings | Shop info, PDF defaults, providers list, export/import |
| `/providers` | Providers | All providers list |
| `/providers/[id]` | Provider Detail | View and edit single provider + terms sets |
| `/onboarding` | Onboarding | First-time setup wizard (skippable) |

## Navigation
- Bottom navigation bar on main screens (Home, Settings)
- Back button on Preview and Provider Detail pages
- Onboarding shown automatically on first launch — can be skipped at any step

## First Launch Flow

```
App opens
  └─ preferences.onboardingComplete === false
       └─ Redirect to /onboarding
            ├─ Step 1: Enter Shop Info
            ├─ Step 2: Add First Finance Provider  (optional)
            └─ Step 3: Select Default PDF Template
            [Skip] available at every step
       └─ On complete or final skip → set onboardingComplete: true → /
  └─ preferences.onboardingComplete === true
       └─ /  (Home Screen)
```

## Key User Journeys

### Journey 1 — Generate EMI Slip (Primary Flow)
1. Open app → Home screen
2. Select finance provider from dropdown
3. Enter 1st EMI Amount
4. Regular EMI auto-fills from provider's stored default → shown inline with an Edit button
5. Tap Edit to override Regular EMI for this session if needed
6. Enter Number of EMIs (minimum 6)
7. Pick 1st EMI Date from date picker
8. Select Terms Set (dropdown filtered to selected provider)
9. Select PDF Template (defaults to Settings default)
10. Toggle "Add Total Amount" checkbox if needed
11. Tap **Preview PDF**
12. Preview screen shows full schedule
13. Tap **Print** / **Download** / **Share**

### Journey 2 — Add a New Provider
1. Settings → Providers → Add New Provider
2. Enter: Provider Name, Description (optional), Advance Days, Regular EMI Amount
3. Add up to 5 Terms Sets
4. Each Terms Set: Title (internal), Description, up to 5 Rules
5. Save → back to providers list

### Journey 3 — Export & Import Backup
1. Settings → Export Data → downloads `easy-emi-backup.json`
2. Settings → Import Data → file picker
3. Choose: **Replace All** or **Merge**
4. On Merge, for each conflicting provider:
   - Skip (keep existing)
   - Replace (overwrite with imported)
   - Rename (import with a new name)

## Empty States

| Screen | Empty State |
|--------|-------------|
| Home (no providers) | "No providers yet. Add one in Settings to get started." with shortcut button |
| Home (provider has no terms sets) | Terms dropdown shows "No terms sets — add in Settings" |
| Providers list | "No providers added yet." with Add New button |

## Error States

| Scenario | Handling |
|----------|----------|
| Number of EMIs < 6 | Inline validation: "Minimum 6 EMIs required" |
| Required field empty on Preview tap | Inline field-level validation messages |
| Import file is invalid JSON or wrong format | Toast error: "Invalid backup file. Please check and try again." |
| PDF generation fails | Toast error: "PDF generation failed. Please try again." with retry |
| Web Share API not supported | Fall back to Download only |
