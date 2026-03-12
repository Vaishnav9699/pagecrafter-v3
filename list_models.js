const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.Gemini_API_key;

async function listModels() {
    try {
        const ai = new GoogleGenAI({ apiKey });
        const models = await ai.models.list();
        console.log('Available Models:');
        for await (const model of models) {
            console.log(`- ${model.name}`);
        }
    } catch (error) {
        console.error('Error listing models:', error);
    }
}

listModels();
