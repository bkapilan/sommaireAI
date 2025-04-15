import OpenAI from "openai";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export async function generatePdfSummaryFromOpenAI(pdfText: string) {

    try {

        const response = await client.responses.create({
            model: "gpt-4o",
            input: [
                {
                    role: "system",
                    content: SUMMARY_SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: `Transform this document into an engaging, esay-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`,
                },
            ],
            temperature: 0.7,
            max_output_tokens: 1500,
        });
        
        return response.output_text;

    } catch (error:any) {

        if (error?.status === 429) {
            console.error("Rate limit exceeded. Please try again later.");
            throw new Error("Rate limit exceeded. Please try again later.");
        }

        throw error;

    }   

}

