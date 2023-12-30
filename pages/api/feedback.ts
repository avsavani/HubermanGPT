// pages/api/feedback.ts
import { supabaseAdmin } from "@/utils";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { query, answer, feedback } = (await req.json()) as {
      query: string;
      answer: string;
      feedback: 'up' | 'down';
    };

    // Convert feedback from 'up'/'down' to 1/0
    const feedbackValue = feedback === 'up' ? 1 : 0;    

    // Insert the feedback into the feedback table in Supabase
    const { error: insertError } = await supabaseAdmin.from('feedback').insert([
        { query: query, answer: answer, feedback: feedbackValue }
      ]);

    if (insertError) {
      console.error('Error inserting feedback into database:', insertError);
      return new Response("Error", { status: 500 });
    }

    return new Response("Success", { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error instanceof Error ? error.message : error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;