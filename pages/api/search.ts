import { supabaseAdmin } from "@/utils";
import * as process from "process";
import { HLChapter } from "@/types";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { query, apiKey, matches } = (await req.json()) as {
      query: string;
      apiKey: string;
      matches: number;
    };

    // Insert the query into the `queries` table in Supabase asynchronously
    const { error: insertError } = await supabaseAdmin.from('queries').insert([{ query_text: query }]);

    if (insertError) {
      console.error('Error inserting query into database:', insertError);
    }

    const input = query.replace(/\n/g, " ");
    const apiKe = process.env.OPENAI_API_KEY!;
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKe}`
      },
      method: "POST",
      body: JSON.stringify({
        model: "text-embedding-ada-002",
        input
      })
    });

    const json = await res.json();
    const embedding = json.data[0].embedding;

    const { data: chunks, error } = await supabaseAdmin.rpc("chapter_search", {
      query_embedding: embedding,
      similarity_threshold: 0.01,
      match_count: matches
    });

    if (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }

    return new Response(JSON.stringify(chunks), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
