import {HLChapter} from "@/types";

export async function searchChapters(apiKey: string, query: string, matchCount: number): Promise<HLChapter[]> {

    const response = await fetch("/api/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ query, apiKey, matches: matchCount })
    });

    if (!response.ok) throw new Error(response.statusText);

    return await response.json();
}

export async function fetchAnswer(apiKey: string, prompt: string): Promise<ReadableStream | null> {
    const response = await fetch("/api/answer", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt, apiKey })
    });

    if (!response.ok) throw new Error(response.statusText);

    return response.body;
}