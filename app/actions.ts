'use server';

import { GoogleGenAI } from '@google/genai';

export async function classifyNutAction(base64Image: string) {
  try {
    let apiKey = process.env.GEMINI_API_KEY;

    // Fallback: Read directly from .env.local or .env files in case they were not loaded by Next.js (e.g. standalone server)
    const isPlaceholder = apiKey && (apiKey.includes('YOUR_GEMINI_API_KEY') || apiKey.includes('YOUR_API_KEY') || apiKey.trim() === '');
    if (!apiKey || isPlaceholder) {
      try {
        const fs = require('fs');
        const path = require('path');
        const possiblePaths = [
          path.join(process.cwd(), '.env.local'),
          path.join(process.cwd(), '.env'),
          path.join(process.cwd(), '..', '.env.local'),
          path.join(process.cwd(), '..', '.env'),
          path.join(process.cwd(), '..', '..', '.env.local'),
        ];
        for (const p of possiblePaths) {
          if (fs.existsSync(p)) {
            const content = fs.readFileSync(p, 'utf8');
            const match = content.match(/^GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?/m);
            if (match && match[1]) {
              const val = match[1].trim();
              if (val && !val.includes('YOUR_GEMINI_API_KEY') && !val.includes('YOUR_API_KEY')) {
                apiKey = val;
                console.log(`[classifyNutAction] Loaded API key from file fallback: ${p}`);
                break;
              }
            }
          }
        }
      } catch (e) {
        console.warn('[classifyNutAction] Fallback env loading failed:', e);
      }
    }

    // Clean quotes if present
    if (apiKey) {
      apiKey = apiKey.replace(/['"]/g, '').trim();
    }

    if (!apiKey || apiKey.includes('YOUR_GEMINI_API_KEY') || apiKey.includes('YOUR_API_KEY')) {
      throw new Error('GEMINI_API_KEY is not set or is a placeholder in env. Please configure it in .env.local.');
    }

    console.log(`[classifyNutAction] Using API key: ${apiKey.slice(0, 6)}...${apiKey.slice(-4)} (length: ${apiKey.length})`);

    const ai = new GoogleGenAI({ apiKey });

    // Remove the data:image/jpeg;base64, prefix if present
    const base64Data = base64Image.split(',')[1] || base64Image;

    const prompt = `
      Identify the nut or edible seed in this image. 
      Common nuts: Almond, Brazil Nut, Cashew, Chestnut, Hazelnut, Macadamia, Peanut, Pecan, Pine Nut, Pistachio, Walnut, etc.
      
      Return the result strictly as a JSON object:
      - nutName: The specific name of the nut (e.g., "Almond", "Peanut"). If there is absolutely NO nut or seed in the image, return "None".
      - latinName: The scientific name (e.g., "Arachis hypogaea"), or "None" if no nut is found.
      - shortDescription: 2-3 sentences about its origin, taste, or usage. If no nut is found, return "No nut or seed detected in this image."
      - allergyInfo: Critical allergy warnings for this specific nut.
      - confidence: 0-100 score.
      - possibleAlternative: Any other nut it might be, or "None".
 
      Important: Return ONLY the JSON object. Do NOT use markdown code blocks or backticks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg',
              },
            },
          ],
        },
      ],
    });

    const text = response.text || '';
    if (!text) {
      throw new Error('The AI returned an empty response. Please try again with a different image.');
    }
    
    // Clean up potential markdown formatting in case the AI includes it
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return {
        success: true,
        data: JSON.parse(jsonString),
      };
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError, 'Raw text:', text);
      throw new Error('The AI returned a malformed response. Please try again.');
    }
  } catch (error: any) {
    console.error('AI Classification Error:', error);
    
    let userMessage = error.message || 'Failed to classify nut';
    
    // Catch specific status codes or message patterns
    if (
      error.status === 'RESOURCE_EXHAUSTED' || 
      error.message?.toLowerCase().includes('quota') || 
      error.message?.toLowerCase().includes('limit') ||
      error.message?.toLowerCase().includes('exhausted')
    ) {
      userMessage = 'The AI is currently busy (quota exceeded). Please wait a few seconds and try again.';
    } else if (error.message?.toLowerCase().includes('api key') || error.message?.toLowerCase().includes('key not valid')) {
      userMessage = `Invalid API Key. Please check your .env.local configuration. (Details: ${error.message})`;
    } else {
      userMessage = `Error: ${error.message}`;
    }

    return {
      success: false,
      error: userMessage,
    };
  }
}
