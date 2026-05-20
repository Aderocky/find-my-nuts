
require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found');
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const models = await ai.models.list();
    console.log('Available Models:');
    models.forEach(m => {
      console.log(`- ${m.name} (Supports: ${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();
