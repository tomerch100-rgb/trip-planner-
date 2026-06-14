from sqlalchemy.orm import Session
from sqlalchemy.sql import func
import backend.classes.models as models
import backend.classes.schemas as schemas
from backend.core import security 
from typing import List
from fastapi import HTTPException
from typing import Optional
from datetime import date


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
    

def create_new_attraction(db: Session, attraction_data: schemas.AttractionCreate):
    new_attraction = models.Attraction(**attraction_data.model_dump())
    
    db.add(new_attraction)
    db.commit()
    db.refresh(new_attraction)
    
    return new_attraction

def save_google_results_to_db(db: Session, google_results: list, city_id: int):
    """
    מקבל את רשימת האטרקציות הגולמית מגוגל, יוצר מהן אובייקטים של המסד,
    שומר אותם ב-DB ומחזיר את הרשימה של האטרקציות השמורות.
    """
    saved_attractions = [] 
    
    for item in google_results:
        # חילוץ קואורדינטות חכם: בודק אם זה מגיע במבנה של גוגל, או ישירות כמפתח
        geometry = item.get('geometry', {})
        location = geometry.get('location', {})
        
        lat = location.get('lat') or item.get('latitude') or item.get('lat')
        lng = location.get('lng') or item.get('longitude') or item.get('lng')
        
        new_attr = models.Attraction(
            name=item.get('name') or 'Unknown',
            city_id=city_id,
            address=item.get('formatted_address') or item.get('address') or 'כתובת לא ידועה',
            default_price=item.get('price') or 0.0,
            latitude=lat, 
            longitude=lng 
        )
        db.add(new_attr)
        saved_attractions.append(new_attr)
    
    db.commit()
    
    for attr in saved_attractions:
        db.refresh(attr)
        
    return saved_attractions


def get_filtered_attractions(
    db: Session, 
    city_id: Optional[int] = None, 
    category_id: Optional[int] = None, 
    max_price: Optional[float] = None
):
    """
    שולף אטרקציות מהמסד ומסנן אותן דינמית רק לפי הפרמטרים שנשלחו
    """
    query = db.query(models.Attraction)
    
    if city_id is not None:
        query = query.filter(models.Attraction.city_id == city_id)
        
    if category_id is not None:
        query = query.filter(models.Attraction.category_id == category_id)
        
    if max_price is not None:
        query = query.filter(models.Attraction.default_price <= max_price)
        
    return query.all()


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
    cat = db.query(models.AttractionCategory).filter(
        models.AttractionCategory.name.ilike(category_name) # ilike עוזר למנוע בעיות של אותיות גדולות/קטנות
    ).first()
    return cat.id if cat else None

def get_user_recommendations(db: Session, user_id: int): 
    today = date.today()
    query = db.query(
        models.Attraction.category_id,
        func.count(models.Attraction.category_id).label("cat_count")
    )
    query = query.join(
        models.TripItinerary, 
        models.Attraction.id == models.TripItinerary.attraction_id
    ).join(models.Trip)

    query = query.filter(models.Trip.user_id == user_id)
    query = query.filter(models.TripItinerary.visit_date < today)

    top_category = (
        query.group_by(models.Attraction.category_id)
        .order_by(func.count(models.Attraction.category_id).desc())
        .first()
    )
    if top_category:
        return top_category.category_id
    return None

def get_attraction_suggest (db:Session, user_id:int,top_catergory_id:int)  : 
    visited_attraction_ids = (
        db.query(models.TripItinerary.attraction_id)
        .join(models.Trip)
        .filter(models.Trip.user_id == user_id)
        .subquery() 
    )

    new_places = db.query(models.Attraction).filter(models.Attraction.category_id == top_catergory_id).filter(models.Attraction.id. notin_(visited_attraction_ids)) .all()
    return new_places

def get_city_by_id(db: Session, city_id: int):
    """שולף עיר לפי ה-ID שלה"""
    return db.query(models.City).filter(models.City.id == city_id).first()

def get_cached_attractions(db: Session, city_id: int, category_name: Optional[str] = None):
    """בודק אם יש כבר אטרקציות שמורות במסד לעיר ולקטגוריה הזו"""
    query = db.query(models.Attraction).filter(models.Attraction.city_id == city_id)
    
    # הוספנו בדיקה שהקטגוריה היא לא רק None, אלא גם לא מחרוזת ריקה או רווחים
    if category_name and category_name.strip() != "":
        query = query.join(models.AttractionCategory).filter(models.AttractionCategory.name == category_name)
        
    return query.all()