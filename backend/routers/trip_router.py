from fastapi import APIRouter, Depends,  status,HTTPException
from sqlalchemy.orm import Session
from backend.classes  import schemas,models  
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
def get_attractions_for_cities(db: Session, city_ids: List[int]):
    """
    שולף את כל האטרקציות עבור רשימה של מזהי ערים.
    השימוש ב-.in_ הוא הדרך הכי יעילה לשאילתה כזו.
    """
    if not city_ids:
        return []
    
    # המרה למספרים שלמים כדי למנוע בעיות של String/Int
    clean_ids = [int(cid) for cid in city_ids]
    
    return db.query(models.Attraction).filter(
        models.Attraction.city_id.in_(clean_ids)
    ).all()
@router.post("/plan-multi-country", response_model=schemas.TripWithAttractionsResponse)
async def plan_trip(
    trip_request: schemas.MultiCityTripRequest, 
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    if not trip_request.city_ids:
        raise HTTPException(status_code=400, detail="לא נבחרו ערים.")

    new_trip = crud.create_multi_city_trip(
        db, trip_request.city_ids, trip_request.start_date, trip_request.end_date, user_id
    )
    
    attractions = crud.get_attractions_for_cities(db, trip_request.city_ids)
    print(f"DEBUG: Found {len(attractions)} attractions for cities {trip_request.city_ids}")
    # הדרך המפורשת והבטוחה להחזיר את האובייקט
    return schemas.TripWithAttractionsResponse(
        id=new_trip.id,
        user_id=new_trip.user_id,
        city_id=new_trip.city_id,
        start_date=new_trip.start_date,
        end_date=new_trip.end_date,
        attractions=attractions
    )
@router.delete("/{trip_id}")
def remove_trip(trip_id: int, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    # שים לב ששינינו ל-user_id והעברנו אותו ישירות לפונקציה
    success = crud.delete_trip(db=db, trip_id=trip_id, user_id=user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trip not found or unauthorized")
    return {"message": "הטיול נמחק בהצלחה"}