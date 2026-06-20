from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from classes import schemas
from DB.db import get_db
from core.security import get_current_user_id
import classes.crud as crud
from typing import List

router = APIRouter(tags=["Trips"])

@router.post("/new_trip", response_model=schemas.TripResponse, status_code=status.HTTP_201_CREATED)
def create_new_trip(
    trip_data: schemas.TripCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return crud.create_trip(db=db, trip=trip_data, user_id=user_id)

@router.get("/", response_model=List[schemas.TripResponse])
def read_user_trips(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return crud.get_user_trips(db=db, user_id=user_id)

@router.get("/{trip_id}", response_model=schemas.TripResponse)
def read_single_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    trip = crud.get_trip(db=db, trip_id=trip_id, user_id=user_id)
    if not trip:
        raise HTTPException(status_code=404, detail="The trip was not found or you do not have permission to view it")
    return trip

@router.post("/plan-multi-country", response_model=schemas.TripResponse)
async def plan_trip(
    trip_request: schemas.MultiCountryTripRequest, 
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # 1. Validation check (Guard Clause)
    if not trip_request.city_ids:
        raise HTTPException(status_code=400, detail="No cities were selected for trip planning.")

    # 2. Creating the trip in the DB
    new_trip = crud.create_multi_city_trip(
        db, 
        trip_request.city_ids, 
        trip_request.start_date, 
        trip_request.end_date, 
        user_id
    )
    
    # 3. Fetching attractions for all selected cities
    attractions = crud.get_attractions_for_cities(db, trip_request.city_ids)
    
    # 4. Returning the response
    return {
        **new_trip.__dict__,
        "attractions": attractions
    }