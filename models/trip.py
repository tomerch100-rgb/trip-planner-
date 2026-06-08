from pydantic import BaseModel,Field
from typing import List, Optional
from datetime import date,time,datetime

# Travel data absorption model
class TripCreate(BaseModel):
    destinations: List[str] #Allows the insertion of multiple destinations
    start_date: date
    end_date: date
    interests: Optional[List[str]] = []  # Interests
    stations: Optional[List[str]] = []   # of stops/attractions on the route

class TripCreate(BaseModel):
    destination: str = Field(..., min_length=2, description="The destination of the trip")
    start_date: date
    end_date: date

class TripResponse(TripCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Attraction Models ---
class AttractionCreate(BaseModel):
    category_id: int
    name: str = Field(..., min_length=2)
    location: str
    price: Optional[float] = 0.0
    visit_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None

class AttractionResponse(AttractionCreate):
    id: int
    trip_id: int
    next_recommended_attraction_id: Optional[int] = None

    class Config:
        from_attributes = True