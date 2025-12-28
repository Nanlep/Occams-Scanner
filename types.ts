
export interface Business {
  id: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  latitude: number;
  longitude: number;
  sourceUrl?: string;
}

export interface ScanQuery {
  category: string;
  location: string;
  radius?: number;
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
  };
}
