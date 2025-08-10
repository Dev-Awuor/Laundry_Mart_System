import { useEffect, useMemo, useState } from "react"

type Service = { id: number; name: string; category: string; base_price: number; unit: string; is_active: boolean }
type CartLine = { id: number; name: string; price: number; qty: number }

const VAT_RATE = 0.16

export default function POS() {
  const [services, setServices] = useState<Service[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [discount, setDiscount] = useState<number>(0)

  useEffect(() => {
    fetch("http://127.0.0.1:8000/services")
      .then(r => r.json())
      .then((d: Service[]) => setServices(d))
      .catch(() => setServices([]))
  }, [])

  function addToCart(s: Service) {
    setCart(prev => {
      const found = prev.find(l => l.id === s.id)
      if (found) return prev.map(l => (l.id === s.id ? { ...l, qty: l.qty + 1 } : l))
      return [{ id: s.id, name: s.name, price: Number(s.base_price), qty: 1 }, ...prev]
    })
  }
  function changeQty(id: number, qty: number) {
    setCart(prev => prev.map(l => (l.id === id ? { ...l, qty: Math.max(1, qty) } : l)))
  }
  function removeLine(id: number) {
    setCart(prev => prev.filter(l => l.id !== id))
  }

  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, l) => sum + l.price * l.qty, 0)
    const safeDiscount = Math.min(discount || 0, subtotal)
    const taxable = subtotal - safeDiscount
    const vat = +(taxable * VAT_RATE).toFixed(2)
    const total = +(taxable + vat).toFixed(2)
    return { subtotal, discount: safeDiscount, taxable, vat, total }
  }, [cart, discount])

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* services grid */}
      <div className="md:col-span-2 space-y-3">
        <div className="text-sm text-gray-500">Tap to add</div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
          {services.map(s => (
            <button
              key={s.id}
              onClick={() => addToCart(s)}
              className="h-16 rounded-lg border bg-white px-3 text-left hover:bg-gray-50"
              disabled={!s.is_active}
              title={!s.is_active ? "Inactive" : s.name}
            >
              <div className="truncate text-sm font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">KSh {Number(s.base_price).toLocaleString()}</div>
            </button>
          ))}
          {services.length === 0 && (
            <div className="col-span-full rounded-lg border bg-white p-4 text-sm">
              No services yet. Add some in the <span className="font-medium">Services</span> tab.
            </div>
          )}
        </div>
      </div>

      {/* cart panel */}
      <div className="space-y-3">
        <div className="rounded-lg border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2">Item</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Total</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(l => (
                <tr key={l.id} className="border-t">
                  <td className="px-3 py-2">{l.name}</td>
                  <td className="px-3 py-2">
                    <input
                      type="number"
                      min={1}
                      value={l.qty}
                      onChange={e => changeQty(l.id, Number(e.target.value))}
                      className="w-16 rounded-md border px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-3 py-2">KSh {l.price.toLocaleString()}</td>
                  <td className="px-3 py-2">KSh {(l.price * l.qty).toLocaleString()}</td>
                  <td className="px-3 py-2">
                    <button onClick={() => removeLine(l.id)} className="rounded-md px-2 py-1 text-xs hover:bg-gray-100">
                      remove
                    </button>
                  </td>
                </tr>
              ))}
              {cart.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-sm text-gray-500" colSpan={5}>
                    Cart empty
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="rounded-lg border bg-white p-4 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <span>Discount</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={discount}
              onChange={e => setDiscount(Number(e.target.value))}
              className="w-32 rounded-md border px-2 py-1"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span>KSh {totals.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Taxable</span>
            <span>KSh {totals.taxable.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">VAT 16%</span>
            <span>KSh {totals.vat.toLocaleString()}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>KSh {totals.total.toLocaleString()}</span>
          </div>

          <button className="mt-3 w-full rounded-md bg-gray-900 px-4 py-2 text-white hover:opacity-90">
            Pay (mock)
          </button>
        </div>
      </div>
    </div>
  )
}
