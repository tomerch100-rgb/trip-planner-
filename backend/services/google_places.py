import os
import requests
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

# Conversion mapping 1: Price from Google (if available - usually for restaurants/bars)
PRICE_LEVEL_MAPPING = {
    "PRICE_LEVEL_FREE": 0.0,
    "PRICE_LEVEL_INEXPENSIVE": 50.0,
    "PRICE_LEVEL_MODERATE": 120.0,
    "PRICE_LEVEL_EXPENSIVE": 300.0,
    "PRICE_LEVEL_VERY_EXPENSIVE": 600.0
}

# Conversion mapping 2: Smart fallback by attraction type if Google does not provide a price
CATEGORY_PRICE_FALLBACK = {
    "amusement_park": 250.0,
    "aquarium": 100.0,
    "zoo": 80.0,
    "museum": 60.0,
    "art_gallery": 60.0,
    "tourist_attraction": 40.0,
    "stadium": 150.0,
    "spa": 200.0,
    # Places that are typically free:
    "park": 0.0,
    "natural_feature": 0.0,
    "church": 0.0,
    "place_of_worship": 0.0
}

def fetch_attractions_from_google(city_name: str, category_name: str):
    search_query = f"{category_name} in {city_name}"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.location,places.types,places.priceLevel"
    }
    
    body = {
        "textQuery": search_query,
        "languageCode": "en" 
    }
    
    try:
        response = requests.post(GOOGLE_PLACES_URL, json=body, headers=headers)
        
        if response.status_code == 200:
            results = response.json().get("places", [])
            
            formatted_attractions = []
            for place in results:
                location = place.get("location", {})
                lat = location.get("latitude")
                lng = location.get("longitude")
                types = place.get("types", [])
                
                # Smart pricing logic
                raw_price_level = place.get("priceLevel")
                if raw_price_level:
                    # If Google provided a price, use it
                    estimated_price = PRICE_LEVEL_MAPPING.get(raw_price_level, 0.0)
                else:
                    # If no price from Google, look up in our fallback dictionary by attraction type
                    estimated_price = 0.0
                    for t in types:
                        if t in CATEGORY_PRICE_FALLBACK:
                            estimated_price = CATEGORY_PRICE_FALLBACK[t]
                            break # Once a match is found, stop the loop
                
                formatted_attractions.append({
                    "google_place_id": place.get("id"),
                    "name": place.get("displayName", {}).get("text"),
                    "address": place.get("formattedAddress"),
                    "categories": types,
                    "rating": place.get("rating", 0.0),
                    "latitude": lat,  
                    "longitude": lng,
                    "default_price": estimated_price
                })
            return formatted_attractions
        else:
            print(f"Google returned an error: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"Connection to Google failed: {e}")
        return []

if __name__ == "__main__":
    print("Running test query against Google...")
    test_results = fetch_attractions_from_google("Paris", "Museums")
    for attr in test_results[:3]:
        print(f"Name: {attr['name']} | Price: {attr['default_price']} ₪")