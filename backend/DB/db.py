import os
import logging
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
from tqdm import tqdm

# Configure standard enterprise logging format
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Load configuration environment variables
load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is missing from the configuration.")

# Initialize the Relational Database Management System (RDBMS) Engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"sslmode": "require"}, # זה חובה בגלל שאתה בענן (Neon)
    pool_size=10, 
    max_overflow=20
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    Database session dependency injection provider.
    Ensures that sessions are properly closed after each request execution lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================================================================
# Developer Utilities & Data Analysis Framework
# =========================================================================

def get_table_as_dataframe(table_name: str) -> pd.DataFrame:
    """
    Establishes a connection via the SQLAlchemy engine, extracts the requested 
    table data, and returns it populated within a Pandas DataFrame.
    """
    try:
        df = pd.read_sql_table(table_name, con=engine)
        return df
    except Exception as e:
        logging.error(f"Database abstraction failed. Unable to fetch table '{table_name}': {e}")
        return None

if __name__ == "__main__":
    logging.info("Initiating sequential database table verification and telemetry.")
    
    # List of all database tables in logical dependency order
    target_tables = [
        "countries",
        "cities",
        "users",
        "trips",
        "attraction_categories",
        "attractions",
        "trip_itinerary"
    ]
    
    successfully_loaded_count = 0
    loaded_dataframes = {}
    
    print("\n--- Processing Database Telemetry ---")
    
    # Progress bar loop executing data abstraction layer tests
    for table_name in tqdm(target_tables, desc="Loading DataFrames", unit="table"):
        df = get_table_as_dataframe(table_name)
        if df is not None:
            successfully_loaded_count += 1
            loaded_dataframes[table_name] = df
            
    print("\n=== EXECUTION SUMMARY ===")
    logging.info(f"Database sync complete. Total tables processed: {successfully_loaded_count} / {len(target_tables)} successfully verified.")
    
    # =========================================================================
    # Data Inspection Pipeline (Previews for Key Normalized Tables)
    # =========================================================================
    
    # Preview Geography Infrastructure
    if "countries" in loaded_dataframes and "cities" in loaded_dataframes:
        print("\n=== DATA PREVIEW: GEOGRAPHY STRUCTURE (CITIES) ===")
        print(loaded_dataframes["cities"].to_string(index=False))

    # Preview Identity Access Management Data
    if "users" in loaded_dataframes:
        print("\n=== DATA PREVIEW: USERS TABLE ===")
        users_df = loaded_dataframes["users"]
        # Security compliance: exclude sensitive hash signatures from standard developer logs
        if "password_hash" in users_df.columns:
            users_df = users_df.drop(columns=["password_hash"])
        print(users_df.to_string(index=False))
        
    # Preview Core Trip Records
    if "trips" in loaded_dataframes:
        print("\n=== DATA PREVIEW: TRIPS TABLE ===")
        print(loaded_dataframes["trips"].to_string(index=False))
        
    # Preview Global Catalog
    if "attractions" in loaded_dataframes:
        print("\n=== DATA PREVIEW: GLOBAL ATTRACTIONS CATALOG ===")
        print(loaded_dataframes["attractions"].to_string(index=False))