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
    max_price: Optional[float] = Query(None, description="מחיר מקסימלי לאטרקציה (סינון תקציב)"),
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    return crud.get_filtered_attractions(db, city_id, category_id, max_price)

@router.get("/explore-live")
def explore_live_attractions(
    city_id: int,
    category_name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    if category_name and category_name.strip() == "":
        category_name = None

    # 1. קוראים ל-CRUD כדי להביא את העיר
    city = crud.get_city_by_id(db, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="העיר לא נמצאה")

    # 2. קוראים ל-CRUD כדי לבדוק אם יש נתונים שמורים (Cache)
    cached_attractions = crud.get_cached_attractions(db, city_id, category_name)

    if cached_attractions:
        return {
            "city_searched": city.name,
            "category": category_name,
            "total_results": len(cached_attractions),
            "attractions": cached_attractions
        }

    # 3. אם אין ב-Cache, פונים לגוגל
    google_results = fetch_attractions_from_google(city.name, category_name)
    
    # 4. קוראים ל-CRUD כדי לשמור את התוצאות החדשות
    saved_attractions = crud.save_google_results_to_db(db, google_results, city_id)
    
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
    return crud.create_new_attraction(db, attraction)

@router.get("/by-country/{country_id}", response_model=List[schemas.AttractionResponse])
def read_attractions_by_country(country_id: int, db: Session = Depends(get_db)):
    attractions = crud.get_attractions_by_country(db, country_id)
    if not attractions:
        raise HTTPException(status_code=404, detail="לא נמצאו אטרקציות במדינה זו")
    return attractions

@router.get("/recommend",response_model=List[AttractionResponse]) 
def recommended_attractions (  
     db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id) ) :
    top_category_id =  crud.get_user_recommendations(db,user_id)
    if top_category_id == None:
        return []
    recommended_places = crud.get_attraction_suggest(db, user_id, top_category_id)
    return recommended_places


