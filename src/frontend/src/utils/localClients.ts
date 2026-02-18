import type { ClientProfile } from '../backend';

const LOCAL_CLIENTS_KEY = 'local_clients';
const NEXT_LOCAL_ID_KEY = 'next_local_client_id';

// Start local client IDs at 5000000 to avoid collisions with backend and mock clients
const LOCAL_ID_START = 5000000;

export function generateAccountId(): string {
  const year = new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `FES-${year}-${sequence}`;
}

export function getNextLocalClientId(): bigint {
  const stored = localStorage.getItem(NEXT_LOCAL_ID_KEY);
  const nextId = stored ? parseInt(stored, 10) : LOCAL_ID_START;
  localStorage.setItem(NEXT_LOCAL_ID_KEY, (nextId + 1).toString());
  return BigInt(nextId);
}

export function saveLocalClient(client: ClientProfile): void {
  try {
    const clients = getLocalClients();
    const existingIndex = clients.findIndex(c => c.id === client.id);
    
    if (existingIndex >= 0) {
      clients[existingIndex] = client;
    } else {
      clients.push(client);
    }
    
    localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
  } catch (error) {
    console.error('Failed to save local client:', error);
  }
}

export function getLocalClients(): ClientProfile[] {
  try {
    const stored = localStorage.getItem(LOCAL_CLIENTS_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    return parsed.map((client: any) => ({
      ...client,
      id: BigInt(client.id),
      onboardingDate: client.onboardingDate ? BigInt(client.onboardingDate) : undefined,
      kycReviewDue: client.kycReviewDue ? BigInt(client.kycReviewDue) : undefined,
      createdDate: BigInt(client.createdDate),
    }));
  } catch (error) {
    console.error('Failed to load local clients:', error);
    return [];
  }
}

export function getLocalClient(id: bigint): ClientProfile | undefined {
  const clients = getLocalClients();
  return clients.find(c => c.id === id);
}

export function updateLocalClient(id: bigint, updates: Partial<ClientProfile>): void {
  try {
    const clients = getLocalClients();
    const index = clients.findIndex(c => c.id === id);
    
    if (index >= 0) {
      clients[index] = { ...clients[index], ...updates };
      localStorage.setItem(LOCAL_CLIENTS_KEY, JSON.stringify(clients, (_, value) =>
        typeof value === 'bigint' ? value.toString() : value
      ));
    }
  } catch (error) {
    console.error('Failed to update local client:', error);
  }
}
