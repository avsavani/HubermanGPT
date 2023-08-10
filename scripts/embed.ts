import {HLVideo, HLJSON} from "@/types";
import {loadEnvConfig} from "@next/env";
import {createClient} from "@supabase/supabase-js";
import fs from "fs";
import {Configuration, OpenAIApi} from "openai";

loadEnvConfig("");

const generateEmbeddings = async (essays: HLVideo[]) => {
    const configuration = new Configuration({apiKey: process.env.OPENAI_API_KEY});
    const openai = new OpenAIApi(configuration);

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    for (let i = 0; i < essays.length; i++) {
        const section = essays[i];

        for (let j = 0; j < section.chunks.length; j++) {
            const chapter = section.chunks[j];
            const {hl_title, hl_url, hl_date, hl_thanks, content, content_length, content_tokens} = chapter;
            const embeddingResponse = await openai.createEmbedding({
                model: "text-embedding-ada-002",
                input: content
            });
            const [{embedding}] = embeddingResponse.data.data;
            const {data, error} = await supabase
                .from("pg")
                .insert({
                    hl_title,
                    hl_url,
                    hl_date,
                    hl_thanks,
                    content,
                    content_length,
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
    const book: HLJSON = JSON.parse(fs.readFileSync("scripts/final_data.json", "utf8"));

    await generateEmbeddings(book.essays);
})();
