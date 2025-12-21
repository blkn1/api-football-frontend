import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import { FixturesPage } from "./pages/FixturesPage"
import { TeamPage } from "./pages/TeamPage"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
        },
    },
})

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Dashboard />}>
                        <Route index element={<Navigate to="/fixtures" replace />} />
                        <Route path="fixtures" element={<FixturesPage />} />
                        <Route path="teams/:id" element={<TeamPage />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App
