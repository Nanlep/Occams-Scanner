
import { GoogleGenAI } from "@google/genai";
import { Business, ScanQuery } from "../types";

export async function scanBusinesses(query: ScanQuery): Promise<Business[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let toolConfig = undefined;
  try {
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
    console.warn("Geolocation context bypassed.");
  }

  const systemInstruction = `You are the Occam Matrix Intelligence Engine. 
Extract high-fidelity business data and identify Market Leaders (Founders, CEOs, Directors) using Google Maps and web grounding.

CRITICAL RULES:
- BOOLEAN RESOLUTION: Apply the Boolean script precisely (e.g., "${query.booleanLogic}").
- SOCIAL MINING: Find specific profiles on LinkedIn, Twitter, and Facebook.
- CONTACT FIDELITY: Prioritize corporate emails.

OUTPUT:
Generate 10-15 leads. Wrap each lead in [[LEAD_START]] and [[LEAD_END]].
FIELDS: 
NAME, ADDR, PHONE, EMAIL, WEB, LEADER (Name), ROLE (Title), LI (LinkedIn), TW (Twitter), FB (Facebook), DESC (Analysis), LAT, LNG, CHAN (Marketing Channel).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: `CATEGORY: ${query.category} 
LOCATION: ${query.location}
BOOLEAN SCRIPT: ${query.booleanLogic || 'Standard Extraction'}`,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        ...(toolConfig ? { toolConfig } : {}),
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    // Check for grounding metadata to calculate "Global Trust Index" later
    const sourceCount = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.length || 0;
    
    return parseGeminiResponse(text, sourceCount);
  } catch (error) {
    console.error("Extraction Failure:", error);
    throw error;
  }
}

function parseGeminiResponse(text: string, sourceCount: number): Business[] {
  const businesses: Business[] = [];
  const rawBlocks = text.split(/\[\[LEAD_START\]\]/i);
  
  for (const block of rawBlocks) {
    if (!block.includes('[[LEAD_END]]')) continue;
    
    const content = block.split(/\[\[LEAD_END\]\]/i)[0].trim();
    const lines = content.split('\n');
    
    const getVal = (key: string) => {
      const line = lines.find(l => l.toUpperCase().startsWith(key + ':'));
      if (!line) return 'N/A';
      const val = line.split(':').slice(1).join(':').trim();
      return val === '' ? 'N/A' : val;
    };

    const name = getVal('NAME');
    if (name === 'N/A' || name.length < 2) continue;

    // Use sourceCount to slightly adjust confidence levels in the future
    businesses.push({
      id: `NODE-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      name: name,
      address: getVal('ADDR'),
      phone: getVal('PHONE'),
      email: getVal('EMAIL'),
      website: getVal('WEB'),
      leaderName: getVal('LEADER'),
      leaderRole: getVal('ROLE'),
      socialFootprint: {
        linkedin: getVal('LI'),
        twitter: getVal('TW'),
        facebook: getVal('FB')
      },
      description: getVal('DESC'),
      channel: getVal('CHAN'),
      latitude: parseFloat(getVal('LAT')) || 0,
      longitude: parseFloat(getVal('LNG')) || 0
    });
  }

  return businesses;
}
