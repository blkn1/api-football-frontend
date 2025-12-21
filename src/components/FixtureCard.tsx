import { Fixture, bucketByStatus } from "@/lib/api";
import { Card, CardContent, CardHeader } from "./ui/card";
import { cn } from "@/lib/utils";
import { LEAGUE_NAMES } from "@/lib/constants";
import { MatchDetailsDialog } from "./MatchDetailsDialog";

interface FixtureCardProps {
    fixture: Fixture;
}

export function FixtureCard({ fixture }: FixtureCardProps) {
    const statusBucket = bucketByStatus(fixture.status);

    const getStatusColor = () => {
        if (statusBucket === "live") return "text-red-500 animate-pulse";
        if (statusBucket === "finished") return "text-gray-500";
        return "text-blue-500";
    };

    const formattedTime = fixture.date_utc
        ? new Date(fixture.date_utc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "TBD";

    return (
        <MatchDetailsDialog fixture={fixture}>
            <Card className="hover:shadow-lg transition-shadow h-full">
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                        <span>{fixture.league_id ? (LEAGUE_NAMES[fixture.league_id] || `League ${fixture.league_id}`) : 'Unknown League'}</span>
                        <span className={cn("font-bold", getStatusColor())}>
                            {fixture.status} {statusBucket === "live" && "• LIVE"}
                        </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between items-center py-2">
                        <div className="flex-1 text-right pr-4 font-semibold text-lg">{fixture.home_team}</div>

                        <div className="flex flex-col items-center px-4 bg-muted/50 rounded p-2 min-w-[80px]">
                            {statusBucket !== "upcoming" ? (
                                <span className="text-2xl font-bold">
                                    {fixture.goals_home ?? 0} - {fixture.goals_away ?? 0}
                                </span>
                            ) : (
                                <span className="text-xl font-bold text-muted-foreground">{formattedTime}</span>
                            )}
                        </div>

                        <div className="flex-1 text-left pl-4 font-semibold text-lg">{fixture.away_team}</div>
                    </div>
                    {fixture.date_utc && (
                        <div className="text-center text-xs text-muted-foreground mt-2">
                            {new Date(fixture.date_utc).toLocaleDateString()}
                        </div>
                    )}
                </CardContent>
            </Card>
        </MatchDetailsDialog>
    );
}
