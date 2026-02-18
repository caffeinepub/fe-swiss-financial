# Specification

## Summary
**Goal:** Fix the Clients page layout so content is not hidden by the left sidebar, add an “Add Client” call-to-action, and ensure the Clients table is populated with realistic mock rows when no backend data is returned.

**Planned changes:**
- Apply a shared layout/container adjustment so main page content consistently starts after the ~220px left sidebar (e.g., left padding/margin at the app layout level), preventing overlap on the Clients page and avoiding regressions on other pages.
- Update the Clients page header to place an “Add Client” button on the same row as the “Clients” title, aligned to the top-right, navigating to `/add-client`.
- Seed the Clients table with exactly 5 Swiss-oriented mock client rows (Hans Mueller, Sophie Dubois, Marco Rossi, Elena Fischer, Philippe Bonvin) only when the backend returns an empty (non-loading) client list; include non-empty values for Status, Risk Level, Nationality, Relationship Manager, and Onboarding Date.

**User-visible outcome:** On `/clients`, the title and search bar are fully visible (not cut off by the sidebar), an “Add Client” button is available in the header to open the Add New Client form, and the table shows 5 realistic mock clients when no real client data exists.
