from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
from datetime import date, time

# --- User Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=2, description="שם משתמש חייב להכיל לפחות 2 תווים")
    password: str = Field(..., min_length=6, description="סיסמה חייבת להכיל לפחות 6 תווים")

class UserLogin(BaseModel):
    username: str = Field(..., min_length=2)
    password: str = Field(..., min_length=6)

# --- Trip Schemas ---
class TripCreate(BaseModel):
    city_id: int
    start_date: date
    end_date: date

class TripResponse(TripCreate):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)

# המודל החדש לאיחוד טיול ואטרקציות
class MultiCityTripRequest(BaseModel):
    city_ids: List[int]
    start_date: date
    end_date: date

class AttractionResponse(BaseModel):
    id: int
    name: str
    city_id: int | None = None
    model_config = ConfigDict(from_attributes=True)

class TripWithAttractionsResponse(TripResponse):
    attractions: List[AttractionResponse] = []
    model_config = ConfigDict(from_attributes=True)

# --- Attraction Schemas ---
class AttractionCreate(BaseModel):
    category_id: int
    name: str = Field(..., min_length=2)
    address: str
    default_price: Optional[float] = 0.0
    latitude: Optional[float] = Field(None, description="קואורדינטת קו רוחב")
    longitude: Optional[float] = Field(None, description="קואורדינטת קו אורך")

class AttractionResponse(AttractionCreate):
    id: int
    city_id: int | None = None

    model_config = ConfigDict(from_attributes=True)

# --- Trip Itinerary (לו"ז יומי) Schemas ---
class ItineraryCreate(BaseModel):
    trip_id: int
    attraction_id: int
    visit_date: date
    start_time: time
    end_time: time
    actual_price: Optional[float] = 0.0

class ItineraryResponse(ItineraryCreate):
    id: int
    next_recommended_attraction_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class CategoryResponse(BaseModel):
    id: int
    name: str
    
    model_config = ConfigDict(from_attributes=True)

class BulkItineraryCreate(BaseModel):
    items: List[ItineraryCreate]

class CountryResponse(BaseModel):
    id: int
    name: str
    country_code: str
    model_config = ConfigDict(from_attributes=True)

class CityGeographyResponse(BaseModel):
    id: int
    name: str
    timezone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
class CategoryWithAttractionsResponse(BaseModel):
    id: int
    name: str
    attractions: List[AttractionResponse] = []

    class Config:
        from_attributes = True