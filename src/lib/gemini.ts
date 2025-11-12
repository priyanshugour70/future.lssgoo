import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️  GEMINI_API_KEY not set. AI features will not work.');
}

export const genAI = new GoogleGenerativeAI(apiKey);

export async function generateStreamingResponse(
  prompt: string,
  model: string = 'gemini-2.0-flash-exp'
) {
  try {
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContentStream(prompt);
    return result.stream;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

export async function generateResponse(
  prompt: string,
  model: string = 'gemini-2.0-flash-exp'
) {
  try {
    const generativeModel = genAI.getGenerativeModel({ model });
    const result = await generativeModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

