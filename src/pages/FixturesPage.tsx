import { useEffect, useState } from "react";
import { getFixtures, Fixture, bucketByStatus } from "@/lib/api";
import { FixtureCard } from "@/components/FixtureCard";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { LeagueFilter } from "@/components/LeagueFilter";

// Default tracked leagues from env
const rawTracked = (import.meta.env.VITE_TRACKED_LEAGUES || "").trim();
const DEFAULT_TRACKED_LEAGUES = rawTracked
    ? rawTracked.split(",").map((s: string) => Number(s.trim())).filter((n: number) => Number.isFinite(n))
    : [];

export function FixturesPage() {
    // Persistent state for selected leagues
    const [selectedLeagues, setSelectedLeagues] = useLocalStorage<number[]>("tracked-leagues", DEFAULT_TRACKED_LEAGUES);

    const [fixtures, setFixtures] = useState<Fixture[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "finished">("upcoming");

    // Helper check
    const isLeagueTracked = (leagueId: number) => selectedLeagues.includes(leagueId);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];

        // 1. Initial Fetch
        getFixtures(today)
            .then(allFixtures => {
                setFixtures(allFixtures);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));

        // 2. SSE for Live Scores
        const evtSource = new EventSource("/api/v1/sse/live-scores?interval_seconds=3&limit=300");
        evtSource.onmessage = (event) => {
            try {
                const liveData = JSON.parse(event.data);
                // We don't filter SSE source here, we store all and filter in render/selectors
                // Optimally we should maybe filter here if dataset is huge, but for now client-side valid.

                setFixtures(current => {
                    const next = [...current];
                    liveData.forEach((liveFix: Fixture) => {
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

    // Filter fixtures based on selected leagues
    const filteredFixtures = fixtures.filter(f => isLeagueTracked(f.league_id));

    const live = filteredFixtures.filter(f => bucketByStatus(f.status) === "live");
    const upcoming = filteredFixtures.filter(f => bucketByStatus(f.status) === "upcoming");
    const finished = filteredFixtures.filter(f => bucketByStatus(f.status) === "finished");

    const displayedFixtures = activeTab === "live" ? live : activeTab === "finished" ? finished : upcoming;

    return (
        <div className="container mx-auto py-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Daily Fixtures</h1>
                <LeagueFilter
                    selectedIds={selectedLeagues}
                    onChange={setSelectedLeagues}
                />
            </div>

            {/* Custom Simple Tabs */}
            <div className="flex space-x-2 border-b overflow-x-auto">
                {(["live", "upcoming", "finished"] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[2px] whitespace-nowrap ${activeTab === tab
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
                <div className="text-center py-10 text-muted-foreground">
                    {selectedLeagues.length === 0
                        ? "No leagues selected. Use the filter to select leagues."
                        : "No fixtures found for this category."}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedFixtures.map(f => (
                    <FixtureCard key={f.id} fixture={f} />
                ))}
            </div>
        </div>
    );
}
