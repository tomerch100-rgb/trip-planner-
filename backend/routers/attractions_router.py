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

@router.get("/explore-live", response_model=List[schemas.AttractionResponse])
def explore_live_attractions(
    city_id: int,
    categories: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    # 1. ניקוי קלט
    if categories is not None and categories.strip() == "":
        categories = None

    city = crud.get_city_by_id(db, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="העיר לא נמצאה")

    # 2. ניסיון שליפה מ-Cache
    cached_attractions = crud.get_cached_attractions(db, city_id, categories)
    
    if cached_attractions and cached_attractions[0].latitude is not None:
        # כאן התיקון: מחזירים רק את הרשימה, לא מילון עם מפתחות!
        return cached_attractions

    # 3. פנייה לגוגל אם אין ב-Cache
    google_search_category = categories if categories else "Top Attractions"
    google_results = fetch_attractions_from_google(city.name, google_search_category)
    
    # 4. שמירה ב-DB והחזרת הרשימה
    saved_attractions = crud.save_google_results_to_db(db, google_results, city_id)
    
    # הנה זה - מחזירים רשימה נטו, שזה בדיוק מה שה-response_model מצפה לו
    return saved_attractions

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
@router.post("/save-google-results")
def save_results(city_id: int, results: list, db: Session = Depends(get_db)):
    # דיבאג: מה באמת קיבלנו?
    if results and len(results) > 0:
        print(f"DEBUG: המקום הראשון שקיבלתי הוא: {results[0].keys()}") 
        # נבדוק אם יש בכלל שדה שנקרא 'categories' או 'types'
        print(f"DEBUG: הדגימה הראשונה: {results[0]}")
    
    saved_attractions = crud.save_google_results_to_db(db, results, city_id)
    return {"message": "בוצע", "count": len(saved_attractions)}