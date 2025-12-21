import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
        if (open && !details) {
            setLoading(true);
            getFixtureDetails(fixture.id)
                .then(setDetails)
                .catch(err => console.error("Failed to fetch details", err))
                .finally(() => setLoading(false));
        }
    }, [open, fixture.id, details]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {/* We wrap the trigger (card) in a span/div to avoid button-in-button hydration issues if the card is used as action, 
                    but here card content is likely just divs. If the trigger is the whole card, use asChild carefully. */}
                <div className="cursor-pointer">
                    {children}
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-center pb-2 border-b">
                        {fixture.home_team} vs {fixture.away_team}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {loading && <div className="text-center text-sm text-muted-foreground">Loading details...</div>}

                    {!loading && details && details.events.length === 0 && (
                        <div className="text-center text-sm text-muted-foreground">No events recorded.</div>
                    )}

                    {!loading && details && (
                        <div className="space-y-4">
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
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
