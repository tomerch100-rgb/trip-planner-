from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.classes import schemas
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
    city_id: int = Query(..., description="מזהה העיר מתוך מסד הנתונים שלנו"),
    category_name: str = Query(..., description="שם הקטגוריה באנגלית לחיפוש בגוגל (למשל: Museums, Parks, Restaurants)"),
    db: Session = Depends(get_db) ,
    user_id: int = Depends( security.get_current_user_id)  

   
):
    """
    נתיב מתקדם: חיפוש אטרקציות בזמן אמת מול Google Places API.
    השרת מושך את שם העיר מה-DB שלנו לפי ה-ID ששלח ה-Frontend, 
    מבצע את הפנייה המאובטחת לגוגל, ומחזיר את המידע העדכני ביותר.
    """
    # 1. שליפת העיר ממסד הנתונים כדי לקבל את השם שלה (למשל "Paris")
    city = db.query(City).filter(City.id == city_id).first()
    if not city:
        raise HTTPException(status_code=404, detail="העיר המבוקשת לא נמצאה במערכת")

    # 2. הפעלת השירות החיצוני של גוגל עם שם העיר והקטגוריה
    print(f"DEBUG: מחפש {category_name} בעיר {city.name} בזמן אמת דרך Google Places...")
    google_results = fetch_attractions_from_google(city.name, category_name)

    # 3. החזרת הנתונים המובנים למשתמש
    return {
        "city_searched": city.name,
        "category": category_name,
        "total_results": len(google_results),
        "attractions": google_results
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