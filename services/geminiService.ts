
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
    console.warn("Geolocation context unavailable.");
  }

  const systemInstruction = `You are the Occam Matrix Boolean Extraction Engine (v3.0).
Your task is to execute a High-Fidelity Deep Scan based on Boolean logic and territorial parameters.

OPERATIONAL PARAMETERS:
- INTERPRET BOOLEAN LOGIC: Handle AND, OR, NOT, and quotes (e.g. "Real Estate").
- SOURCE MULTI-CHANNEL DATA: Use Google Maps for spatial anchoring and Google Search for deep-web signals (Emails, Social IDs).
- OUTPUT 10-15 VERIFIED LEADS.

DATA SCHEMA PER LEAD:
NAME: [Official Business Name]
ADDRESS: [Full Physical Address]
PHONE: [Contact Number]
EMAIL: [Verified Corporate/Public Email or 'N/A']
SOCIAL: [Primary Social ID/Handle (LinkedIn preferred)]
CHANNEL: [Primary platform for outreach e.g. LinkedIn, Instagram, X]
WEB: [Official URL]
DESC: [2-sentence market intelligence summary]
LAT/LNG: [Coordinates]

STRICT FORMATTING:
Wrap each lead in [[LEAD_START]] and [[LEAD_END]] tags.
Use the keys: NAME, ADDRESS, PHONE, EMAIL, SOCIAL, CHANNEL, WEB, DESC, LAT, LNG.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `TARGET: ${query.category} 
LOCATION: ${query.location}
BOOLEAN CONSTRAINTS: ${query.booleanLogic || 'None'}`,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        ...(toolConfig ? { toolConfig } : {}),
        temperature: 0.2,
      },
    });

    const text = response.text || "";
    return parseGeminiResponse(text);
  } catch (error) {
    console.error("Matrix Extraction Failure:", error);
    throw error;
  }
}

function parseGeminiResponse(text: string): Business[] {
  const businesses: Business[] = [];
  const rawBlocks = text.split(/\[\[LEAD_START\]\]/i);
  
  for (const block of rawBlocks) {
    if (!block.includes('[[LEAD_END]]')) continue;
    
    const content = block.split(/\[\[LEAD_END\]\]/i)[0].trim();
    const lines = content.split('\n');
    
    const getVal = (key: string) => {
      const line = lines.find(l => l.toUpperCase().startsWith(key + ':'));
      return line ? line.split(':').slice(1).join(':').trim() : 'N/A';
    };

    const name = getVal('NAME');
    if (name === 'N/A' || name.length < 2) continue;

    businesses.push({
      id: Math.random().toString(36).substring(2, 11).toUpperCase(),
      name: name,
      address: getVal('ADDRESS'),
      phone: getVal('PHONE'),
      email: getVal('EMAIL'),
      socialId: getVal('SOCIAL'),
      channel: getVal('CHANNEL'),
      website: getVal('WEB'),
      description: getVal('DESC'),
      latitude: parseFloat(getVal('LAT')) || 0,
      longitude: parseFloat(getVal('LNG')) || 0
    });
  }

  return businesses;
}
