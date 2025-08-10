// apps/web/src/pages/Dashboard.tsx
import { useEffect, useState } from "react"

type Service = { id: number }

export default function Dashboard() {
  const [serviceCount, setServiceCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("http://127.0.0.1:8000/services")
      .then(r => r.json())
      .then((d: Service[]) => setServiceCount(d.length))
      .catch(() => setServiceCount(0))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card label="Income Today" value="KSh 0" />
        <Card label="Services" value={loading ? "…" : String(serviceCount)} />
        <Card label="Orders Today" value="0" />
      </div>

      <div className="rounded-lg border bg-white p-6 text-sm text-gray-500">
        Recent activity will appear here once we add Orders.
      </div>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  )
}
