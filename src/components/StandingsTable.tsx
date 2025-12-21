import { Standing } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface StandingsTableProps {
    standings: Standing[];
    title?: string;
}

export function StandingsTable({ standings, title = "League Standings" }: StandingsTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">#</th>
                                <th className="px-4 py-3">Team</th>
                                <th className="px-4 py-3 text-center">P</th>
                                <th className="px-4 py-3 text-center">W</th>
                                <th className="px-4 py-3 text-center">D</th>
                                <th className="px-4 py-3 text-center">L</th>
                                <th className="px-4 py-3 text-center">GD</th>
                                <th className="px-4 py-3 text-center rounded-tr-lg">Pts</th>
                            </tr>
                        </thead>
                        <tbody>
                            {standings.map((team) => (
                                <tr key={team.team_id} className="border-b hover:bg-muted/50 transition-colors">
                                    <td className="px-4 py-3 font-medium">{team.rank}</td>
                                    <td className="px-4 py-3">{team.team_name}</td>
                                    <td className="px-4 py-3 text-center">{team.played}</td>
                                    <td className="px-4 py-3 text-center text-green-600">{team.win}</td>
                                    <td className="px-4 py-3 text-center text-yellow-600">{team.draw}</td>
                                    <td className="px-4 py-3 text-center text-red-600">{team.loss}</td>
                                    <td className="px-4 py-3 text-center font-mono">{team.goals_diff > 0 ? `+${team.goals_diff}` : team.goals_diff}</td>
                                    <td className="px-4 py-3 text-center font-bold">{team.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
