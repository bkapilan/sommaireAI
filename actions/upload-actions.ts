'use server';

import { generatePdfSummaryFromGeminiAI } from "@/lib/geminiai";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generatePdfSummaryFromOpenAI } from "@/lib/openai";

export async function generatePdfSummary(uploadResponse: [{
    serverData: {
        userId: string;
        file: {
            url: string;
            name: string;
        }
    }
}]) {
    if(!uploadResponse) {
        return {
            success: false,
            message: "File upload failed",
            data: null,
        };
    }

    const {
        serverData: {
            userId,
            file: {url: url, name: name},
        },
    } = uploadResponse[0];

    if(!url) {
        return {
            success: false,
            message: "File upload failed",
            data: null,
        };
    }

    try {
        console.log("\nurl: ", url);
        console.log("\nname: ", name);
        const pdfText = await fetchAndExtractPdfText(url);


        // console.log("\n\npdfText\n-----------------", {pdfText});

        let summary;

        try {
            const summary = await generatePdfSummaryFromOpenAI(pdfText);

            // console.log("\n\nsummary from openAI\n-----------------", {summary});

            if (!summary) {
                return {
                    success: false,
                    message: "Failed to generate summary",
                    data: null,
                };
            }
    
            return {
                success: true,
                message: "Summary generated successfully",
                data: {
                    summary,
                },
            };

        } catch (error) {
            console.error("Error generating summary:", error);
            // call gemini
            if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
                try {
                    const summary = await generatePdfSummaryFromGeminiAI(pdfText);

                    // if (!geminiSummary) {
                    //     return {
                    //         success: false,
                    //         message: "Failed to generate summary",
                    //         data: null,
                    //     };
                    // }
        
                    // return {
                    //     success: true,
                    //     message: "Summary generated successfully",
                    //     data: {
                    //         summary: geminiSummary,
                    //     },
                    // };
                } catch (geminiError) {
                    console.error('Gemini API failed after OpenAI quote exceeded', geminiError);
                    throw new Error('Failed to generate summary with available AI providers');
                }
            }


        }



    } catch (err) {
        return {
            success: false,
            message: "File upload failed",
            data: null,
        };
    }

}