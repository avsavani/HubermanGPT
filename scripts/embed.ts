import {HLVideo, HLJSON} from "@/types";
import {loadEnvConfig} from "@next/env";
import {createClient} from "@supabase/supabase-js";
import fs from "fs";
import {Configuration, OpenAIApi} from "openai";

loadEnvConfig("");

const generateEmbeddings = async (essays: HLVidoes[]) => {
    const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY});
    const openai = new OpenAIApi(configuration);

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    for (let i = 0; i < essays.length; i++) {
        const section = essays[i];

        for (let j = 0; j < section.chapters.length; j++) {
            const chapter = section.chapters[j];

            const { chapter_title, hl_url, hl_date, hl_id, start_time, end_time, conversation, conversation_length, content_tokens } = chapter;
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
                .from("pg")
                .insert({
                    chapter_title,
                    hl_url,
                    hl_date,
                    hl_id,
                    start_time,
                    end_time,
                    conversation,
                    conversation_length,
                    content_tokens,
                    embedding
                })
                .select("*");

            if (error) {
                console.log("error", error);
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
