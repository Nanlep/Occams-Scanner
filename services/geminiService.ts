
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
    console.warn("Geolocation context unavailable. Proceeding with global search.");
  }

  const systemInstruction = `You are the Occam Matrix Extraction Engine, a professional B2B lead generation tool. 
Your task is to find high-value businesses registered on Google Maps based on a specific Sector and Territory.

OUTPUT REQUIREMENTS:
- Provide 10-15 high-fidelity leads.
- Each lead MUST include: Name, Address, Phone, Website, and a Strategic Analysis (Description).
- Use Google Maps to verify coordinates (LAT/LNG) and source links.

STRICT FORMATTING:
Wrap each lead in [[START]] and [[END]] tags.
NAME: [Value]
ADDRESS: [Value]
PHONE: [Value]
WEB: [Value]
DESC: [Strategic 2-sentence market analysis]
LAT: [Value]
LNG: [Value]`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract leads for Sector: ${query.category} in Territory: ${query.location}`,
      config: {
        systemInstruction,
        tools: [{ googleMaps: {} }],
        ...(toolConfig ? { toolConfig } : {}),
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    const businesses = parseGeminiResponse(text);
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return businesses.map(biz => {
      const match = chunks.find(chunk => 
        chunk.maps?.title && 
        (biz.name.toLowerCase().includes(chunk.maps.title.toLowerCase()) || 
         chunk.maps.title.toLowerCase().includes(biz.name.toLowerCase()))
      );
      return {
        ...biz,
        sourceUrl: match?.maps?.uri || biz.sourceUrl
      };
    });
  } catch (error) {
    console.error("Extraction Failure:", error);
    throw error;
  }
}

function parseGeminiResponse(text: string): Business[] {
  const businesses: Business[] = [];
  const rawBlocks = text.split(/\[\[START\]\]/i);
  
  for (const block of rawBlocks) {
    if (!block.includes('[[END]]')) continue;
    
    const content = block.split(/\[\[END\]\]/i)[0].trim();
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
      website: getVal('WEB'),
      description: getVal('DESC'),
      latitude: parseFloat(getVal('LAT')) || 0,
      longitude: parseFloat(getVal('LNG')) || 0
    });
  }

  return businesses;
}
