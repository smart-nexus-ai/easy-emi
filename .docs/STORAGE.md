# Easy EMI Manager — LocalStorage Structure

No database. No backend. All data lives in the browser's LocalStorage.

## Keys

| Key | Type | Description |
|-----|------|-------------|
| `emi_shop_info` | `ShopInfo` | Shop name, phone, address |
| `emi_providers` | `Provider[]` | All finance providers with their terms sets |
| `emi_pdf_settings` | `PdfSettings` | Default template, default add total |
| `emi_preferences` | `Preferences` | Theme preference, onboarding status |

---

## `emi_shop_info`

```json
{
  "name": "Sri Ram Mobile Store",
  "phone": "9876543210",
  "address": "Main Road, Cooch Behar, West Bengal"
}
```

---

## `emi_providers`

```json
[
  {
    "id": "uuid-v4",
    "name": "Bajaj Finserv",
    "description": "Optional notes about this provider",
    "advanceDays": 5,
    "regularEmiAmount": 2300,
    "termsSets": [
      {
        "id": "uuid-v4",
        "title": "Online Finance",
        "description": "Customer must complete online verification process.",
        "rules": [
          "Aadhaar Required",
          "PAN Required",
          "OTP Verification Required",
          "Bank Verification Required",
          "Signature Mandatory"
        ]
      }
    ]
  }
]
```

**Constraints:**
- Max **5** Terms Sets per provider
- Max **5** Rules per Terms Set
- `advanceDays` default value: `5`
- `regularEmiAmount` is the provider-level default; can be overridden per session on the Home Form

---

## `emi_pdf_settings`

```json
{
  "defaultTemplate": "classic",
  "defaultAddTotal": false
}
```

---

## `emi_preferences`

```json
{
  "theme": "system",
  "onboardingComplete": false
}
```

---

## Storage Helpers (`lib/storage.ts`)

All LocalStorage reads and writes go through these typed helpers only. Never access `localStorage` directly in components.

```ts
// Shop Info
getShopInfo(): ShopInfo | null
setShopInfo(data: ShopInfo): void

// Providers
getProviders(): Provider[]
setProviders(data: Provider[]): void
addProvider(provider: Provider): void
updateProvider(id: string, data: Partial<Provider>): void
deleteProvider(id: string): void

// PDF Settings
getPdfSettings(): PdfSettings
setPdfSettings(data: Partial<PdfSettings>): void

// Preferences
getPreferences(): Preferences
setPreferences(data: Partial<Preferences>): void
```

---

## Export / Import Format

Export file: `easy-emi-backup.json`

```json
{
  "version": "1.0",
  "exportedAt": "2026-06-12T10:30:00.000Z",
  "shopInfo": { ... },
  "providers": [ ... ],
  "pdfSettings": { ... },
  "preferences": { ... }
}
```

**Notes:**
- `version` field is reserved for future migration handling
- `preferences.onboardingComplete` is NOT overwritten on import — it stays `true` to avoid re-triggering onboarding
- On **Replace**: all existing keys are cleared, then new data is written
- On **Merge**: providers are compared by `name` (case-insensitive); conflict resolution per provider: Skip / Replace / Rename
