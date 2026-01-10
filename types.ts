
export type Tier = 'SINGLE' | 'PRO' | 'ENTERPRISE';

export interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  socialId: string;
  channel: string;
  website: string;
  description: string;
  latitude: number;
  longitude: number;
  sourceUrl?: string;
  fidelityScore?: number;
}

export interface ScanQuery {
  category: string;
  location: string;
  booleanLogic?: string;
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
  web?: {
    uri: string;
    title: string;
  };
}
