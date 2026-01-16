
export type Tier = 'SINGLE' | 'PRO' | 'ENTERPRISE';

export interface SocialFootprint {
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  latitude: number;
  longitude: number;
  leaderName: string;
  leaderRole: string;
  socialFootprint: SocialFootprint;
  channel: string;
  sourceUrl?: string;
}

export interface ScanQuery {
  category: string;
  location: string;
  booleanLogic?: string;
}

export interface SystemLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}
