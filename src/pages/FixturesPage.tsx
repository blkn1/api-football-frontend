import { useEffect, useState } from "react";
import { getFixtures, Fixture, bucketByStatus } from "@/lib/api";
import { FixtureCard } from "@/components/FixtureCard";
// Tracked Leagues logic
const rawTracked = (import.meta.env.VITE_TRACKED_LEAGUES || "").trim();
const TRACKED_LEAGUES = new Set(
    rawTracked ? rawTracked.split(",").map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n)) : []
);

export function FixturesPage() {
    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "finished">("upcoming");

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];

        // 1. Initial Fetch
        getFixtures(today)
            .then(allFixtures => {
                // Client-side whitelist filtering
                const filtered = allFixtures.filter(f => TRACKED_LEAGUES.has(f.league_id));
                setFixtures(filtered);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));

        // 2. SSE for Live Scores
        const evtSource = new EventSource("/api/v1/sse/live-scores?interval_seconds=3&limit=300");
        evtSource.onmessage = (event) => {
            try {
                const liveData = JSON.parse(event.data);
                // Filter SSE updates by whitelist too!
                const relevantLive = liveData.filter((f: Fixture) => TRACKED_LEAGUES.has(f.league_id));

                setFixtures(current => {
                    const next = [...current];
                    relevantLive.forEach((liveFix: Fixture) => {
                        const idx = next.findIndex(f => f.id === liveFix.id);
                        if (idx !== -1) {
                            next[idx] = liveFix;
                        } else if (bucketByStatus(liveFix.status) !== "finished") {
                            // If it's a new live game we hadn't seen, add it
                            next.push(liveFix);
                        }
                    });
                    return next;
                });
            } catch (e) {
                console.error("SSE Parse Error", e);
            }
        };

        return () => evtSource.close();
    }, []);

    const live = fixtures.filter(f => bucketByStatus(f.status) === "live");
    const upcoming = fixtures.filter(f => bucketByStatus(f.status) === "upcoming");
    const finished = fixtures.filter(f => bucketByStatus(f.status) === "finished");

    const displayedFixtures = activeTab === "live" ? live : activeTab === "finished" ? finished : upcoming;

    return (
        <div className="container mx-auto py-8 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Daily Fixtures</h1>

            {/* Custom Simple Tabs */}
            <div className="flex space-x-2 border-b">
                {(["live", "upcoming", "finished"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px] ${activeTab === tab
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)} ({
                            tab === "live" ? live.length : tab === "finished" ? finished.length : upcoming.length
                        })
                    </button>
                ))}
            </div>

            {loading && <div className="text-center py-10">Loading fixtures...</div>}
            {error && <div className="text-center py-10 text-red-500">Error: {error}</div>}

            {!loading && displayedFixtures.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">No fixtures found for this category.</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedFixtures.map(f => (
                    <FixtureCard key={f.id} fixture={f} />
                ))}
            </div>
        </div>
    );
}
