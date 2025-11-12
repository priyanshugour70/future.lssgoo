import { GoogleGenAI } from '@google/genai';

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
export const ai = new GoogleGenAI({});

export async function generateStreamingResponse(
  prompt: string,
  model: string = 'gemini-2.0-flash-exp'
) {
  try {
    // The new SDK returns an AsyncGenerator directly
    const stream = await ai.models.generateContentStream({
      model,
      contents: prompt,
    });
    
    return stream;
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
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
}

