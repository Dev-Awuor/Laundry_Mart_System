from fastapi import FastAPI

app = FastAPI(title="Laundry OS API", version="0.0.1")

@app.get("/")
def home():
    return {"message": "Laundry OS API up"}

@app.get("/health")
def health():
    return {"status": "ok"}
