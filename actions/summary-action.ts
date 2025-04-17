'use server';

import { getDbConnection } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteSummaryAction({
    summaryId
} : { 
    summaryId: string 
}) {

    try {
        //delete from db
        const user = await currentUser();
        const userId = user?.id;

        if (!user) {
            throw new Error("User not authenticated");
        }
        

        const sql = await getDbConnection();
        const result = await sql`
        DELETE FROM pdf_summaries WHERE id = ${summaryId}
        AND user_id = ${userId} RETURNING id`;

        //revalidatePath
        if (result.length > 0) {
            console.log("Summary deleted successfully");
            revalidatePath('/dashboard');
            return { success: true };
        }

        return { success: false };

    }
    catch (error) {
        console.error("Error deleting summary:", error);
        throw new Error("Failed to delete summary");
    }
}
