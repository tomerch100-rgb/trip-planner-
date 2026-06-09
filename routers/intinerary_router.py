from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from classes import schemas
import classes.crud as crud
from core import security
from DB.db import get_db
from typing import List

router = APIRouter(prefix="/itinerary", tags=["itinerary"])

# 1. הוספת הלו"ז (Bulk)
@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def add_bulk_itinerary(
    request: schemas.BulkItineraryCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    result = crud.add_bulk_itinerary(db=db, items=request.items)
    return {"message": "the scedule is updated", "count": len(result)}

@router.get("/{trip_id}", response_model=List[schemas.ItineraryResponse])
def get_trip_itinerary(
    trip_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    # קוראים לפונקציה שכבר כתבנו ב-CRUD
    itinerary = crud.get_trip_itinerary(db=db, trip_id=trip_id)
    
    if not itinerary:
        return [] # מחזירים רשימה ריקה אם אין עדיין לו"ז
        
    return itinerary

@router.get("/{trip_id}/budget")
def get_itinerary_budget(
    trip_id: int, 
    db: Session = Depends(get_db), 
    user_id: int = Depends(security.get_current_user_id)
):
    total_cost = crud.get_trip_total_cost(db=db, trip_id=trip_id)
    return {"trip_id": trip_id, "total_planned_cost": total_cost}