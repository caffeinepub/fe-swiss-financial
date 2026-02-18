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
    // Parse the HTML to inject title and auto-print script
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Inject or update the title tag in the head
    let titleElement = doc.querySelector('title');
    if (!titleElement) {
      titleElement = doc.createElement('title');
      const head = doc.querySelector('head');
      if (head) {
        head.appendChild(titleElement);
      } else {
        // Create head if it doesn't exist
        const newHead = doc.createElement('head');
        newHead.appendChild(titleElement);
        doc.documentElement.insertBefore(newHead, doc.body);
      }
    }
    titleElement.textContent = filename;
    
    // Add auto-print script at the end of body
    const script = doc.createElement('script');
    script.textContent = `
      window.addEventListener('load', function() {
        setTimeout(function() {
          window.print();
          // Attempt to close after printing
          window.addEventListener('afterprint', function() {
            window.close();
          });
        }, 250);
      });
    `;
    
    const body = doc.querySelector('body');
    if (body) {
      body.appendChild(script);
    }
    
    // Serialize the modified HTML
    const finalHtml = new XMLSerializer().serializeToString(doc);
    
    // Create Blob from HTML content
    const blob = new Blob([finalHtml], { type: 'text/html' });
    
    // Create Blob URL
    const blobUrl = URL.createObjectURL(blob);
    
    // Open in new tab
    const newWindow = window.open(blobUrl, '_blank');
    
    if (!newWindow) {
      // Popup was blocked
      alert('Failed to open print window. Please allow popups for this site and try again.');
      URL.revokeObjectURL(blobUrl);
      return;
    }
    
    // Revoke the Blob URL after the window has loaded to prevent memory leaks
    // Use a timeout as a fallback in case the load event doesn't fire
    const revokeTimeout = setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 5000);
    
    // Try to revoke earlier if we can detect the window loaded
    newWindow.addEventListener('load', () => {
      clearTimeout(revokeTimeout);
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 1000);
    });
    
  } catch (error) {
    console.error('PDF download error:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}
