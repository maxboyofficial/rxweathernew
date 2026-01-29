
import { GoogleGenAI } from "@google/genai";
import { WeatherData, AQIData, GroundingLink } from "../types";

export interface WeatherInsightResult {
  text: string;
  links: GroundingLink[];
}

export const getWeatherInsight = async (
  weather: WeatherData, 
  aqi: AQIData, 
  uv: number,
  lat: number,
  lon: number
): Promise<WeatherInsightResult> => {
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

    return { text, links };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { 
      text: "Conditions are favorable for outdoor activity. Stay hydrated.",
      links: []
    };
  }
};
