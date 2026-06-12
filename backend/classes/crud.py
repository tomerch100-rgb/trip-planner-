from sqlalchemy.orm import Session
from sqlalchemy.sql import func
import backend.classes.models as models
import backend.classes.schemas as schemas
from backend.core import security 
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
    # trip.country_id מגיע מתוך ה-Schema המעודכן שלך
    new_trip = models.Trip(
        city_id=trip.city_id,      # יכול להיות None
        country_id=trip.country_id, # הוספנו את זה
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



def get_attractions_by_category(db: Session, city_id: int, category_name: str):
    # כאן אנחנו מסננים לפי city_id וגם לפי שם הקטגוריה
    return db.query(models.Attraction).join(models.Category).filter(
        models.Attraction.city_id == city_id,
        models.Category.name == category_name
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
    itinerary_items = [models.TripItinerary(**item.model_dump()) for item in items]
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

def get_trip(db: Session, trip_id: int, user_id: int):
    """
    שולף טיול ספציפי ומוודא שהוא אכן שייך למשתמש שביקש אותו
    """
    return db.query(models.Trip).filter(
        models.Trip.id == trip_id, 
        models.Trip.user_id == user_id
    ).first()

def get_trip_total_cost(db: Session, trip_id: int):
    # מבקש מהדאטה-בייס לסכום את עמודת המחיר של כל האטרקציות בטיול הזה
    total = db.query(func.sum(models.TripItinerary.actual_price)).filter(
        models.TripItinerary.trip_id == trip_id
    ).scalar()
    # אם הלוז ריק, הפונקציה תחזיר None, אז נוודא שמחזירים 0.0
    if total is None :
        return 0.0
    return total
def create_multi_city_trip(db: Session, city_ids: List[int], start_date, end_date, user_id: int):
    
    new_trip = models.Trip(
        city_id=city_ids[0], 
        start_date=start_date,
        end_date=end_date,
        user_id=user_id
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip


def get_attractions_for_cities(db: Session, city_ids: List[int]):
    # אם הרשימה ריקה, נחזיר רשימה ריקה מיד בלי לפנות ל-DB
    if not city_ids:
        return []
        
    return db.query(models.Attraction).filter(
        models.Attraction.city_id.in_(city_ids)
    ).all()


def get_attractions_by_country(db: Session, country_id: int):
    return db.query(models.Attraction).join(models.City).filter(
        models.City.country_id == country_id
    ).all()

def get_category_id_by_name(db: Session, category_name: str):
    if not category_name:
        return None
    # מחפשים את הקטגוריה לפי שם
    cat = db.query(models.AttractionCategory).filter(
        models.AttractionCategory.name.ilike(category_name) # ilike עוזר למנוע בעיות של אותיות גדולות/קטנות
    ).first()
    return cat.id if cat else None