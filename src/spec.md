# Specification

## Summary
**Goal:** Replace the current PDF export implementation with a simple popup-window print flow (no jsPDF/html2canvas) and ensure Export PDF uses a properly constructed filename.

**Planned changes:**
- Update `frontend/src/utils/pdfDownload.ts` so `downloadPDF(htmlContent, filename)` opens a blank popup window, writes `htmlContent` via `document.write`, sets `document.title` to `filename`, triggers `print()`, and closes the popup after printing (with an `afterprint`-based close and a safe fallback).
- Remove any jsPDF/html2canvas usage, dynamic CDN loading, and Blob/objectURL download logic from `downloadPDF()`.
- Update `frontend/src/pages/ClientDetailPage.tsx` so Export PDF builds a filename from `client.firstName`, `client.lastName`, `client.accountId`, and today’s date, then calls `downloadPDF(pdfHtml, filename)` while keeping `generateClientPDF(client, mockDetailData)` unchanged.

**User-visible outcome:** When a user exports a client PDF, a print dialog opens from a popup containing the generated HTML, titled with a filename based on the client and today’s date; if popups are blocked, the export fails gracefully with a clear English message.
