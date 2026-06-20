from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session 
from backend.classes import schemas
import backend.classes.crud as crud
from backend.core import security 
from backend.DB.db import get_db
from typing import List
router = APIRouter( tags=["itinerary"])

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
@router.delete("/item/{itinerary_id}")
def remove_itinerary_item(itinerary_id: int, db: Session = Depends(get_db), user_id: int = Depends(security.get_current_user_id)):
    success = crud.delete_itinerary_item(db=db, itinerary_id=itinerary_id)
    if not success:
        raise HTTPException(status_code=404, detail="Itinerary item not found")
    return {"message": "האטרקציה הוסרה מהלו''ז בהצלחה"}

@router.put("/item/{itinerary_id}", response_model=schemas.ItineraryResponse) 
def modify_itinerary_item(itinerary_id: int, item_data: schemas.ItineraryUpdate, db: Session = Depends(get_db), user_id: int = Depends(security.get_current_user_id)):
    updated_item = crud.update_itinerary_item(db=db, itinerary_id=itinerary_id, item_data=item_data)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Itinerary item not found")
    return updated_item