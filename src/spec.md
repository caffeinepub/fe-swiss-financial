# Specification

## Summary
**Goal:** Ensure the Settings > Admin Management page correctly detects the Operator by Principal ID so the Add Staff form and Remove controls render only for the Operator.

**Planned changes:**
- Update `frontend/src/components/settings/AdminManagementSection.tsx` to compute `isOperator` by comparing the logged-in user’s Principal ID to the Principal ID of the `Operator` row returned by `useGetAdminEntries()` (with `useGetMyAdminEntry()` only as an optional fallback if needed).
- Render the Add Staff form directly below the admin entries table (Principal ID input, Display Name input, “Add Staff” button) with English labels and validation, and wire submission to the existing add-admin mutation with role `Staff`.
- After successful Add Staff, refresh the admin entries table so the new Staff entry appears without manual reload.
- Enforce Remove button rules: only show Remove controls for non-Operator rows when the logged-in user is the Operator; never show a Remove button on the Operator row; hide Remove column/buttons entirely when the user is not the Operator.

**User-visible outcome:** Operators can see and use an Add Staff form under the admin table to add Staff by Principal ID and Display Name, see the table update immediately after adding, and manage Staff removals; non-Operators see an Operator-only message and no Remove controls.
