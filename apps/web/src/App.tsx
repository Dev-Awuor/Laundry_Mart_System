import { useState } from "react"
import POS from "./POS"
import Services from "./pages/Services"
import Dashboard from "./pages/Dashboard"
import { useApiStatus } from "./hooks/useApiStatus"   // < relative import

export default function App() {
  const [page, setPage] = useState<"dashboard" | "services" | "pos">("dashboard")
  const apiStatus = useApiStatus(4000)
  const statusClass =
    apiStatus === "ok" ? "text-green-600" :
    apiStatus === "degraded" ? "text-amber-600" : "text-red-600"

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="font-semibold">Laundry OS</div>
          <nav className="flex items-center gap-2 text-sm">
            <button onClick={() => setPage("dashboard")}
              className={`rounded-md px-3 py-1.5 ${page === "dashboard" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>
              Dashboard
            </button>
            <button onClick={() => setPage("services")}
              className={`rounded-md px-3 py-1.5 ${page === "services" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>
              Services
            </button>
            <button onClick={() => setPage("pos")}
              className={`rounded-md px-3 py-1.5 ${page === "pos" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}>
              POS
            </button>
          </nav>
          <span className={`text-sm ${statusClass}`}>API: {apiStatus}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        {page === "dashboard" ? <Dashboard /> : page === "services" ? <Services /> : <POS />}
      </main>
    </div>
  )
}
