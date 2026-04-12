import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // This is the direct call the error message suggested!
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    
    console.log("--- Available Models for your API Key ---");
    data.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error("Could not list models:", e);
  }
}

listModels();