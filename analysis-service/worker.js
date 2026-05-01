import 'dotenv/config';
import axios from 'axios';
import { connectDB , AnalysisResult } from './db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Worker } from "bullmq";

connectDB();
const connection={url: process.env.REDIS_URL};
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Change the model name here
const model = genAI.getGenerativeModel({ 
  model: "gemini-2.5-flash-lite"
});


// If that still fails, try: "gemini-1.5-flash-latest"
const worker = new Worker('error-logs', async (job) => {
  const { userId, message, stackTrace, projectId } = job.data;
  const prompt = `Analyze this error for project ${projectId}: ${message}. Stack: ${stackTrace}`;
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    const savedLog = await AnalysisResult.create({ userId, projectId, message, stackTrace, analysis: response });
    try {
    // Tell the Dashboard service: "Hey, I finished one! Here is the data."
    await axios.post('https://omnilog-ai-analyzer-production.up.railway.app/internal/notify', savedLog);
    console.log("✅ Dashboard notified of new analysis.");
    } catch (error) {
        console.error("Failed to notify dashboard:", error.message);
    }
    console.log(`Successfully analyzed log for project ${projectId}`);
  } catch (err) {
    console.error(`Failed to analyze log for project ${projectId}:`, err);
  }
}, { connection });


