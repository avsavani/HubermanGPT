import {HLVideo, HLJSON} from "@/types";
import {loadEnvConfig} from "@next/env";
import {createClient} from "@supabase/supabase-js";
import fs from "fs";
import {Configuration, OpenAIApi} from "openai";
import process from "process";

loadEnvConfig("");

const generateEmbeddings = async (essays: HLVideo[]) => {
    const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY});
    const openai = new OpenAIApi(configuration);
    console.log("NEXT_PUBLIC_SUPABASE_URL",process.env.NEXT_PUBLIC_SUPABASE_URL )
    console.log("SUPABASE_SERVICE_ROLE_KEY",process.env.SUPABASE_SERVICE_ROLE_KEY );
    console.log("process.env.NEXT_PUBLIC_SUPABASE_URL",process.env.NEXT_PUBLIC_SUPABASE_URL );

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    for (let i = 0; i < essays.length; i++) {
        const section = essays[i];

        for (let j = 0; j < section.chapters.length; j++) {
            const chapter = section.chapters[j];

            const { video_title,chapter_title, video_date, video_id, start_time, end_time, conversation, conversation_length, conversation_tokens } = chapter;
            // turn conversation into a string with newlines and speaker names
            // export type HLSegment = {
            //     start: number; // float in seconds
            //     end: number;
            //     speaker: string;
            //     segment: string;
            // }

            const conversationString = conversation.map(({speaker, segment}) => `${speaker}: ${segment}`).join("\n");

            const embeddingResponse = await openai.createEmbedding({
                model: "text-embedding-ada-002",
                input: conversationString
            });

            const [{embedding}] = embeddingResponse.data.data;
            const {data, error} = await supabase
                .from("chapters")
                .insert({
                    video_title,
                    chapter_title,
                    video_date,
                    video_id,
                    start_time,
                    end_time,
                    conversation,
                    conversation_length,
                    conversation_tokens,
                    embedding
                })
                .select("*");

            if (error) {
                console.log("error 1", error);
            } else {
                console.log("saved", i, j);
            }

            await new Promise((resolve) => setTimeout(resolve, 200));
        }
    }
};

(async () => {
    const book: HLJSON = JSON.parse(fs.readFileSync("data/final_data.json", "utf8"));
    await generateEmbeddings(book.videos);
})();
