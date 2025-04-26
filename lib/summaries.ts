import { getDbConnection } from "@/lib/db";

export async function getSummaries(userId: string) {
    
    const sql = await getDbConnection();
    
    const summaries = await sql`
        SELECT * from pdf_summaries where user_id = ${userId}
        ORDER BY created_at DESC`;

    return summaries;
}

export async function getSummaryById (id: string) {
  try {
    const sql = await getDbConnection();

    const [summary] = await sql `SELECT
      id,
      user_id,
      title,
      original_file_url,
      summary_text,
      status,
      created_at,
      updated_at,
      file_name,
      LENGTH(summary_text) - LENGTH(REPLACE(summary_text, ' ', '')) + 1 as word_count
      FROM pdf_summaries where id=${id}`;

    return summary;

  } catch (err) {
    console.error("Error fetching summary by id", err);
    return null;
  }
}

