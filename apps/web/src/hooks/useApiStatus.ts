import { useEffect, useState } from "react";
import { ping } from "../lib/ping";

type ApiStatus = "ok" | "degraded" | "offline";

export function useApiStatus(intervalMs = 5000): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>("offline");

  useEffect(() => {
    let mounted = true;
    let id = 0 as unknown as number;

    async function check() {
      const r = await ping();
      if (!mounted) return;
      if (r.ok) setStatus("ok");
      else setStatus(r.code >= 500 || r.code === 0 ? "offline" : "degraded");
    }

    check();
    id = window.setInterval(check, intervalMs);
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [intervalMs]);

  return status;
}
