import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFixtureDetails, FixtureDetails, Fixture } from "@/lib/api";

interface MatchDetailsDialogProps {
    fixture: Fixture;
    children: React.ReactNode;
}

export function MatchDetailsDialog({ fixture, children }: MatchDetailsDialogProps) {
    const [open, setOpen] = useState(false);
    const [details, setDetails] = useState<FixtureDetails | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            // Initial fetch
            if (!details) setLoading(true); // Only show loading spinner on first load

            const fetchDetails = () => {
                getFixtureDetails(fixture.id)
                    .then(setDetails)
                    .catch(err => console.error("Failed to fetch details", err))
                    .finally(() => setLoading(false));
            };

            fetchDetails();

            // Poll every 15 seconds for updates while open
            const interval = setInterval(fetchDetails, 15000);
            return () => clearInterval(interval);
        }
    }, [open, fixture.id]);

    // Helper to merge stats for display
    const mergedStats = details?.statistics?.length === 2 ? details.statistics[0].statistics.map((stat) => {
        const type = stat.type;
        const homeValue = stat.value;
        const awayValue = details.statistics[1].statistics.find(s => s.type === type)?.value;
        return { type, homeValue, awayValue };
    }) : [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="cursor-pointer">
                    {children}
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto w-full">
                <DialogHeader>
                    <DialogTitle className="text-center pb-2 border-b">
                        {fixture.home_team} vs {fixture.away_team}
                    </DialogTitle>
                </DialogHeader>

                <div className="py-2">
                    {loading && <div className="text-center text-sm text-muted-foreground py-4">Loading details...</div>}

                    {!loading && details && (
                        <Tabs defaultValue="events" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="events">Events</TabsTrigger>
                                <TabsTrigger value="stats">Statistics</TabsTrigger>
                            </TabsList>
                            <TabsContent value="events" className="space-y-4 pt-4">
                                {details.events.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground">No events recorded.</div>
                                )}
                                {details.events.map((event, i) => (
                                    <div key={i} className="flex items-start text-sm gap-2">
                                        <div className="min-w-[40px] font-mono text-muted-foreground">
                                            {event.time.elapsed}'{event.time.extra ? `+${event.time.extra}` : ''}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">
                                                {event.type} - {event.detail}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {event.player.name} {event.assist.name && `(assist: ${event.assist.name})`}
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold text-muted-foreground">
                                            {event.team.name}
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>
                            <TabsContent value="stats" className="space-y-2 pt-4">
                                {mergedStats.length === 0 && (
                                    <div className="text-center text-sm text-muted-foreground">No statistics available.</div>
                                )}
                                {mergedStats.map((stat, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm border-b pb-1 last:border-0">
                                        <div className="w-12 text-center font-bold">{stat.homeValue ?? 0}</div>
                                        <div className="flex-1 text-center text-muted-foreground text-xs uppercase tracking-wide">
                                            {stat.type}
                                        </div>
                                        <div className="w-12 text-center font-bold">{stat.awayValue ?? 0}</div>
                                    </div>
                                ))}
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
