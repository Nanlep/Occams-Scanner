
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

  // Refined prompt for B2B Lead Gen excellence
  const prompt = `ENTERPRISE LEAD EXTRACTION: 
Target Sector: ${query.category}
Target Territory: ${query.location}

OBJECTIVE: Extract high-quality B2B leads. For each entity, provide verified details including:
1. Official Name
2. Exact Physical Address
3. Primary Business Phone
4. Website URL (or 'N/A')
5. Strategic Description (Industry niche, services provided)
6. Geographic Coordinates (Lat/Lng)

STRICT FORMATTING: Wrap each lead in [[START]] and [[END]] tags.
Inside tags, use EXACT labels:
NAME: [Value]
ADDRESS: [Value]
PHONE: [Value]
WEB: [Value]
DESC: [Value]
LAT: [Value]
LNG: [Value]

Use Google Maps grounding to ensure the highest data fidelity.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        ...(toolConfig ? { toolConfig } : {}),
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    const businesses = parseGeminiResponse(text);
    
    // Enrich with grounding metadata
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
    console.error("Critical Extraction Failure:", error);
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
    if (name === 'N/A') continue;

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
