import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const generatePdfSummaryFromGeminiAI = async (pdfText: string) => {

    try {
        //const prompt = `${SUMMARY_SYSTEM_PROMPT}\n\nTransform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-001",
            contents: [
                {
                    role : 'user',
                    parts: [
                        { text: SUMMARY_SYSTEM_PROMPT},
                        {
                            text: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`,
                        },
                    ],
                },
            ],
        });

        if(!response.text) {
            console.error("GeminiAI API response is empty.");
            throw new Error("GeminiAI API response is empty.");
        }
        
        console.log(response.text);
        return response.text;
        
    } catch (error:any) {
        console.error("GeminiAI API error:", error);
        throw error;
    }   
}
