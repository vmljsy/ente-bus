import os
from typing import Optional
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import NullPool
from urllib.parse import quote_plus

# Load environment variables
load_dotenv()

class DatabaseConfig:
    def __init__(self):
        self.db_type = os.getenv("DB_TYPE", "postgresql").lower()
        
        # PostgreSQL settings
        self.pg_user = os.getenv("POSTGRES_USER") or os.getenv("user")
        self.pg_password = os.getenv("POSTGRES_PASSWORD") or os.getenv("password")
        self.pg_host = os.getenv("POSTGRES_HOST") or os.getenv("host")
        self.pg_port = os.getenv("POSTGRES_PORT") or os.getenv("port")
        self.pg_dbname = os.getenv("POSTGRES_DB") or os.getenv("dbname")
        
        # SQLite settings
        self.sqlite_path = os.getenv("SQLITE_PATH", "sqlite:///./app.db")
        
        # Supabase settings
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")
        self.supabase_db_url = os.getenv("DATABASE_URL")  # Direct database URL for Supabase

    def get_database_url(self) -> str:
        if self.db_type == "sqlite":
            return self.sqlite_path
        
        elif self.db_type == "supabase" and self.supabase_db_url:
            return self.supabase_db_url
            
        elif self.db_type == "postgresql":
            if not all([self.pg_user, self.pg_password, self.pg_host, self.pg_port, self.pg_dbname]):
                raise ValueError("PostgreSQL connection environment variables are not all set.")
            
            return f"postgresql+psycopg2://{quote_plus(self.pg_user)}:{quote_plus(self.pg_password)}@{self.pg_host}:{self.pg_port}/{self.pg_dbname}"
            
        else:
            raise ValueError(f"Unsupported database type: {self.db_type}")

    def get_engine_kwargs(self) -> dict:
        """Get SQLAlchemy engine keyword arguments based on database type"""
        kwargs = {}
        
        if self.db_type == "sqlite":
            kwargs["connect_args"] = {"check_same_thread": False}
        else:
            kwargs["poolclass"] = NullPool
            
        return kwargs

# Initialize database configuration
db_config = DatabaseConfig()
DATABASE_URL = db_config.get_database_url()

# Create SQLAlchemy engine with appropriate configuration
engine = create_engine(DATABASE_URL, **db_config.get_engine_kwargs())
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def test_connection() -> bool:
    """Test database connection"""
    try:
        with engine.connect() as connection:
            connection.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Database connection error: {e}")
        return False

def init_db():
    """Initialize database connection and return engine"""
    return engine