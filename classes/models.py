from sqlalchemy import Column, Integer, String, DateTime,Date, ForeignKey,Numeric,Time
from sqlalchemy.orm import relationship
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
    itinerary = relationship("TripItinerary", back_populates="trip", cascade="all, delete-orphan")


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
    
    city_id = Column(Integer, ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False)
    # 2. הקשר הדו-כיווני שחסר לך עכשיו ומכשיל את הריצה!
    city = relationship("City", back_populates="attractions")

class Country(Base):
    __tablename__ = "countries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    country_code = Column(String(3), unique=True, nullable=False)

    # קשר לערים: למדינה אחת יש הרבה ערים
    cities = relationship("City", back_populates="country", cascade="all, delete-orphan")



class City(Base):
    __tablename__ = "cities"

    id = Column(Integer, primary_key=True, index=True)
    country_id = Column(Integer, ForeignKey("countries.id", ondelete="RESTRICT"), nullable=False)
    name = Column(String(100), nullable=False)
    timezone = Column(String(50), nullable=True)

    # קשרי גומלין לוגיים (Relationships)
    country = relationship("Country", back_populates="cities")
    attractions = relationship("Attraction", back_populates="city", cascade="all, delete-orphan")

class TripItinerary(Base):
    __tablename__ = "trip_itinerary"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id", ondelete="CASCADE"), nullable=False)
    attraction_id = Column(Integer, ForeignKey("attractions.id", ondelete="CASCADE"), nullable=False)
    # תאריך ושעות הביקור
    visit_date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    
    actual_price = Column(Numeric(10, 2), default=0.00)
    next_recommended_attraction_id = Column(Integer, ForeignKey("attractions.id", ondelete="SET NULL"), nullable=True)
    # --- קשרי גומלין (Relationships) ---
    # זה מה שיאפשר לנו לעשות itinerary.attraction.name ולקבל "הלובר" מיד!
    trip = relationship("Trip", back_populates="itinerary")
    
    # אומר ל-SQLAlchemy איך לשלוף את פרטי האטרקציה ששובצה
    attraction = relationship("Attraction", foreign_keys=[attraction_id])