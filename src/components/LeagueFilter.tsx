import { LEAGUE_NAMES } from "../lib/constants";

interface LeagueFilterProps {
    selectedIds: number[];
    onChange: (ids: number[]) => void;
}

export function LeagueFilter({ selectedIds, onChange }: LeagueFilterProps) {
    const allLeagueIds = Object.keys(LEAGUE_NAMES).map(Number);

    const toggleLeague = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(lid => lid !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const toggleAll = () => {
        if (selectedIds.length === allLeagueIds.length) {
            onChange([]);
        } else {
            onChange(allLeagueIds);
        }
    }

    return (
        <div className="relative group">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors">
                <span>Filter Leagues</span>
                <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    {selectedIds.length}
                </span>
            </button>

            {/* Dropdown Content */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-card border rounded-lg shadow-lg p-2 z-50 hidden group-hover:block hover:block">
                <div className="space-y-1">
                    <button
                        onClick={toggleAll}
                        className="w-full text-left px-2 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded flex items-center justify-between"
                    >
                        <span>{selectedIds.length === allLeagueIds.length ? "Deselect All" : "Select All"}</span>
                    </button>
                    <div className="h-px bg-border my-1" />
                    {allLeagueIds.map(id => (
                        <label key={id} className="flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted rounded cursor-pointer">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(id)}
                                onChange={() => toggleLeague(id)}
                                className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="truncate">{LEAGUE_NAMES[id]}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
