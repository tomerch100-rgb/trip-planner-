from fastapi import APIRouter, Depends,  status
from sqlalchemy.orm import Session
from backend.classes  import schemas
from backend.DB.db import get_db
from backend.core.security import get_current_user_id 
import backend.classes.crud as crud 
from typing import List

router = APIRouter( tags=["Trips"])

@router.post("/new_trip", response_model=schemas.TripResponse, status_code=status.HTTP_201_CREATED)
def create_new_trip(
    trip_data: schemas.TripCreate, 
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)  
):
    new_trip = crud.create_trip(db=db, trip=trip_data, user_id=user_id)
    return new_trip


@router.get("/", response_model=List[schemas.TripResponse])
def read_user_trips(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    trips = crud.get_user_trips(db=db, user_id=user_id)
    return trips

@router.get("/{trip_id}", response_model=schemas.TripResponse)
def read_single_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # קוראים לפונקציה מה-CRUD במקום לכתוב פה שאילתות
    trip = crud.get_trip(db=db, trip_id=trip_id, user_id=user_id)
    
    if not trip:
        raise HTTPException(status_code=404, detail="הטיול לא נמצא או שאין לך הרשאה לצפות בו")
        
    return trip