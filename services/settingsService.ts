import { Settings } from "@/types";

export function loadSettings(): Settings {
    const PG_KEY = localStorage.getItem("PG_KEY");
    const PG_MATCH_COUNT = localStorage.getItem("PG_MATCH_COUNT");
    const PG_MODE = localStorage.getItem("PG_MODE");

    return { PG_KEY, PG_MATCH_COUNT, PG_MODE };

}

export function saveSettings(apiKey: string, matchCount: number, mode: string): void {
    localStorage.setItem("PG_KEY", apiKey);
    localStorage.setItem("PG_MATCH_COUNT", matchCount.toString());
    localStorage.setItem("PG_MODE", mode);
}

export function clearSettings(): void {

    localStorage.removeItem("PG_KEY");
    localStorage.removeItem("PG_MATCH_COUNT");
    localStorage.removeItem("PG_MODE");

}