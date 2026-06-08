import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker ,declarative_base
from dotenv import load_dotenv

load_dotenv()
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Creating the login engine
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Function to open and close a connection for each request on the server
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
