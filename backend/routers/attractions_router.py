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
    # שדרוג בטיחות: אם גיא שלח מחרוזת ריקה או רווחים, נהפוך את זה ל-None
    if category_name is not None and category_name.strip() == "":
        category_name = None

    city = crud.get_city_by_id(db, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="העיר לא נמצאה")

    # בודקים אם יש כבר אטרקציות שמורות ב-Cache לעיר הזו
    cached_attractions = crud.get_cached_attractions(db, city_id, category_name)

    # חוק חשוב: נחזיר מה-Cache רק אם האטרקציות השמורות מכילות קואורדינטות תקינות!
    # זה ימנע מהנתונים הישנים והדפוקים לחזור שוב ושוב
    if cached_attractions and cached_attractions[0].latitude is not None:
        return {
            "city_searched": city.name,
            "category": category_name,
            "total_results": len(cached_attractions),
            "attractions": cached_attractions
        }

    # אם אין ב-Cache או שהנתונים ב-Cache חלקיים - פונים לקוד המושלם של גוגל
    # אנחנו שולחים "Museums" כברירת מחדל אם המשתמש לא בחר קטגוריה, כדי שגוגל יחזיר תוצאות מעניינות
    google_search_category = category_name if category_name else "Top Attractions"
    google_results = fetch_attractions_from_google(city.name, google_search_category)
    
    # שמירה ב-DB דרך ה-CRUD
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


