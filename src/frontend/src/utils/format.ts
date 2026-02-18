import type { ClientStatus, RiskLevel, Time } from '../backend';

export function formatDate(timestamp: Time | bigint | number | undefined): string {
  if (!timestamp) return 'N/A';
  
  try {
    const ms = typeof timestamp === 'bigint' 
      ? Number(timestamp / BigInt(1000000))
      : typeof timestamp === 'number'
      ? timestamp
      : 0;
    
    const date = new Date(ms);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

export function formatDateOrPlaceholder(timestamp: Time | bigint | number | undefined): string {
  if (!timestamp) return 'No date set';
  return formatDate(timestamp);
}

export function formatActivityLogTimestamp(timestamp: string): string {
  try {
    // Parse bigint timestamp (nanoseconds)
    const ns = BigInt(timestamp);
    const ms = Number(ns / BigInt(1000000));
    const date = new Date(ms);
    
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (error) {
    return timestamp;
  }
}

export function formatClientId(id: bigint | number): string {
  return `#${id.toString().padStart(6, '0')}`;
}

export function getStatusLabel(status: ClientStatus | string): string {
  const statusMap: Record<string, string> = {
    prospect: 'Prospect',
    onboarding: 'Onboarding',
    active: 'Active',
    offboarded: 'Offboarded',
  };
  return statusMap[status] || status;
}

export function getRiskLabel(riskLevel: RiskLevel | string): string {
  const riskMap: Record<string, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };
  return riskMap[riskLevel] || riskLevel;
}

// Backward compatible version for Overview tab
export function formatExpiryStatus(expiryDate: string): { text: string; color: string } {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return { text: 'Expired', color: 'text-red-600' };
  } else if (daysUntilExpiry <= 30) {
    return { text: `Expires in ${daysUntilExpiry} days`, color: 'text-red-600' };
  } else if (daysUntilExpiry <= 90) {
    return { text: `Expires in ${daysUntilExpiry} days`, color: 'text-orange-600' };
  } else {
    return { text: `Valid (${daysUntilExpiry} days)`, color: 'text-green-600' };
  }
}

// Detailed version for Identity & KYC tab with color thresholds
export function formatExpiryStatusDetailed(expiryDate: string): { 
  text: string; 
  color: string;
  bgColor: string;
  borderColor: string;
} {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return { 
      text: `Expired ${Math.abs(daysUntilExpiry)} days ago`, 
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    };
  } else if (daysUntilExpiry <= 30) {
    return { 
      text: `Expires in ${daysUntilExpiry} days`, 
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    };
  } else if (daysUntilExpiry <= 90) {
    return { 
      text: `Expires in ${daysUntilExpiry} days`, 
      color: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    };
  } else {
    return { 
      text: `Valid for ${daysUntilExpiry} days`, 
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    };
  }
}
