import {loadEnvConfig} from "@next/env";
import {createClient} from "@supabase/supabase-js";
import fs from "fs";
import {Configuration, OpenAIApi} from "openai";
import process from "process";
import winston from 'winston';
import {VideoData} from "@/types";
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


const generateEmbeddingForVideo = async (videoData: VideoData) : Promise<void> => {
    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const video_id = videoData.id;
    const chapters = videoData.chapters;

    for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        const video_title = videoData.title;
        const video_date = null ;
        const start_time = chapter.conversations[0].start;
        const end_time = chapter.conversations[chapter.conversations.length - 1].end;
        const conversation_length = chapter.conversations.map(({ segment }) => segment.length).reduce((a, b) => a + b, 0);
        const conversation_tokens = chapter.conversations.map(({ segment }) => segment.split(" ").length).reduce((a, b) => a + b, 0);
        const chapter_title = chapter.title;
        const conversationString = chapter.conversations.map(({ speaker, segment }) => `${speaker}: ${segment}`).join("\n");


        const embeddingResponse = await openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: conversationString,
        });

        const [{ embedding }] = embeddingResponse.data.data;

        const { data, error } = await supabase
            .from("chapters")
            .insert({
                video_title,
                chapter_title,
                video_date,
                video_id,
                start_time,
                end_time,
                conversation:chapter.conversations,
                conversation_length,
                conversation_tokens,
                embedding,
            })
            .select("*");

        if (error) {
                logger.error(`Supabase Error: ${error.message}`, {
                    details: error.details,
                    status: error.code
                });
                // Optional: Add additional logging for the request sent to Supabase.
                console.error('Request data:', {
                    video_title,
                    chapter_title,
                    video_date,
                    video_id,
                    start_time,
                    end_time,
                    conversation:chapter.conversations,
                    conversation_length,
                    conversation_tokens,
                });

    } else {
            logger.info(`Successfully processed video ${truncate(video_title, 30)} chapter ${truncate(chapter_title, 30)}`);
        }
        // Add a delay to prevent rate limit errors
        await new Promise((resolve) => setTimeout(resolve, 20));
    }
};

const processFile = async (filePath: string): Promise<void> => {
    try {
        const videoData = JSON.parse(fs.readFileSync(filePath, "utf8"));
        await generateEmbeddingForVideo(videoData);
    } catch (error) {
        logger.error(`Error processing file ${filePath}: ${error}`);
    }
};

(async () => {
    // Assuming files are located in the 'data/videos' directory and have a .json extension
    const videoDirPath = "/Users/ashishsavani/hl-gpt/xTtM2AvCRyA.json";
        await processFile(videoDirPath);
})();