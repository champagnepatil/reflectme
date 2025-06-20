import { v5 as uuidv5 } from 'uuid';

// Namespace UUID for client IDs (consistent across application)
const CLIENT_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Client ID normalization utilities for Zentia
// Maps demo client IDs to actual UUIDs from Supabase database

const DEMO_CLIENT_MAP: Record<string, string> = {
  // Legacy demo client mappings  
  'demo-client-1': 'f229bd3a-f1a5-4b05-9b25-f1330c03db09', // Sarah Mitchell
  'demo-client-2': '00000000-0000-4000-b000-000000000002', // John Thompson
  'demo-client-3': '00000000-0000-4000-b000-000000000003', // Emily Rodriguez
  'demo-client-4': '00000000-0000-4000-b000-000000000004', // Michael Chen
  
  // Support for dynamic demo-patient IDs (like demo-patient-1750275183243)
  'demo-patient': 'f229bd3a-f1a5-4b05-9b25-f1330c03db09', // Default to Sarah Mitchell
};

// Client display names that match database profiles
const CLIENT_DISPLAY_NAMES: Record<string, string> = {
  'f229bd3a-f1a5-4b05-9b25-f1330c03db09': 'Sarah Mitchell',
  '00000000-0000-4000-b000-000000000002': 'John Thompson', 
  '00000000-0000-4000-b000-000000000003': 'Emily Rodriguez',
  '00000000-0000-4000-b000-000000000004': 'Michael Chen',
  
  // Legacy support
  'demo-client-1': 'Sarah Mitchell',
  'demo-client-2': 'John Thompson',
  'demo-client-3': 'Emily Rodriguez', 
  'demo-client-4': 'Michael Chen',
};

/**
 * Generate a consistent UUID from a string client ID
 * This ensures that "demo-client-1" always generates the same UUID
 */
export function generateClientUUID(clientId: string): string {
  return uuidv5(clientId, CLIENT_NAMESPACE);
}

/**
 * Check if a client ID is a demo/test ID
 */
export function isDemoClient(clientId: string): boolean {
  return clientId.startsWith('demo-') || clientId.startsWith('test-');
}

/**
 * Normalizes client ID to proper UUID format for database operations
 */
export const normalizeClientId = (clientId: string): string => {
  // Handle dynamic demo-patient IDs (like demo-patient-1750275183243)
  if (clientId.startsWith('demo-patient')) {
    return DEMO_CLIENT_MAP['demo-patient'];
  }
  
  // Handle static demo client IDs
  if (DEMO_CLIENT_MAP[clientId]) {
    return DEMO_CLIENT_MAP[clientId];
  }
  
  // If it's already a valid UUID, return as-is
  if (isValidUUID(clientId)) {
    return clientId;
  }
  
  // For any other demo client, use the first demo client UUID
  console.warn(`Unknown client ID: ${clientId}, mapping to default demo client`);
  return DEMO_CLIENT_MAP['demo-client-1'];
};

/**
 * Gets display name for client ID
 */
export const getClientDisplayName = (clientId: string): string => {
  // Handle dynamic demo-patient IDs
  if (clientId.startsWith('demo-patient')) {
    return 'Sarah Mitchell'; // Default demo patient
  }
  
  // Check if we have a display name for this client
  if (CLIENT_DISPLAY_NAMES[clientId]) {
    return CLIENT_DISPLAY_NAMES[clientId];
  }
  
  // Fallback for unknown clients
  return 'Demo Client';
};

/**
 * Gets client email from UUID (for demo purposes)
 */
export const getClientEmail = (clientId: string): string => {
  const emailMap: Record<string, string> = {
    'f229bd3a-f1a5-4b05-9b25-f1330c03db09': 'patient@mindtwin.demo',
    '00000000-0000-4000-b000-000000000002': 'client2@mindtwin.demo',
    '00000000-0000-4000-b000-000000000003': 'client3@mindtwin.demo',
    '00000000-0000-4000-b000-000000000004': 'client4@mindtwin.demo',
  };
  
  return emailMap[clientId] || 'client@mindtwin.app';
};

/**
 * Checks if a string is a valid UUID
 */
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Generates a demo client ID that maps to existing profile
 */
export const generateDemoClientId = (): string => {
  // Always return the same demo client for consistency
  return 'demo-client-1';
};

/**
 * Get all available demo client UUIDs
 */
export const getAllDemoClientUUIDs = (): string[] => {
  // Get unique UUIDs only, excluding placeholder UUIDs
  const uniqueUUIDs = [...new Set(Object.values(DEMO_CLIENT_MAP))];
  return uniqueUUIDs.filter(uuid => 
    uuid !== '00000000-0000-4000-b000-000000000002' && // Exclude placeholder UUIDs
    uuid !== '00000000-0000-4000-b000-000000000003' &&
    uuid !== '00000000-0000-4000-b000-000000000004'
  );
}; 