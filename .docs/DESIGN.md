# Easy EMI Manager — Design System

## Aesthetic
Mobile-first, clean, functional. This is a utility tool for shop owners who need speed — not a showcase product. Both dark and light mode must be equally polished. No heavy animations. Think simple banking apps and receipt generators.

## Color Palette

### Light Mode
| Role | Hex |
|------|-----|
| Background | `#F8F9FA` |
| Surface (Card) | `#FFFFFF` |
| Primary Text | `#111827` |
| Muted Text | `#6B7280` |
| Accent / CTA | `#2563EB` |
| Success | `#16A34A` |
| Error | `#DC2626` |
| Border | `#E5E7EB` |

### Dark Mode
| Role | Hex |
|------|-----|
| Background | `#0F172A` |
| Surface (Card) | `#1E293B` |
| Primary Text | `#F1F5F9` |
| Muted Text | `#94A3B8` |
| Accent / CTA | `#3B82F6` |
| Success | `#22C55E` |
| Error | `#EF4444` |
| Border | `#334155` |

## Typography
- **Font**: Inter (Google Fonts) — clean and readable on small screens
- **Headings**: 600 weight
- **Body**: 400 weight
- **Amounts / Numbers**: Tabular figures (`font-variant-numeric: tabular-nums`) — keeps columns aligned in the schedule table

## Component Style
- Border radius: `12px` cards, `8px` inputs and buttons, `9999px` badges/pills
- Shadows: Subtle `shadow-sm` in light mode, none in dark mode
- Cards: Flat bordered in dark mode, soft shadow in light mode
- Buttons: Solid blue primary, ghost secondary, destructive red for delete actions

## PDF-Specific Design
- PDF uses **black & white only** — no colors (print-friendly, ink-saving)
- Table borders: thin solid black lines
- Font in PDF: Helvetica (jsPDF built-in — no font embedding needed)
- Page size: A4
- Remark column: blank — intentionally left empty for pen use

## Animations
- No heavy animations — performance on low-end Android phones matters
- Subtle only: `transition-colors` on theme switch, `fade-in` on page navigation
- No scroll-based or parallax animations

## Dark / Light Mode
- Default: system preference
- Manual toggle in header visible on all screens
- Persisted in LocalStorage under `preferences.theme`

## Responsive Layout
- Mobile-first, optimized for 375px – 430px viewport width
- Max content width: `480px`, centered on tablet/desktop
- Bottom navigation bar replaces top navigation
- All form inputs full-width on mobile
- PDF Preview uses a scrollable container to simulate A4 proportions on phone screen
- No horizontal scroll anywhere

## Accessibility
- Minimum contrast ratio: 4.5:1 for body text
- Focus rings on all interactive elements
- All form inputs have visible labels — no placeholder-only labels
- Touch targets minimum 44×44px
