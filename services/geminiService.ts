
import { GoogleGenAI } from "@google/genai";
import { Business, ScanQuery } from "../types";

export async function scanBusinesses(query: ScanQuery): Promise<Business[]> {
  // Initialize with the provided API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let toolConfig = undefined;
  try {
    // Attempt to get user location with a 5s timeout to avoid blocking the scan
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { 
        timeout: 5000,
        enableHighAccuracy: false
      });
    });
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      }
    };
  } catch (err) {
    console.warn("Geolocation context unavailable. Proceeding with global search.");
  }

  const prompt = `CRITICAL TASK: Extract data for businesses in category "${query.category}" within the location "${query.location}".
Return a structured list of businesses. For EACH business, provide:
1. Name
2. Full Address
3. Phone Number
4. Website (Must be a valid URL or 'N/A')
5. Brief professional description
6. Latitude
7. Longitude

Format the response using these markers for each business:
[[START]]
NAME: [name]
ADDRESS: [address]
PHONE: [phone]
WEB: [website]
DESC: [description]
LAT: [latitude]
LNG: [longitude]
[[END]]

Include as many verified results as found (aim for 5-15). Use Google Maps grounding to ensure coordinates and details are accurate.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        ...(toolConfig ? { toolConfig } : {}),
        temperature: 0.1, // Low temperature for higher consistency in extraction
      },
    });

    const text = response.text;
    if (!text) {
      console.warn("Model returned empty text. Checking for grounding metadata...");
      return [];
    }

    const businesses = parseGeminiResponse(text);
    
    // Supplement with grounding URLs from metadata
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    businesses.forEach((biz) => {
      const match = chunks.find(chunk => 
        chunk.maps?.title && 
        (biz.name.toLowerCase().includes(chunk.maps.title.toLowerCase()) || 
         chunk.maps.title.toLowerCase().includes(biz.name.toLowerCase()))
      );
      if (match?.maps?.uri) {
        biz.sourceUrl = match.maps.uri;
      }
    });

    return businesses;
  } catch (error) {
    console.error("Extraction sequence failed:", error);
    throw error;
  }
}

function parseGeminiResponse(text: string): Business[] {
  const businesses: Business[] = [];
  // Split by START marker, ignoring anything before the first business
  const segments = text.split('[[START]]').slice(1);
  
  segments.forEach(segment => {
    const block = segment.split('[[END]]')[0];
    const lines = block.trim().split('\n');
    
    const extract = (label: string) => {
      const line = lines.find(l => l.toUpperCase().includes(label));
      if (!line) return 'N/A';
      const value = line.split(':').slice(1).join(':').trim();
      return value || 'N/A';
    };

    const name = extract('NAME');
    if (name === 'N/A') return;

    businesses.push({
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      address: extract('ADDRESS'),
      phone: extract('PHONE'),
      website: extract('WEB'),
      description: extract('DESC'),
      latitude: parseFloat(extract('LAT')) || 0,
      longitude: parseFloat(extract('LNG')) || 0
    });
  });

  return businesses;
}
