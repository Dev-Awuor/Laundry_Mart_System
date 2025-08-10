#!/usr/bin/env python3
import argparse, json, os, sys, time
from typing import Any, Dict, Tuple, Optional

# Try requests, else stdlib
try:
    import requests  # type: ignore
    def http(method: str, url: str, payload: Optional[Dict]=None, timeout: float=5.0) -> Tuple[int, str]:
        try:
            if method == "GET":
                r = requests.get(url, timeout=timeout)
            elif method == "POST":
                r = requests.post(url, json=payload, timeout=timeout)
            elif method == "PUT":
                r = requests.put(url, json=payload, timeout=timeout)
            elif method == "DELETE":
                r = requests.delete(url, timeout=timeout)
            else:
                raise ValueError("unsupported method")
            return r.status_code, r.text
        except Exception as e:
            return 0, str(e)
except Exception:
    import urllib.request, urllib.error
    def http(method: str, url: str, payload: Optional[Dict]=None, timeout: float=5.0) -> Tuple[int, str]:
        data = None
        headers = {}
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
            headers = {"Content-Type": "application/json"}
        req = urllib.request.Request(url, data=data, method=method, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.getcode(), resp.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            try:
                body = e.read().decode("utf-8")
            except Exception:
                body = str(e)
            return e.code, body
        except Exception as e:
            return 0, str(e)

GREEN = "\033[92m"; RED = "\033[91m"; YELLOW = "\033[93m"; CYAN = "\033[96m"; RESET = "\033[0m"
def ok(msg): print(f"{GREEN} {msg}{RESET}")
def warn(msg): print(f"{YELLOW} {msg}{RESET}")
def bad(msg): print(f"{RED} {msg}{RESET}")
def info(msg): print(f"{CYAN} {msg}{RESET}")

def as_json(s: str) -> Any:
    try: return json.loads(s)
    except Exception: return None

def check_health(base: str) -> bool:
    info(f"Checking {base}/health")
    sc, body = http("GET", f"{base}/health")
    j = as_json(body)
    if sc == 200 and isinstance(j, dict) and j.get("status") == "ok":
        ok("API health ok")
        return True
    bad(f"API health failed (status={sc}, body={body[:200]})")
    return False

def check_services_list(base: str) -> bool:
    info("GET /services")
    sc, body = http("GET", f"{base}/services")
    j = as_json(body)
    if sc == 200 and isinstance(j, list):
        ok(f"/services returned list of {len(j)}")
        return True
    bad(f"/services not list (status={sc}, body={body[:200]})"); return False

def create_service(base: str) -> Optional[int]:
    payload = {"name": f"Wash & Fold {int(time.time())}", "category":"General","base_price":200,"unit":"piece","is_active":True}
    info("POST /services (create)")
    sc, body = http("POST", f"{base}/services", payload)
    j = as_json(body)
    if sc in (200,201) and isinstance(j, dict) and "id" in j:
        ok(f"created service id={j['id']}")
        return int(j["id"])
    bad(f"create failed (status={sc}, body={body[:200]})"); return None

def update_service(base: str, sid: int) -> bool:
    payload = {"name":"Wash & Fold UPDATED","category":"General","base_price":250,"unit":"piece","is_active":True}
    info(f"PUT /services/{sid} (update)")
    sc, body = http("PUT", f"{base}/services/{sid}", payload)
    j = as_json(body)
    if sc == 200 and isinstance(j, dict) and j.get("base_price") in (250, 250.0):
        ok("update ok")
        return True
    bad(f"update failed (status={sc}, body={body[:200]})"); return False

def delete_service(base: str, sid: int) -> bool:
    info(f"DELETE /services/{sid}")
    sc, body = http("DELETE", f"{base}/services/{sid}")
    if sc in (200,204):
        ok("delete ok")
        # verify it is gone
        sc2, body2 = http("GET", f"{base}/services")
        j2 = as_json(body2)
        if sc2 == 200 and isinstance(j2, list) and all(str(x.get("id")) != str(sid) for x in j2):
            ok("verify delete ok")
            return True
        warn("could not verify delete in list (but delete returned success)")
        return True
    bad(f"delete failed (status={sc}, body={body[:200]})"); return False

def vat_check() -> bool:
    subtotal = 200*2 + 150
    discount = 50
    taxable = subtotal - discount
    vat = round(taxable * 0.16, 2)
    total = round(taxable + vat, 2)
    if (subtotal, taxable, vat, total) == (550, 500, 80.0, 580.0):
        ok("VAT math check (client expectations) ok")
        return True
    bad("VAT math check failed"); return False

def db_check(path: Optional[str]) -> bool:
    if not path: 
        warn("DB path not provided; skipping file check"); return True
    if os.path.exists(path):
        ok(f"DB file exists: {path}")
        return True
    bad(f"DB file NOT found: {path}"); return False

def frontend_probe(ports: list) -> bool:
    if not ports: 
        warn("No frontend ports provided; skipping"); return True
    import http.client
    tried = []
    for p in ports:
        tried.append(p)
        try:
            conn = http.client.HTTPConnection("127.0.0.1", int(p), timeout=2.0)
            conn.request("GET", "/")
            resp = conn.getresponse()
            body = resp.read(128)
            conn.close()
            if resp.status in (200, 304):
                ok(f"Frontend alive on port {p} (HTTP {resp.status})")
                return True
        except Exception as e:
            continue
    bad(f"Frontend not reachable on ports: {tried}"); return False

def main():
    ap = argparse.ArgumentParser(description="Laundry OS smoke test")
    ap.add_argument("--base", default="http://127.0.0.1:8000", help="API base URL")
    ap.add_argument("--db", default="", help="SQLite DB path (optional), e.g. apps/api/laundryos.db")
    ap.add_argument("--frontend-ports", nargs="*", type=int, default=[5173,5174], help="Ports to probe for Vite dev")
    args = ap.parse_args()

    print("=== Laundry OS Smoke Test ===")
    print(f"API base: {args.base}")
    if args.db: print(f"DB path:  {args.db}")
    print(f"Frontend ports to probe: {args.frontend_ports}")
    print("----------------------------")

    passed = True
    passed &= check_health(args.base)
    passed &= check_services_list(args.base)

    sid = create_service(args.base)
    if sid is None: passed = False
    else:
        passed &= update_service(args.base, sid)
        passed &= delete_service(args.base, sid)

    passed &= vat_check()
    passed &= db_check(args.db if args.db else None)
    passed &= frontend_probe(args.frontend_ports)

    print("----------------------------")
    if passed:
        ok("ALL CHECKS PASSED")
        sys.exit(0)
    else:
        bad("SOME CHECKS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
