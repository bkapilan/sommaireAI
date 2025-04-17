'use server';

import { getDbConnection } from "@/lib/db";
import { generatePdfSummaryFromGeminiAI } from "@/lib/geminiai";
import { fetchAndExtractPdfText } from "@/lib/langchain";
import { generatePdfSummaryFromOpenAI } from "@/lib/openai";
import { formatFileNameAsTitle } from "@/utils/format-utils";
import { auth } from "@clerk/nextjs/server";

interface PdfSummaryType {
    userId: string;
    fileUrl: string;
    summary: string;
    title: string;
    fileName: string;
}


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

            console.log("\n\nsummary from openAI\n-----------------", {summary});

            if (!summary) {
                return {
                    success: false,
                    message: "Failed to generate summary",
                    data: null,
                };
            }

            const formattedFileName = formatFileNameAsTitle(name);

            return {
                success: true,
                message: "Summary generated successfully",
                data: {
                    title: formattedFileName,
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

async function savePdfSummary({
    userId,
    fileUrl,
    summary,
    title,
    fileName
} : PdfSummaryType) {

    // save the summary to the database
    try {
        const sql = await getDbConnection();
        await sql`INSERT INTO pdf_summaries (
        user_id,
        original_file_url,
        summary_text,
        title,
        file_name
        ) VALUES (
         ${userId},
         ${fileUrl},
         ${summary},
         ${title},
         ${fileName})`;


    } catch (error) { 
        console.error("Error storing PDF summary:", error);
        throw error;
    }


}

export async function storePdfSummaryAction ({
    fileUrl,
    summary,
    title,
    fileName
} : PdfSummaryType) {
    //user is logged in and has a userId
    // savePdfSummary
    // savePdfSummary()

    let savedSummary: any;
    try {
        const { userId } = await auth();
        if (!userId) {
            return {
                success: false,
                message: "User not authenticated",
            };
        }
        savedSummary = await savePdfSummary({
            userId,
            fileUrl,
            summary,
            title,
            fileName
        });

        if (!savedSummary) {
            return {
                success: false,
                message: "Failed to store PDF summary, please try again...",
            };
        }

        return {
            success: true,
            message: "PDF summary stored successfully",
        };

    } catch (error) { 
        console.error("Error storing PDF summary:", error);
        return {
            success: false,
            message:
                error instanceof Error ? error.message : "Failed to store PDF summary",
        };
    }

}