import { Activity, Database } from "lucide-react";
import { Link, Outlet } from "react-router-dom";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-sm fixed h-full hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
                        FootData
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">Collector Dashboard</p>
                </div>
                <nav className="px-4 space-y-2">
                    <Link to="/fixtures" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg bg-primary/10 text-primary">
                        <Activity className="w-4 h-4" />
                        Daily Fixtures
                    </Link>
                    <Link to="#" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-muted-foreground hover:bg-muted transition-colors">
                        {/* Placeholder for future */}
                        <Database className="w-4 h-4" />
                        Leagues
                    </Link>

                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
}


