# apps/api/app/db.py
import pathlib
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Put the SQLite file in apps/api/laundryos.db (absolute path)
BASE_DIR = pathlib.Path(__file__).resolve().parent.parent  # apps/api
DB_PATH = BASE_DIR / "laundryos.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    future=True,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)

class Base(DeclarativeBase):
    pass

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
