from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List
from .db import Base, engine
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Laundry OS API", version="0.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Laundry OS API up"}

@app.get("/health")
def health():
    return {"status": "ok"}

# ---- mock Services store (in memory) ----
class ServiceIn(BaseModel):
    name: str
    category: str = "General"
    base_price: float = Field(ge=0)
    unit: str = "piece"
    is_active: bool = True

class ServiceOut(ServiceIn):
    id: int

SERVICES: List[ServiceOut] = []
_next_id = 1

@app.get("/services", response_model=List[ServiceOut])
def list_services():
    return SERVICES

@app.post("/services", response_model=ServiceOut)
def create_service(payload: ServiceIn):
    global _next_id
    item = ServiceOut(id=_next_id, **payload.model_dump())
    _next_id += 1
    SERVICES.append(item)
    return item

@app.delete("/services/{service_id}", status_code=204)
def delete_service(service_id: int):
    # find item by id and remove it
    idx = next((i for i, s in enumerate(SERVICES) if s.id == service_id), None)
    if idx is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found")
    SERVICES.pop(idx)
    return None

@app.put("/services/{service_id}", response_model=ServiceOut)
def update_service(service_id: int, payload: ServiceIn):
    # find the item
    item = next((s for s in SERVICES if s.id == service_id), None)
    if item is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found")

    # update fields
    item.name = payload.name
    item.category = payload.category
    item.base_price = payload.base_price
    item.unit = payload.unit
    item.is_active = payload.is_active
    return item

@app.put("/services/{service_id}", response_model=ServiceOut)
def update_service(service_id: int, payload: ServiceIn):
    item = next((s for s in SERVICES if s.id == service_id), None)
    if item is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Not found")
    item.name = payload.name
    item.category = payload.category
    item.base_price = payload.base_price
    item.unit = payload.unit
    item.is_active = payload.is_active
    return item

