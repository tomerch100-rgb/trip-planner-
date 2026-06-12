from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.classes import schemas,crud
from backend.core import security
from backend.DB.db import get_db 
# ייבוא מודלי ה-ORM (מסד הנתונים)
from backend.classes.models import Attraction, AttractionCategory, City
# ייבוא מודלי ה-Pydantic (וולידציה ו-JSON)
from backend.classes.schemas import AttractionResponse, CategoryResponse
# ייבוא השירות החיצוני של גוגל
from backend.services.google_places import fetch_attractions_from_google

# הגדרת הראוטר עם קידומת ונציגות ב-Swagger Docs
router = APIRouter(
    tags=["Attractions"]
)

@router.get("/categories", response_model=List[CategoryResponse])
def get_all_categories(db: Session = Depends(get_db),    user_id: int = Depends( security.get_current_user_id)  
):
    """
    שולף את כל קטגוריות האטרקציות הקיימות במסד הנתונים.
    משמש לבניית תפריטי סינון (Dropdowns) או כפתורים ב-Frontend.
    """
    return db.query(AttractionCategory).all()

@router.get("/categories-with-attractions", response_model=List[schemas.CategoryWithAttractionsResponse])
def get_categories_and_their_attractions(city_id: int, db: Session = Depends(get_db)):
    """
    מחזיר את כל הקטגוריות יחד עם האטרקציות שלהן עבור עיר ספציפית.
    """
    return crud.get_categories_with_attractions(db, city_id)

@router.get("/", response_model=List[AttractionResponse])
def get_attractions(
    city_id: Optional[int] = Query(None, description="סינון לפי מזהה עיר מתוך מסד הנתונים מקומי"),
    category_id: Optional[int] = Query(None, description="סינון לפי מזהה קטגוריה מתוך מסד הנתונים המקומי"),
    max_price: Optional[float] = Query(None, description="מחיר מקסימלי לאטרקציה (סינון תקציב)"), # <-- התוספת
    db: Session = Depends(get_db),
    user_id: int = Depends( security.get_current_user_id)  

):
    """
    שולף אטרקציות השמורות במסד הנתונים המקומי (PostgreSQL).
    מאפשר סינון אופציונלי לפי עיר ו/או קטגוריה.
    """
    query = db.query(Attraction)
    
    # סינון דינמי לפי מזהה עיר
    if city_id is not None:
        query = query.filter(Attraction.city_id == city_id)
        
    # סינון דינמי לפי מזהה קטגוריה
    if category_id is not None:
        query = query.filter(Attraction.category_id == category_id)
    if max_price is not None:
        query = query.filter(Attraction.default_price <= max_price)
        
    return query.all()

@router.get("/explore-live")
def explore_live_attractions(
    city_id: int,
    category_name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    if category_name and category_name.strip() == "":
        category_name = None

    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="העיר לא נמצאה")

    query = db.query(Attraction).filter(Attraction.city_id == city_id)
    if category_name:
        query = query.join(AttractionCategory).filter(AttractionCategory.name == category_name)
    
    cached_attractions = query.all()

    if cached_attractions:
        return {
            "city_searched": city.name,
            "category": category_name,
            "total_results": len(cached_attractions),
            "attractions": cached_attractions
        }

    google_results = fetch_attractions_from_google(city.name, category_name)
    saved_attractions = [] 
    
    for item in google_results:
        new_attr = Attraction(
            name=item.get('name') or 'Unknown',
            city_id=city_id,
            address=item.get('formatted_address') or item.get('address') or 'כתובת לא ידועה',
            default_price=item.get('price') or 0.0,
            latitude=item.get('latitude'),
            longitude=item.get('longitude')
        )
        db.add(new_attr)
        saved_attractions.append(new_attr)
    
    db.commit()
    for attr in saved_attractions:
        db.refresh(attr)
    
    return {
        "city_searched": city.name,
        "category": category_name,
        "total_results": len(saved_attractions),
        "attractions": saved_attractions
    }
@router.post("/", response_model=AttractionResponse, status_code=201)
def create_attraction(
    attraction: schemas.AttractionCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    new_attraction = Attraction(**attraction.model_dump())
    db.add(new_attraction)
    db.commit()
    db.refresh(new_attraction)
    return new_attraction

@router.get("/by-country/{country_id}", response_model=List[schemas.AttractionResponse])
def read_attractions_by_country(country_id: int, db: Session = Depends(get_db)):
    attractions = crud.get_attractions_by_country(db, country_id)
    if not attractions:
        raise HTTPException(status_code=404, detail="לא נמצאו אטרקציות במדינה זו")
    return attractions