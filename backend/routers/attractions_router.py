from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.classes import schemas,crud 
from backend.core import security
from backend.DB.db import get_db 
from backend.classes.models import Attraction, AttractionCategory, City
# Pydantic Schemas (Data validation and JSON serialization)
from backend.classes.schemas import AttractionResponse, CategoryResponse
# External API Services
from backend.services.google_places import fetch_attractions_from_google
# Router configuration with Swagger UI grouping
router = APIRouter(
    tags=["Attractions"]
)

@router.get("/categories", response_model=List[CategoryResponse])
def get_all_categories(
    db: Session = Depends(get_db),    
    user_id: int = Depends(security.get_current_user_id)  
):
    """
    Retrieves all available attraction categories from the database.
    Typically used for populating frontend dropdowns and filter components.
    """
    return db.query(AttractionCategory).all()


@router.get("/categories-with-attractions", response_model=List[schemas.CategoryWithAttractionsResponse])
def get_categories_and_their_attractions(city_id: int, db: Session = Depends(get_db),user_id: int = Depends(security.get_current_user_id)):
    """
    Aggregates and returns all categories alongside their associated attractions 
    for a specifically requested city.
    """
    return crud.get_categories_with_attractions(db, city_id)


@router.get("/", response_model=List[AttractionResponse])
def get_attractions(
    city_id: Optional[int] = Query(None, description="Filter by local database city ID"),
    category_id: Optional[int] = Query(None, description="Filter by local database category ID"),
    max_price: Optional[float] = Query(None, description="Maximum attraction price (Budget filter)"),
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    """
    Fetches attractions from the local database, applying dynamic filters 
    for city, category, and budget thresholds.
    """
    return crud.get_filtered_attractions(db, city_id, category_id, max_price)


@router.get("/explore-live", response_model=list[schemas.AttractionResponse])  # - Ensuring the model expects a flat list
def explore_live_attractions(
    city_id: int,
    categories: Optional[str] = Query(None),  # - Updated parameter name
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    """
    Acts as a smart proxy between the local DB and Google Places API.
    Checks the local cache first, and falls back to live API fetching if necessary.
    """
    
    # Bug fix: change from category_name to categories
    if categories is not None and categories.strip() == "":
        categories = None

    city = crud.get_city_by_id(db, city_id)
    if not city:
        raise HTTPException(status_code=404, detail="City not found")

    # Change to categories when retrieving from cache
    cached_attractions = crud.get_cached_attractions(db, city_id, categories)

    # Strict Cache Rule: Only return cached data if it contains valid coordinates (latitude).
    if cached_attractions and cached_attractions[0].latitude is not None:
        # Fix: Return a flat list even from the Cache to prevent crashes in React or Validation
        return cached_attractions

    # Cache miss or incomplete data: Fetch fresh data from Google Places API.
    google_search_category = categories if categories else "Top Attractions"
    google_results = fetch_attractions_from_google(city.name, google_search_category)
    
    # Persist the newly fetched Google data into the local PostgreSQL database
    saved_attractions = crud.save_google_results_to_db(db, google_results, city_id)
    
    # Returning a clean list, which is exactly what the response_model and Frontend expect
    return saved_attractions


@router.post("/", response_model=AttractionResponse, status_code=201)
def create_attraction(
    attraction: schemas.AttractionCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id)
):
    """
    Manually creates a new attraction record in the database.
    """
    return crud.create_new_attraction(db, attraction)


@router.get("/by-country/{country_id}", response_model=List[schemas.AttractionResponse])
def read_attractions_by_country(country_id: int, db: Session = Depends(get_db),user_id: int = Depends(security.get_current_user_id)):
    """
    Retrieves all registered attractions associated with a specific country ID.
    """
    attractions = crud.get_attractions_by_country(db, country_id)
    if not attractions:
        raise HTTPException(status_code=404, detail="No attractions found for this country")
    return attractions


@router.get("/recommend", response_model=List[AttractionResponse]) 
def recommended_attractions(  
    db: Session = Depends(get_db),
    user_id: int = Depends(security.get_current_user_id) 
):
    """
    Personalized Recommendation Engine.
    Analyzes the user's historical trip itinerary, identifies their most frequented 
    attraction category, and suggests new, unvisited attractions within that category.
    """
    top_category_id = crud.get_user_recommendations(db, user_id)
    
    # Fast-fail if the user has no historical data to base recommendations on
    if top_category_id is None:
        return []
        
    recommended_places = crud.get_attraction_suggest(db, user_id, top_category_id)
    return recommended_places

@router.post("/save-google-results")
def save_results(city_id: int, results: list, db: Session = Depends(get_db)):
    # Debug: what did we actually receive?
    if results and len(results) > 0:
        print(f"DEBUG: The first item keys received are: {results[0].keys()}") 
        # Check if there is a field named 'categories' or 'types'
        print(f"DEBUG: First sample item: {results[0]}")
    
    saved_attractions = crud.save_google_results_to_db(db, results, city_id)
    return {"message": "Success", "count": len(saved_attractions)}