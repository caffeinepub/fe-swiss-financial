import type { ClientStatus, RiskLevel, Time } from '../backend';

export function formatDate(timestamp: bigint): string {
  const milliseconds = Number(timestamp / BigInt(1_000_000));
  const date = new Date(milliseconds);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateOrPlaceholder(timestamp: Time | undefined | null): string {
  if (!timestamp) {
    return 'No due date';
  }
  return formatDate(timestamp);
}

export function getStatusLabel(status: ClientStatus): string {
  const labels: Record<ClientStatus, string> = {
    prospect: 'Prospect',
    onboarding: 'Onboarding',
    active: 'Active',
    offboarded: 'Offboarded',
  };
  return labels[status] || status;
}

export function getRiskLabel(risk: RiskLevel): string {
  const labels: Record<RiskLevel, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };
  return labels[risk] || risk;
}

// Format client ID in HEL-YYYY-NNNN format
export function formatClientId(clientId: number): string {
  const year = new Date().getFullYear();
  const paddedId = String(clientId).padStart(4, '0');
  return `HEL-${year}-${paddedId}`;
}

// Format date as YYYY-MM-DD
export function formatDateYYYYMMDD(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

// Calculate days until a date
export function daysUntilDate(dateString: string): number {
  try {
    const targetDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch {
    return 0;
  }
}

// Format expiry status with countdown (for Overview tab - maintains backward compatibility)
export function formatExpiryStatus(expiryDate: string): {
  text: string;
  variant: 'default' | 'warning' | 'error';
} {
  const days = daysUntilDate(expiryDate);
  
  if (days < 0) {
    return {
      text: 'Expired',
      variant: 'error',
    };
  } else if (days < 60) {
    return {
      text: `Expires in ${days} days`,
      variant: 'warning',
    };
  } else {
    return {
      text: `Expires in ${days} days`,
      variant: 'default',
    };
  }
}

// Format expiry status with color coding for Identity & KYC tab
// Green: > 90 days, Orange: 30-90 days, Red: < 30 days or expired
export function formatExpiryStatusDetailed(expiryDate: string): {
  text: string;
  color: 'green' | 'orange' | 'red';
  days: number;
} {
  const days = daysUntilDate(expiryDate);
  
  if (days < 0) {
    return {
      text: 'Expired',
      color: 'red',
      days,
    };
  } else if (days < 30) {
    return {
      text: `Expires in ${days} days`,
      color: 'red',
      days,
    };
  } else if (days <= 90) {
    return {
      text: `Expires in ${days} days`,
      color: 'orange',
      days,
    };
  } else {
    return {
      text: `Expires in ${days} days`,
      color: 'green',
      days,
    };
  }
}
