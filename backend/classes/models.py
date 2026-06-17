from sqlalchemy import Column, Integer, String, DateTime,Date, ForeignKey,Numeric,Time,ARRAY,Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.DB.db import Base

class User(Base):
    """Core user model for authentication and identity management."""
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class Trip(Base):
    """Represents a user's planned or past travel journey."""
    __tablename__ = "trips" 
    
    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id")) 
    start_date = Column(Date)
    end_date = Column(Date)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    
    # One-to-many relationship: Deleting a trip automatically cascades 
    # to delete its entire scheduled itinerary from the database.
    itinerary = relationship("TripItinerary", back_populates="trip", cascade="all, delete-orphan")

class AttractionCategory(Base):
    """Lookup table for categorizing attractions (e.g., Museums, Parks)."""
    __tablename__ = "attraction_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)

class Attraction(Base):
    """Represents a physical point of interest within a city."""
    __tablename__ = "attractions"
    
    id = Column(Integer, primary_key=True, index=True)
    city_id = Column(Integer, ForeignKey("cities.id")) 
    name = Column(String(100), nullable=False)
    address = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    category_id = Column(Integer, ForeignKey("attraction_categories.id"))
    rating = Column(Float, default=0.0)
    google_place_id = Column(String(255), nullable=True)
    
    city = relationship("City", back_populates="attractions")

class Country(Base):
    """Top-level geographic entity."""
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    country_code = Column(String(3), unique=True, nullable=False)

    # One-to-many relationship mapping a country to its constituent cities
    cities = relationship("City", back_populates="country", cascade="all, delete-orphan")

class City(Base):
    """Secondary geographic entity serving as the primary anchor for Trips and Attractions."""
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String(100), nullable=False)
    timezone = Column(String(50), nullable=True)

    # ORM Navigational Properties
    country = relationship("Country", back_populates="cities")
    attractions = relationship("Attraction", back_populates="city", cascade="all, delete-orphan")

class TripItinerary(Base):
    """
    Join model representing a specific scheduled event within a Trip.
    Links a Trip to an Attraction along with its temporal scheduling data.
    """
    __tablename__ = "trip_itinerary"

    id = Column(Integer, primary_key=True, index=True)
    
    # Using CASCADE: If the parent trip or the attraction itself is deleted, 
    # cleanly remove this schedule entry to prevent orphaned data.
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    attraction_id = Column(Integer, ForeignKey("attractions.id", ondelete="CASCADE"), nullable=False)
    
    # Temporal scheduling parameters
    visit_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    actual_price = Column(Numeric(10, 2), default=0.00)
    
    # Tracking the ML/Algorithm recommendation path.
    # SET NULL ensures that deleting the recommended attraction doesn't break this itinerary record.
    next_recommended_attraction_id = Column(Integer, ForeignKey("attractions.id", ondelete="SET NULL"), nullable=True)
    
    # --- ORM Relationships ---
    
    trip = relationship("Trip", back_populates="itinerary")
    
    # Explicitly defining foreign_keys here is crucial. Since this table has multiple ForeignKeys 
    # pointing to the 'attractions' table (attraction_id & next_recommended_attraction_id),
    # SQLAlchemy needs strict disambiguation to know exactly which FK to use when 
    # resolving dot notation (e.g., itinerary.attraction.name).
    attraction = relationship("Attraction", foreign_keys=[attraction_id])