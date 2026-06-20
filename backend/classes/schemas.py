from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import date, time

# --- User Schemas ---

class UserCreate(BaseModel):
    """Payload for registering a new user."""
    email: EmailStr
    username: str = Field(..., min_length=2, description="Username must contain at least 2 characters")
    password: str = Field(..., min_length=6, description="Password must contain at least 6 characters")

class UserLogin(BaseModel):
    """Payload for user authentication credentials."""
    username: str = Field(..., min_length=2)
    password: str = Field(..., min_length=6)

class UserLoginResponse(BaseModel):
    """Public response model for User data. """
    user_id: int
    email: str
    username: str
    # Crucial: Tells Pydantic to translate the SQLAlchemy database object into JSON automatically
    model_config = ConfigDict(from_attributes=True)


# --- Trip Schemas ---

class TripCreate(BaseModel):
    """Payload for initiating a standard single-destination trip."""
    city_id: Optional[int] = None   # Allowed to be None for country-wide trips
    country_id: Optional[int] = None # Added to match the SQLAlchemy model and create_trip function 🌟
    start_date: date
    end_date: date

class TripResponse(TripCreate):
    """Standard response model for a Trip, including DB-generated IDs."""
    id: int
    user_id: int
    city: Optional[CityLightResponse] = None
    model_config = ConfigDict(from_attributes=True)

class MultiCityTripRequest(BaseModel):
    """DTO (Data Transfer Object) for planning a multi-destination itinerary."""
    city_ids: List[int]
    start_date: date
    end_date: date


# --- Attraction Schemas (Fixed Duplication) ---

class AttractionLightResponse(BaseModel):
    """Lightweight response model for basic Attraction data, preventing name collisions. 🌟"""
    id: int
    name: str
    city_id: int | None = None
    model_config = ConfigDict(from_attributes=True)

class TripWithAttractionsResponse(TripResponse):
    """Extended Trip response that nests its associated attractions using the lightweight schema."""
    attractions: List[AttractionLightResponse] = [] # Updated to use the correct unique name 🌟
    model_config = ConfigDict(from_attributes=True)

class AttractionCreate(BaseModel):
    """Payload for creating a new physical point of interest."""
    category_id: int
    name: str = Field(..., min_length=2)
    address: str
    default_price: Optional[float] = 0.0
    latitude: Optional[float] = Field(None, description="Geographic latitude coordinate")
    longitude: Optional[float] = Field(None, description="Geographic longitude coordinate")

class AttractionResponse(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    rating: Optional[float] = None
    category_id: Optional[int] = None 

    class Config:
        from_attributes = True


# --- Trip Itinerary (Daily Schedule) Schemas ---

class ItineraryCreate(BaseModel):
    """Payload for scheduling a single event within a trip's timeline."""
    trip_id: int
    attraction_id: int
    visit_date: date
    start_time: time
    end_time: time
    actual_price: Optional[float] = 0.0

class ItineraryResponse(ItineraryCreate):
    """Response model representing a confirmed scheduled event."""
    id: int
    next_recommended_attraction_id: Optional[int] = None
    attraction: Optional[AttractionResponse] = None
    model_config = ConfigDict(from_attributes=True)

class BulkItineraryCreate(BaseModel):
    """Payload for batch-inserting multiple itinerary events at once."""
    items: List[ItineraryCreate]

class ItineraryUpdate(BaseModel):
    day_number: Optional[int] = None
    time_slot: Optional[str] = None  # למשל: "10:00", "14:30"

    class Config:
        from_attributes = True

# --- Geography & Category Responses ---

class CategoryResponse(BaseModel):
    """Response model for an Attraction Category (e.g., Museum, Park)."""
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class CountryResponse(BaseModel):
    """Response model for geographic Country data."""
    id: int
    name: str
    country_code: str
    model_config = ConfigDict(from_attributes=True)

class CityGeographyResponse(BaseModel):
    """Response model for geographic City data."""
    id: int
    name: str
    timezone: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class CategoryWithAttractionsResponse(BaseModel):
    """Aggregated response model grouping attractions by their parent category."""
    id: int
    name: str
    attractions: List[AttractionResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class ExploreLiveResponse(BaseModel):
    """Response model for live attraction searches, including metadata and results."""
    city_searched: str
    category: Optional[str] = None
    total_results: int
    attractions: List[AttractionResponse] = []

    model_config = ConfigDict(from_attributes=True)

class CountryLightResponse(BaseModel):
    name: str
    model_config = ConfigDict(from_attributes=True)

class CityLightResponse(BaseModel):
    name: str
    country: Optional[CountryLightResponse] = None
    model_config = ConfigDict(from_attributes=True)