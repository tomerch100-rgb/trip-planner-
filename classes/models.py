from sqlalchemy import Column, Integer, String, DateTime,Date, ForeignKey
from sqlalchemy.sql import func
from DB.db import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Trip(Base):
    __tablename__ = "trips" 
    id = Column(Integer, primary_key=True, index=True)
    destination = Column(String, index=True)
    start_date = Column(Date)
    end_date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.id"))
