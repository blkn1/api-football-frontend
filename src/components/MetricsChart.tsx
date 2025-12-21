import { TeamMetrics } from "@/lib/api";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface MetricsChartProps {
    metrics: TeamMetrics;
    teamName: string;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // Green, Yellow, Red

export function MetricsChart({ metrics, teamName }: MetricsChartProps) {
    const resultData = [
        { name: 'Wins', value: metrics.results.win },
        { name: 'Draws', value: metrics.results.draw },
        { name: 'Losses', value: metrics.results.loss },
    ];

    const goalsData = [
        { name: 'Scored', goals: metrics.goals.for },
        { name: 'Conceded', goals: metrics.goals.against },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Win Rate Pie Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>{teamName}: Last 20 Matches Result</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={resultData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {resultData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Goals Bar Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Goals Scored vs Conceded</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={goalsData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="goals" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Average Stats (Last 20)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{metrics.match_stats_avg.possession ?? '-'}%</div>
                            <div className="text-sm text-muted-foreground">Possession</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{metrics.match_stats_avg.shots_on_goal ?? '-'}</div>
                            <div className="text-sm text-muted-foreground">Shots on Goal</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold">{metrics.match_stats_avg.corners ?? '-'}</div>
                            <div className="text-sm text-muted-foreground">Corners</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
