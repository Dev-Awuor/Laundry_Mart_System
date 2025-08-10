export async function ping(base = "http://127.0.0.1:8000", timeoutMs = 3000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}/health`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { ok: false, code: res.status };
    const data = await res.json();
    return { ok: data.status === "ok", code: res.status };
  } catch (err: any) {
    clearTimeout(t);
    return { ok: false, code: 0, error: err?.name || "error" };
  }
}
