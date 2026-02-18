import type { ClientProfile } from '../backend';
import type { MockClientDetail } from '../mocks/clientDetailMock';

interface PDFSection {
  title: string;
  fields: Array<{ label: string; value: string }>;
}

export function generateClientPDF(
  client: ClientProfile,
  mockData: MockClientDetail
): string {
  // Extract passport data
  const passportDoc = mockData.identityDocuments.find(doc => doc.type === 'Passport');
  
  // Build sections matching the Overview tab
  const sections: PDFSection[] = [
    {
      title: 'Contact Details',
      fields: [
        { label: 'Account ID', value: client.accountId || client.id.toString() },
        { label: 'First Name', value: client.firstName || '' },
        { label: 'Last Name', value: client.lastName || '' },
        { label: 'Address', value: client.address || mockData.contactDetails.primaryAddress },
        { label: 'Primary Country', value: client.primaryCountry || 'Switzerland' },
        { label: 'Email', value: client.email || mockData.contactDetails.email },
        { label: 'Phone', value: client.phone || mockData.contactDetails.phone },
        { label: 'Telegram', value: '@client_telegram' },
        { label: 'LinkedIn', value: 'linkedin.com/in/client' },
        { label: 'Date Created', value: '2024-01-15' },
      ],
    },
    {
      title: 'Personal Data',
      fields: [
        { label: 'Date of Birth', value: client.dateOfBirth || mockData.personalInfo.dateOfBirth },
        { label: 'Passport Number', value: client.passportNumber || passportDoc?.number || 'N/A' },
        { label: 'Passport Expiry', value: client.passportExpiryDate || passportDoc?.expiryDate || 'N/A' },
        { label: 'Nationality', value: client.nationality || mockData.personalInfo.nationality },
        { label: 'TIN', value: client.tin || mockData.taxInformation.taxIdNumbers[0] || 'N/A' },
        { label: 'Place of Birth', value: client.placeOfBirth || 'Zürich, Switzerland' },
        { label: 'Issuing Authority', value: passportDoc?.issuingCountry || 'N/A' },
        { label: 'Date of Issue', value: passportDoc?.issueDate || 'N/A' },
        { label: 'Date of Expiry', value: passportDoc?.expiryDate || 'N/A' },
      ],
    },
    {
      title: 'Mandate',
      fields: [
        { label: 'Brokerage Fee (%)', value: '1.5' },
        { label: 'Active From', value: '2024-01-15' },
        { label: 'Exit From', value: 'N/A' },
        { label: 'Telegram Channel', value: '@trading_updates' },
        { label: 'Trade Limit (CHF)', value: '500,000' },
        { label: 'Traded Amount (CHF)', value: '2,350,000' },
      ],
    },
    {
      title: 'Wallets',
      fields: [
        { label: 'Bitcoin Wallet', value: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
        { label: 'Ethereum Wallet', value: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' },
        { label: 'TRON Wallet', value: 'TN3W4H6rK2ce4vX9YnFxx6HhdqKUqvETcd' },
      ],
    },
    {
      title: 'Compliance',
      fields: [
        { label: 'Video ID Completed', value: 'Yes' },
        { label: 'CV Completed', value: 'Yes' },
        { label: 'Utility Bill Completed', value: 'Yes' },
        { label: 'SOF/SOW Completed', value: 'Yes' },
        { label: 'KYC Completed', value: '2024-01-20' },
        { label: 'EDD Completed', value: '2024-02-05' },
        { label: 'MME Confirmation', value: 'Yes' },
      ],
    },
    {
      title: 'VQF',
      fields: [
        { label: 'Risk Profile AML', value: 'Low Risk' },
        { label: 'Identification', value: 'Verified' },
        { label: 'Customer Profile', value: 'Standard' },
        { label: 'Form A or K', value: 'Form A' },
        { label: 'FATF Travel Rule', value: 'Compliant' },
        { label: 'Category Risk', value: 'Category 1' },
        { label: 'Income/Annual Sales (CHF)', value: '850,000' },
        { label: 'Fortune/Assets (CHF)', value: '7,500,000' },
        { label: 'Liabilities (CHF)', value: '450,000' },
        { label: 'High Risk Confirmed', value: 'No' },
        { label: 'AML Note Documentation', value: 'Complete' },
        { label: 'Produce High Risk', value: 'No' },
        { label: 'VideoID+Utility', value: 'Yes' },
      ],
    },
  ];

  // Build HTML for print
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const clientName = `${client.firstName} ${client.lastName}`;
  const accountId = client.accountId || client.id.toString();

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${clientName} - ${accountId}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 10pt;
          line-height: 1.4;
          color: #000;
          margin: 0;
          padding: 0;
        }
        
        .header {
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #000;
        }
        
        .logo {
          font-size: 20pt;
          font-weight: 300;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }
        
        .header-info {
          font-size: 11pt;
          color: #333;
        }
        
        .header-info strong {
          font-weight: 600;
        }
        
        .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 12pt;
          font-weight: 600;
          margin-bottom: 8px;
          padding-bottom: 4px;
          border-bottom: 1px solid #ccc;
        }
        
        .field-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .field-table tr {
          border-bottom: 1px solid #eee;
        }
        
        .field-table td {
          padding: 6px 8px;
          vertical-align: top;
        }
        
        .field-table td:first-child {
          width: 40%;
          color: #666;
          font-size: 9pt;
        }
        
        .field-table td:last-child {
          width: 60%;
          font-weight: 500;
          text-align: right;
          word-break: break-word;
        }
        
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">HELVETICA</div>
        <div class="header-info">
          <strong>${clientName}</strong> • Account ID: ${accountId} • ${currentDate}
        </div>
      </div>
  `;

  // Add sections
  sections.forEach((section) => {
    html += `
      <div class="section">
        <div class="section-title">${section.title}</div>
        <table class="field-table">
    `;

    section.fields.forEach((field) => {
      html += `
          <tr>
            <td>${field.label}</td>
            <td>${field.value}</td>
          </tr>
      `;
    });

    html += `
        </table>
      </div>
    `;
  });

  html += `
    </body>
    </html>
  `;

  return html;
}
