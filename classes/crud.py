from sqlalchemy.orm import Session
import classes.models as models
import classes.schemas as schemas
from core import security 
from typing import List
from fastapi import HTTPException


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.hash_password(user.password)
    
    db_user = models.User(
        email=user.email,
        username=user.username, 
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, user_login: schemas.UserLogin):
    user = get_user_by_username(db, user_login.username)
    if not user:
        return None
    if not security.verify_password(user.password_hash, user_login.password):
        return None
        
    return user


def create_trip(db: Session, trip: schemas.TripCreate, user_id: int):
    new_trip = models.Trip(
        city_id=trip.city_id, 
        start_date=trip.start_date,
        end_date=trip.end_date,
        user_id=user_id  
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    
    return new_trip

def get_user_trips(db: Session, user_id: int):
    return db.query(models.Trip).filter(models.Trip.user_id == user_id).all()



def get_attractions_by_city(db: Session, city_id: int):

    return db.query(models.Attraction).filter(models.Attraction.city_id == city_id).all()



def get_attractions_by_category(db: Session, city_id: int, category_id: int):

    return db.query(models.Attraction).filter(
        models.Attraction.city_id == city_id,
        models.Attraction.category_id == category_id
    ).all()

# פונקציות ניהול לו"ז יומי ()

def add_bulk_itinerary(db: Session, items: List[schemas.ItineraryCreate]):
    # 1. שליפת כל הלו"ז הקיים לאותו טיול כדי לבדוק התנגשויות
    trip_id = items[0].trip_id
    existing_items = db.query(models.TripItinerary).filter(
        models.TripItinerary.trip_id == trip_id
    ).all()
    
    # 2. בדיקת התנגשויות
    for new_item in items:
        for existing in existing_items:
            # בודקים אם זה באותו יום
            if new_item.visit_date == existing.visit_date:
                # בודקים אם הטווחים חופפים:
                if new_item.start_time < existing.end_time and new_item.end_time > existing.start_time:
                    raise HTTPException (
                        status_code=400, 
                        detail=f"התנגשות בשעות: ביום {new_item.visit_date} האטרקציה חופפת ללוז"
                    )

    # 3. אם הכל תקין, מכניסים את הכל
    itinerary_items = [models.TripItinerary(**item.dict()) for item in items]
    db.bulk_save_objects(itinerary_items)
    db.commit()
    return itinerary_items
    

def get_trip_itinerary(db: Session, trip_id: int):
    """
    שולף את כל הלו"ז של טיול ספציפי.
    הקסם פה הוא ה-order_by: ה-SQL מסדר לנו את התוצאות כרונולוגית 
    לפי תאריך ואז לפי שעת התחלה, ככה שה-Frontend מקבל את זה מוכן להצגה!
    """
    return db.query(models.TripItinerary).filter(
        models.TripItinerary.trip_id == trip_id
    ).order_by(
        models.TripItinerary.visit_date, 
        models.TripItinerary.start_time
    ).all()