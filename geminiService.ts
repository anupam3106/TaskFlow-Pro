
import { GoogleGenAI, Type } from "@google/genai";

// Always use the process.env.API_KEY directly in the named parameter.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTaskBreakdown = async (title: string, description: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down the following task into a list of 3-5 small, actionable sub-tasks:
      Title: ${title}
      Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subTasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of actionable sub-tasks'
            }
          },
          required: ["subTasks"]
        }
      }
    });

    const data = JSON.parse(response.text);
    return data.subTasks || [];
  } catch (error) {
    console.error("AI breakdown failed:", error);
    return [];
  }
};

export const getDailySummary = async (tasks: any[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Provide a short, motivating 2-sentence summary of the user's workload for today based on these tasks: ${JSON.stringify(tasks)}`,
        });
        // Accessing .text as a property directly from GenerateContentResponse.
        return response.text || "Let's crush those goals today!";
    } catch (error) {
        return "You've got tasks to do. Stay focused!";
    }
}
