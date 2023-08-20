import {HLVideo, HLJSON} from "@/types";
import {loadEnvConfig} from "@next/env";
import {createClient} from "@supabase/supabase-js";
import fs from "fs";
import {Configuration, OpenAIApi} from "openai";
import process from "process";
import winston from 'winston';

loadEnvConfig("");

// Create a logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }));
}

// Return unique key for each chapter
const getUniqueKey = (videoId: string, chapterTitle: string) : string => `${videoId}-${chapterTitle}`;

// Check if the chapter has already been processed
const hasProcessedChapter = (processedChapters: Set<string>, videoId: string, chapterTitle: string): boolean => {
    const key = getUniqueKey(videoId, chapterTitle);
    return processedChapters.has(key);
};

// Save the processed chapters
const saveProcessedChapter = (processedChapters: Set<string>, videoId: string, chapterTitle: string) : void => {
    const key = getUniqueKey(videoId, chapterTitle);
    processedChapters.add(key);
    fs.writeFileSync("processedChapters.json", JSON.stringify(Array.from(processedChapters)));
};

// Load the processed chapters from storage
// Load the processed chapters from storage
const loadProcessedChapters = (): Set<string> => {
    let data;
    try {
        if(fs.existsSync("processedChapters.json")){
            data = fs.readFileSync("processedChapters.json", 'utf8');
            return new Set(JSON.parse(data));
        }
        else{
            fs.writeFileSync("processedChapters.json", JSON.stringify([]));
            return new Set();
        }
    } catch (err) {
        logger.error(`Error reading or writing processedChapters.json: ${err}`);
        process.exit(1);
    }
};

let greenStart = "\x1b[32m";
let redStart = "\x1b[31m";
let colorEnd = "\x1b[0m";

const truncate = (str: string, n: number) => (str.length > n) ? str.substr(0, n-1) + '...' : str;


const generateEmbeddings = async (essays: HLVideo[]) : Promise<void> => {
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const processedChapters: Set<string> = loadProcessedChapters();

    for (let i = 0; i < essays.length; i++) {
        const section = essays[i];
        for (let j = 0; j < section.chapters.length; j++) {
            const chapter = section.chapters[j];
            const { video_title, chapter_title, video_date, video_id, start_time, end_time, conversation, conversation_length, conversation_tokens } = chapter;

            const key = getUniqueKey(video_id, chapter_title);

            // save the attempted chapters even if it was not successful
            if(hasProcessedChapter(processedChapters, video_id, chapter_title)){
                logger.info(`Skipping processed chapter Video:${truncate(video_title, 30)} chapter ${truncate(chapter_title, 30)}...`);
                continue;
            }

            saveProcessedChapter(processedChapters, video_id, chapter_title);

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
                logger.error(`${redStart}Failed to save video ${truncate(video_title, 30)} chapter ${truncate(chapter_title, 30)}:${colorEnd} ${error.message}`);
            } else {
                logger.info(`${greenStart}Successfully processed video ${truncate(video_title, 30)} chapter ${truncate(chapter_title,
                    30)}${colorEnd}`);
                saveProcessedChapter(processedChapters, video_title, chapter_title);
            }
            await new Promise((resolve) => setTimeout(resolve, 20));
        }
    }
};

(async () => {
    const book: HLJSON = JSON.parse(fs.readFileSync("data/final_data.json", "utf8"));
    await generateEmbeddings(book.videos);
})();