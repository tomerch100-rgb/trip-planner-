from sqlalchemy import Column, Integer, String, DateTime,Date, ForeignKey,Numeric
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
    city_id = Column(Integer, ForeignKey("cities.id")) 
    start_date = Column(Date)
    end_date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.user_id"))


class AttractionCategory(Base):

    __tablename__ = "attraction_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)


class Attraction(Base):
  
    __tablename__ = "attractions"
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("attraction_categories.id"))
    city_id = Column(Integer, ForeignKey("cities.id")) 
    name = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    default_price = Column(Numeric(10, 2), default=0.00)    