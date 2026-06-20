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
    Retrieves all existing countries in the system.
    Used for the first step - selecting a country in the Frontend.
    """
    return db.query(Country).order_by(Country.name).all()


@router.get("/countries/{country_id}/cities", response_model=List[CityGeographyResponse])
def get_cities_by_country(country_id: int, db: Session = Depends(get_db)):
    """
    Retrieves all cities belonging to a specific country.
    Once the user selects a country, the frontend calls this route to display only its cities.
    """
    country = db.query(Country).filter(Country.id == country_id).first()
    if not country:
        raise HTTPException(status_code=404, detail="The requested country was not found")
        
    return db.query(City).filter(City.country_id == country_id).order_by(City.name).all()