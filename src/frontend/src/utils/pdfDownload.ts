export function sanitizeFilename(text: string): string {
  // Remove or replace characters that are invalid in filenames
  return text
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .trim();
}

export function formatDateForFilename(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function downloadPDF(htmlContent: string, filename: string): void {
  try {
    // Open a new blank popup window
    const popupWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!popupWindow) {
      console.error('Failed to open popup window. Please allow popups for this site.');
      alert('Failed to open print window. Please allow popups for this site and try again.');
      return;
    }

    // Write the HTML content into the popup window
    popupWindow.document.write(htmlContent);
    popupWindow.document.close();

    // Set the document title to control the suggested PDF filename
    popupWindow.document.title = filename;

    // Wait for content to load, then trigger print
    popupWindow.onload = () => {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        popupWindow.print();
      }, 250);
    };

    // Close popup after printing (with fallback timer)
    popupWindow.onafterprint = () => {
      popupWindow.close();
    };

    // Fallback: close after 60 seconds if user doesn't complete print dialog
    setTimeout(() => {
      if (popupWindow && !popupWindow.closed) {
        popupWindow.close();
      }
    }, 60000);

  } catch (error) {
    console.error('PDF download error:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}
