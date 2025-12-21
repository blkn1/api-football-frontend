import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTeamMetrics, TeamMetrics } from "@/lib/api";
import { MetricsChart } from "@/components/MetricsChart";

export function TeamPage() {
    const { id } = useParams<{ id: string }>();
    const [metrics, setMetrics] = useState<TeamMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        getTeamMetrics(id)
            .then(setMetrics)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="p-8">Loading metrics...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
    if (!metrics) return <div className="p-8">No data found</div>;

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Team Analysis (Last 20 Matches)</h1>
            <div className="mb-6 text-sm text-muted-foreground">
                Team ID: {id}
            </div>
            <MetricsChart metrics={metrics} teamName={`Team ${id}`} />
        </div>
    );
}
