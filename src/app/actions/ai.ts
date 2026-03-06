export async function generateCampaignStrategy(goal: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
     console.warn("No GROQ_API_KEY found. Returning stubbed response.");
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
      Return the result strictly as a JSON object with two keys: "strategy" (a string with bullet points) and "cta" (a short 3-5 word string). Do not write any markdown blocks around it.
    `;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw new Error("Failed to generate campaign strategy.");
  }
}
