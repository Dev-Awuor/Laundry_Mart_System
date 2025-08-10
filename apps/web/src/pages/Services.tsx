import { useEffect, useMemo, useState } from "react"

type Service = {
  id?: number
  name: string
  category: string
  base_price: number
  unit: string
  is_active: boolean
}

export default function Services() {
  const [list, setList] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<Service>({
    name: "",
    category: "General",
    base_price: 0,
    unit: "piece",
    is_active: true,
  })

  // fetch services on load
  useEffect(() => {
    setLoading(true)
    fetch("http://127.0.0.1:8000/services")
      .then((r) => r.json())
      .then((d: Service[]) => setList(d))
      .finally(() => setLoading(false))
  }, [])

  // create or update
  async function addService(e: React.FormEvent) {
    e.preventDefault()
    const payload = { ...form, base_price: Number(form.base_price) }

    if (editingId !== null) {
      const res = await fetch(`http://127.0.0.1:8000/services/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) return alert("Failed to update")
      const updated = await res.json()
      setList((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setEditingId(null)
    } else {
      const res = await fetch("http://127.0.0.1:8000/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) return alert("Failed to create")
      const created = await res.json()
      setList((prev) => [created, ...prev])
    }

    setForm({ name: "", category: "General", base_price: 0, unit: "piece", is_active: true })
  }

  // delete
  async function removeService(id: number) {
    const ok = confirm("Delete this service?")
    if (!ok) return
    const res = await fetch(`http://127.0.0.1:8000/services/${id}`, { method: "DELETE" })
    if (!res.ok) return alert("Failed to delete")
    setList((prev) => prev.filter((s) => s.id !== id))
  }

  const rows = useMemo(
    () =>
      list.map((s) => (
        <tr key={s.id} className="border-b">
          <td className="px-3 py-2">{s?.id}</td>
          <td className="px-3 py-2">{s.name}</td>
          <td className="px-3 py-2">{s.category}</td>
          <td className="px-3 py-2">KSh {Number(s.base_price).toLocaleString()}</td>
          <td className="px-3 py-2">{s.unit}</td>
          <td className="px-3 py-2">{s.is_active ? "Active" : "Inactive"}</td>
          <td className="px-3 py-2">
            <button
              onClick={() => {
                setEditingId(Number(s.id))
                setForm({
                  name: s.name,
                  category: s.category,
                  base_price: Number(s.base_price),
                  unit: s.unit,
                  is_active: s.is_active,
                })
              }}
              className="mr-2 rounded-md px-2 py-1 text-xs hover:bg-gray-100"
            >
              Edit
            </button>
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
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          placeholder="Category e.g. Laundry"
          className="rounded-md border px-3 py-2 text-sm"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Base Price"
          className="rounded-md border px-3 py-2 text-sm"
          value={form.base_price}
          onChange={(e) => setForm({ ...form, base_price: Number(e.target.value) })}
        />
        <input
          placeholder="Unit e.g. piece"
          className="rounded-md border px-3 py-2 text-sm"
          value={form.unit}
          onChange={(e) => setForm({ ...form, unit: e.target.value })}
        />

        <div className="col-span-full flex gap-2">
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2"
          >
            {editingId !== null ? "Save changes" : "Add"}
          </button>

          {editingId !== null && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null)
                setForm({ name: "", category: "General", base_price: 0, unit: "piece", is_active: true })
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Cancel edit
            </button>
          )}
        </div>
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
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-3 py-4" colSpan={7}>
                  Loading…
                </td>
              </tr>
            ) : (
              rows
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
