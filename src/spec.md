# Specification

## Summary
**Goal:** Revert to Version 29 functionality and add dynamic role display in the sidebar based on admin entry status.

**Planned changes:**
- Restore all Version 29 working features (admin bootstrap, sidebar user info, admin table showing first caller as 'Admin' role with 'System Administrator' name, Add Staff form visibility)
- Update sidebar user info in AppLayout.tsx to dynamically display role by calling useGetMyAdminEntry() with enabled: !!identity
- Display role from adminEntry when it exists (e.g., 'Admin' or 'Staff'), otherwise fall back to 'User'
- Update footer version number from 'v29' to 'v31'

**User-visible outcome:** Admin users will see their actual role ('Admin' or 'Staff') displayed in the sidebar, while non-admin users will see 'User'. All Version 29 features remain functional, including admin bootstrap, client management, activity logs, KYC screening, and reports.
