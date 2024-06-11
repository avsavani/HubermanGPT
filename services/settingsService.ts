import { Settings } from "@/types";

export function loadSettings(): Settings {
    const KEY = localStorage.getItem("KEY");
    const MATCH_COUNT = localStorage.getItem("MATCH_COUNT");
    const MODE = localStorage.getItem("MODE");

    return { KEY: KEY, MATCH_COUNT: MATCH_COUNT, MODE: MODE };

}

export function saveSettings(apiKey: string, matchCount: number, mode: string): void {
    localStorage.setItem("KEY", apiKey);
    localStorage.setItem("MATCH_COUNT", matchCount.toString());
    localStorage.setItem("MODE", mode);
}

export function clearSettings(): void {

    localStorage.removeItem("KEY");
    localStorage.removeItem("MATCH_COUNT");
    localStorage.removeItem("MODE");

}