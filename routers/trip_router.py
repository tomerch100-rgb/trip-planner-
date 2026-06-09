from fastapi import APIRouter, Depends,  status
from sqlalchemy.orm import Session
from   classes  import schemas
from DB.db import get_db
from core.security import get_current_user_id 
import classes.crud as crud 
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