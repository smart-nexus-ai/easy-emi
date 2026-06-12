# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-06-12

### Added
- Initial release of Easy EMI Manager.
- Offline-first Service Worker support.
- Custom finance provider management.
- Import/Export backups with merge conflict resolution.
- PDF generation engine with multiple receipt templates.

### Fixed
- Header navigation buttons visibility in dark mode:
  - Added strong glow shadow values for active states.
  - Added subtle tinted backgrounds to inactive button states.
  - Opaque-layered backgrounds using `dark:bg-slate-950` to prevent border gradient bleeding.
  - Fixed active/inactive button text color and weights.
- Settings view backup/restore button text visibility in dark mode.
- Bottom navigation bar inactive tab readability in dark mode.
