import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Credentials & Config ---
const API_BASE = "/api";
// Auth handled by platform proxy or IP allowlist
// Auth handled by platform proxy or IP allowlist

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Types ---
export interface Team {
    id: number;
    name: string;
    logo?: string;
}

export interface Fixture {
    id: number;
    league_id: number;
    season: number | null;
    date_utc: string | null;
    status: string; // "NS", "FT", "LIVE", etc.
    home_team: string; // API returns string names in the list endpoint based on contract? 
    // Wait, contract says: home_team: string; away_team: string; 
    // Let's stick to contract:
    // "home_team": "Galatasaray", "away_team": "Fenerbahce"
    away_team: string;
    goals_home: number | null;
    goals_away: number | null;
    updated_at_utc: string | null;
}

export interface TeamMetrics {
    results: {
        win: number;
        draw: number;
        loss: number;
        win_rate: number;
    };
    goals: {
        for: number;
        against: number;
        clean_sheets: number;
        failed_to_score: number;
    };
    match_stats_avg: {
        possession: number | null;
        shots_on_goal: number | null;
        corners: number | null;
    }
}

export interface Standing {
    rank: number;
    team_id: number;
    team_name: string;
    points: number;
    goals_diff: number;
    played: number;
    win: number;
    draw: number;
    loss: number;
}

// --- API Helpers ---

async function fetchApi<T>(path: string): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) {
        throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<T>;
}

// --- Endpoints ---

export async function getFixtures(date: string) {
    // GET /v1/fixtures?date=YYYY-MM-DD
    return fetchApi<Fixture[]>(`/v1/fixtures?date=${date}&limit=200`);
}

export async function getTeamMetrics(teamId: string | number, lastN = 20) {
    // GET /v1/teams/{team_id}/metrics?last_n=20
    return fetchApi<TeamMetrics>(`/v1/teams/${teamId}/metrics?last_n=${lastN}`);
}

export async function getStandings(leagueId: string | number, season: string | number) {
    // GET /v1/standings/{league_id}/{season}
    // Note: API contract for standings return type wasn't fully detailed in the snippet, 
    // but assuming standard list of standing objects. Use 'any' if unsure, but interface above is a good guess.
    return fetchApi<Standing[]>(`/v1/standings/${leagueId}/${season}`);
}

export async function getLiveScores() {
    // GET /v1/sse/live-scores is SSE, but maybe we just want to fetch snapshot? 
    // Contract says it's SSE endpoint. For simple React fetch, proper SSE implementation is needed.
    // But user asked to "show in react", maybe polling or just fetch if it supports GET?
    // Contract: GET /v1/sse/live-scores?interval_seconds=3&limit=300
    // It returns a stream. For a simple dashboard, let's stick to `getFixtures` which has a 'live' bucket logic.
    // Or if we need real live, we might implement EventSource. 
    // For this task, let's rely on getFixtures for the "Fixtures" page as planned.

    return [];
}

// Utility from contract
export const LIVE_STATUSES = new Set(["1H", "2H", "HT", "ET", "BT", "P", "LIVE", "SUSP", "INT"]);
export const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "AWD", "WO", "ABD", "CANC"]);

export function bucketByStatus(status: string) {
    if (LIVE_STATUSES.has(status)) return "live";
    if (FINISHED_STATUSES.has(status)) return "finished";
    return "upcoming";
}
