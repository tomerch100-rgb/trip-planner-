from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.DB.db import get_db
from backend.classes.models import Country, City
from backend.classes.schemas import CountryResponse, CityGeographyResponse

router = APIRouter(
   
    tags=["Geography"]
)

@router.get("/countries", response_model=List[CountryResponse])
def get_countries(db: Session = Depends(get_db)):
    """
    שולף את כל המדינות הקיימות במערכת.
    משמש לשלב הראשון - בחירת ארץ ב-Frontend.
    """
    return db.query(Country).order_by(Country.name).all()


@router.get("/countries/{country_id}/cities", response_model=List[CityGeographyResponse])
def get_cities_by_country(country_id: int, db: Session = Depends(get_db)):
    """
    שולף את כל הערים השייכות למדינה ספציפית.
    ברגע שהמשתמש בוחר ארץ, הפרונטאנד קורא לנתיב הזה כדי להציג רק את הערים שלה.
    """
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="המדינה המבוקשת לא נמצאה")
        
    return db.query(City).filter(City.country_id == country_id).order_by(City.name).all()