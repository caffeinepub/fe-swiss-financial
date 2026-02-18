# Specification

## Summary
**Goal:** Roll back the Swiss Financial CRM (frontend + backend) to match Version 23 behavior, removing/regressing changes introduced in Versions 24–26, and restore the Version 23 login-to-authorized-layout flow.

**Planned changes:**
- Revert frontend and backend implementation to Version 23 behavior, ensuring no Version 24–26 functionality remains.
- Restore Version 23 authentication/authorization + layout transition so that after Internet Identity login completes, the app reliably enters the authorized layout without hanging on “Verifying authorization...”.
- Ensure the authorization loading screen text is in English and only appears while actor/authorization status is actively being fetched.

**User-visible outcome:** After login, users consistently transition from the login screen into the authorized app layout (sidebar + routed pages) without indefinite “Verifying authorization...” loading, and the overall app behaves as it did in Version 23.
