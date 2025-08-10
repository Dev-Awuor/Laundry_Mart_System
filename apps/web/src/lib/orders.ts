// apps/web/src/lib/orders.ts
export type OrderItemIn = { service_id: number; qty: number }
export type OrderCreate = {
  customer_name?: string
  customer_phone?: string
  discount: number
  items: OrderItemIn[]
}
export type OrderOut = {
  id: number
  subtotal: number
  discount: number
  taxable: number
  vat: number
  total: number
  status: string
}

const API = "http://127.0.0.1:8000"

export async function createOrder(payload: OrderCreate): Promise<OrderOut> {
  const res = await fetch(`${API}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => "")
    throw new Error(txt || `Failed to create order (${res.status})`)
  }
  return res.json()
}
