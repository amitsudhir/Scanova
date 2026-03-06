import { GoogleGenAI } from '@google/genai';

// Add this to your `.env.local` file:
// GEMINI_API_KEY=your_real_api_key_here

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "stub_key" 
});

export async function generateCampaignStrategy(goal: string) {
  if (!process.env.GEMINI_API_KEY) {
     console.warn("No GEMINI_API_KEY found. Returning stubbed response.");
     return {
       strategy: `AI Strategy for: "${goal}"\n\n1. Use highly visible QR placements near high-dwell areas.\n2. Ensure the landing page clearly states the value prop.\n3. Change the smart-link dynamically based on weekend/weekday offers.`,
       cta: "Scan to Unlock Bonus"
     };
  }

  try {
    const prompt = `
      You are an expert marketing strategist for a SaaS product called Scanova.
      A user has provided the following goal for their dynamic QR code campaign: "${goal}".
      
      Generate a concise, highly actionable 3-step strategy and a recommended Call-to-Action (CTA) phrase to print next to the QR code.
      Return the result as a JSON object with two keys: "strategy" (a string with bullet points) and "cta" (a short 3-5 word string).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw new Error("Failed to generate campaign strategy.");
  }
}
