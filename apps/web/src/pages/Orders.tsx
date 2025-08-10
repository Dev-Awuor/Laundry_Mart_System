import { useEffect, useState } from "react"

type OrderItem = {
  id: number
  service_id: number
  name: string
  unit_price: number
  qty: number
  line_total: number
}

type Order = {
  id: number
  customer_name?: string | null
  customer_phone?: string | null
  subtotal: number
  discount: number
  taxable: number
  vat: number
  total: number
  status: string
  items: OrderItem[]
}

const kes = new Intl.NumberFormat("en-KE")

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch("http://127.0.0.1:8000/orders")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((d: Order[]) => setOrders(d))
      .catch(() => setError("Could not load orders"))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Orders</h1>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Items</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-3 py-6 text-gray-500" colSpan={6}>Loading…</td>
              </tr>
            )}
            {error && !loading && (
              <tr>
                <td className="px-3 py-6 text-red-600" colSpan={6}>{error}</td>
              </tr>
            )}
            {!loading && !error && orders.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-gray-500" colSpan={6}>No orders yet</td>
              </tr>
            )}
            {!loading && !error && orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="px-3 py-2">#{o.id}</td>
                <td className="px-3 py-2">{o.customer_name || "Walk-in"}</td>
                <td className="px-3 py-2">{o.items?.length ?? 0}</td>
                <td className="px-3 py-2">KSh {kes.format(o.total)}</td>
                <td className="px-3 py-2">{o.status}</td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => setSelected(o)}
                    className="rounded-md px-2 py-1 text-xs hover:bg-gray-100"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* simple modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-lg border bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Order #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="rounded-md px-2 py-1 text-sm hover:bg-gray-100">Close</button>
            </div>

            <div className="mb-3 grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Customer:</span> {selected.customer_name || "Walk-in"}</div>
              <div><span className="text-gray-500">Phone:</span> {selected.customer_phone || "—"}</div>
              <div><span className="text-gray-500">Status:</span> {selected.status}</div>
              <div><span className="text-gray-500">Items:</span> {selected.items?.length ?? 0}</div>
            </div>

            <div className="rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-left">
                  <tr>
                    <th className="px-3 py-2">Item</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Unit</th>
                    <th className="px-3 py-2">Line</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.items.map(it => (
                    <tr key={it.id} className="border-t">
                      <td className="px-3 py-2">{it.name}</td>
                      <td className="px-3 py-2">{it.qty}</td>
                      <td className="px-3 py-2">KSh {kes.format(it.unit_price)}</td>
                      <td className="px-3 py-2">KSh {kes.format(it.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-500">Subtotal</div><div className="text-right">KSh {kes.format(selected.subtotal)}</div>
              <div className="text-gray-500">Discount</div><div className="text-right">KSh {kes.format(selected.discount)}</div>
              <div className="text-gray-500">Taxable</div><div className="text-right">KSh {kes.format(selected.taxable)}</div>
              <div className="text-gray-500">VAT 16%</div><div className="text-right">KSh {kes.format(selected.vat)}</div>
              <div className="font-semibold">Total</div><div className="text-right font-semibold">KSh {kes.format(selected.total)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
