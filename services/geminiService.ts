
import { GoogleGenAI } from "@google/genai";
import { WeatherData, AQIData, GroundingLink } from "../types";

export interface WeatherInsightResult {
  text: string;
  links: GroundingLink[];
}

// Persistent cache to reduce API calls and stay within quota across refreshes
const CACHE_KEY_PREFIX = 'gemini_insight_cache_';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

const getCachedInsight = (key: string): WeatherInsightResult | null => {
  try {
    const saved = localStorage.getItem(CACHE_KEY_PREFIX + key);
    if (!saved) return null;
    const { result, timestamp } = JSON.parse(saved);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return result;
    }
    localStorage.removeItem(CACHE_KEY_PREFIX + key);
  } catch (e) {
    console.error("Cache read error:", e);
  }
  return null;
};

const setCachedInsight = (key: string, result: WeatherInsightResult) => {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify({
      result,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error("Cache write error:", e);
  }
};

export const getWeatherInsight = async (
  weather: WeatherData, 
  aqi: AQIData, 
  uv: number,
  lat: number,
  lon: number
): Promise<WeatherInsightResult> => {
  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = getCachedInsight(cacheKey);
  
  if (cached) {
    return cached;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analyze the current weather, air quality, and UV index for ${weather.name}, ${weather.sys.country} at coordinates ${lat}, ${lon}.
    
    Current Stats:
    - Condition: ${weather.weather[0].description}
    - Temp: ${Math.round(weather.main.temp)}°C
    - AQI: ${aqi.aqi}
    - UV Index: ${uv}
    
    As a local weather expert with real-time access to Google Maps, provide a HIGHLY CONCISE analysis.
    - Write exactly 2 to 3 sentences total.
    - Factor in the possibility of rain or precipitation in your advice.
    - Focus on how the atmosphere feels and one immediate local recommendation based on the geography.
    - Be punchy and professional.
    - Use clean Markdown with bolding for emphasis. 
    - DO NOT use bullet points or long paragraphs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lon
            }
          }
        }
      },
    });

    const text = response.text || "Atmospheric conditions are stable. Enjoy your day.";
    const links: GroundingLink[] = [];

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.maps) {
          links.push({
            title: chunk.maps.title || "Explore Nearby",
            uri: chunk.maps.uri
          });
        }
      });
    }

    const result = { text, links };
    setCachedInsight(cacheKey, result);
    return result;
  } catch (error: any) {
    console.error("Gemini Error (2.5-flash):", error);
    
    // Extract error details more robustly
    const errorStr = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
    const isQuotaError = 
      errorStr.includes('429') || 
      errorStr.includes('RESOURCE_EXHAUSTED') || 
      error?.status === 'RESOURCE_EXHAUSTED' || 
      error?.code === 429 ||
      (error?.error?.code === 429) ||
      (error?.error?.status === 'RESOURCE_EXHAUSTED');

    if (isQuotaError) {
      try {
        // Wait a small amount of time before fallback to let the rate limit breathe
        await new Promise(resolve => setTimeout(resolve, 1000));

        const aiFallback = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const fallbackResponse = await aiFallback.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt + "\n\n(Note: Provide a general analysis as local map data is currently unavailable.)",
        });
        
        const fallbackText = fallbackResponse.text || "Atmospheric conditions are stable.";
        const fallbackResult = { text: fallbackText, links: [] };
        setCachedInsight(cacheKey, fallbackResult);
        return fallbackResult;
      } catch (fallbackError: any) {
        console.error("Gemini Fallback Error (3-flash):", fallbackError);
        return { 
          text: "**AI insights are temporarily unavailable** due to high demand. Atmospheric conditions appear stable. Please try again in a few minutes.",
          links: []
        };
      }
    }

    return { 
      text: "Conditions are favorable for outdoor activity. Stay hydrated.",
      links: []
    };
  }
};
