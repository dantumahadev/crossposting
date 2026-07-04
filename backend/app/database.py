from sqlmodel import create_engine, Session, SQLModel
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Handle SQLite vs PostgreSQL connect args
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args=connect_args
)

def get_session():
    with Session(engine) as session:
        yield session

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
