from sqlalchemy.orm import Session
import classes.models as models
import classes.schemas as schemas
from core import security 

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

