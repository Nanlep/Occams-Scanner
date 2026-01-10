
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
    console.warn("Geolocation context contextually bypassed for global search.");
  }

  const systemInstruction = `You are the Occam Matrix Global Extraction Engine (v3.5).
Your objective is high-fidelity lead generation with a focus on Shopify merchants and global B2B entities.

OPERATIONAL PROTOCOLS:
- BOOLEAN RESOLUTION: Solve complex logic (e.g. "Shopify" AND "Fashion" NOT "Amazon").
- PLATFORM IDENTIFICATION: If the user mentions Shopify, cross-reference myshopify.com signatures or Shopify-specific store markers.
- GLOBAL REACH: Seamlessly extract data from EU, US, UK, Asia, and MEA regions.
- DEEP EXTRACTION: Use Google Search to find corporate emails (info@, sales@), phone numbers (international format), LinkedIn IDs, and primary marketing channels (IG, FB, LinkedIn).

OUTPUT FORMAT:
Generate 10-15 leads. Wrap each lead in [[LEAD_START]] and [[LEAD_END]].
KEYS: NAME, ADDRESS, PHONE, EMAIL, SOCIAL, CHANNEL, WEB, DESC, LAT, LNG.

INTELLIGENCE GUIDELINE:
- Provide high-fidelity email addresses only (verified public records).
- Identify the most active 'CHANNEL' for outreach (where the brand is most engaged).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `SECTOR/PLATFORM: ${query.category} 
TERRITORY: ${query.location}
BOOLEAN CONSTRAINTS: ${query.booleanLogic || 'None'}
SPECIAL REQUEST: Prioritize Shopify merchants if "Shopify" is detected in query. Ensure international phone formats.`,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }, { googleSearch: {} }],
        ...(toolConfig ? { toolConfig } : {}),
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    return parseGeminiResponse(text);
  } catch (error) {
    console.error("Global Extraction Failure:", error);
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
