import { useEffect, useMemo, useState } from "react"
import POS from "./POS"


type Service = {
  id?: number
  name: string
  category: string
  base_price: number
  unit: string
  is_active: boolean
}

export default function App() {
  const [status, setStatus] = useState("checking…")
  const [page, setPage] = useState<"dashboard" | "services" | "pos">("dashboard")

  // health check
  useEffect(() => {
    fetch("http://127.0.0.1:8000/health")
      .then(r => r.json())
      .then(d => setStatus(d.status ?? "unknown"))
      .catch(() => setStatus("offline"))
  }, [])

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="font-semibold">Laundry OS</div>
          <nav className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setPage("dashboard")}
              className={`rounded-md px-3 py-1.5 ${page === "dashboard" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setPage("services")}
              className={`rounded-md px-3 py-1.5 ${page === "services" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
            >
              Services
            </button>
            <button
              onClick={() => setPage("pos")}
              className={`rounded-md px-3 py-1.5 ${page === "pos" ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
            >
              POS
            </button>
          </nav>
          <div className="text-sm text-gray-500">API: {status}</div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        {page === "dashboard" ? <Dashboard /> : page === "services" ? <Services /> : <POS />}
      </main>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card label="Income Today" value="KSh 0" />
      <Card label="Users" value="0" />
      <Card label="Orders" value="0" />
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

function Services() {
  const [list, setList] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<Service>({
    name: "",
    category: "General",
    base_price: 0,
    unit: "piece",
    is_active: true,
  })

  // fetch services
  useEffect(() => {
    setLoading(true)
    fetch("http://127.0.0.1:8000/services")
      .then(r => r.json())
      .then((d: Service[]) => setList(d))
      .finally(() => setLoading(false))
  }, [])

  // add service
  async function addService(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, base_price: Number(form.base_price) }
    const res = await fetch("http://127.0.0.1:8000/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return alert("Failed to create")
    const created = await res.json()
    setList(prev => [created, ...prev])
    setForm({ name: "", category: "General", base_price: 0, unit: "piece", is_active: true })
  }

  async function removeService(id: number) {
    const ok = confirm("Delete this service?")
    if (!ok) return
    const res = await fetch(`http://127.0.0.1:8000/services/${id}`, { method: "DELETE" })
    if (!res.ok) return alert("Failed to delete")
    setList(prev => prev.filter(s => s.id !== id))
    }

  const rows = useMemo(
    () =>
      list.map(s => (
        <tr key={s.id} className="border-b">
          <td className="px-3 py-2">{s?.id}</td>
          <td className="px-3 py-2">{s.name}</td>
          <td className="px-3 py-2">{s.category}</td>
          <td className="px-3 py-2">KSh {Number(s.base_price).toLocaleString()}</td>
          <td className="px-3 py-2">{s.unit}</td>
          <td className="px-3 py-2">{s.is_active ? "Active" : "Inactive"}</td>
          <td className="px-3 py-2">
            <button
              onClick={() => removeService(Number(s.id))}
              className="rounded-md px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
        </td>
        </tr>
      )),
    [list]
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Services</h1>

      <form onSubmit={addService} className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-5">
        <input
          required
          placeholder="Name e.g. Wash & Fold"
          className="rounded-md border px-3 py-2 text-sm md:col-span-2"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Category e.g. Laundry"
          className="rounded-md border px-3 py-2 text-sm"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Base Price"
          className="rounded-md border px-3 py-2 text-sm"
          value={form.base_price}
          onChange={e => setForm({ ...form, base_price: Number(e.target.value) })}
        />
        <input
          placeholder="Unit e.g. piece"
          className="rounded-md border px-3 py-2 text-sm"
          value={form.unit}
          onChange={e => setForm({ ...form, unit: e.target.value })}
        />
        <button
          type="submit"
          className="col-span-full mt-1 w-full rounded-md bg-gray-900 px-4 py-2 text-sm text-white hover:opacity-90 md:col-span-1 md:mt-0"
        >
          Add
        </button>
      </form>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">ID</th>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">Category</th>
              <th className="px-3 py-2 font-medium">Base Price</th>
              <th className="px-3 py-2 font-medium">Unit</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>{loading ? <tr><td className="px-3 py-4" colSpan={6}>Loading…</td></tr> : rows}</tbody>
        </table>
      </div>
    </div>
  )
}
