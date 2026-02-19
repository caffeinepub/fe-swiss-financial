# Specification

## Summary
**Goal:** Replace the callable bootstrap admin function with automatic hardcoded admin initialization that runs on canister startup.

**Planned changes:**
- Remove the bootstrapAdmin callable function from backend
- Add hardcoded initialization code in backend that automatically creates admin principal 'grzx7-efvee-eiav7-cphgh-j7zbs-jju44-7e5zt-embnv-eki5c-gmoof-uqe' with name 'System Administrator' and role 'Admin' on canister startup
- Remove useBootstrapAdmin hook from frontend
- Remove bootstrap logic from AppLayout.tsx while keeping all UI unchanged
- Update version number from v41 to v42 in footer

**User-visible outcome:** The system administrator is automatically initialized when the canister deploys, eliminating the need for manual bootstrap. The UI remains identical to v41 except for the version number update to v42.
