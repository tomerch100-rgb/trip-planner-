import os
import requests
from dotenv import load_dotenv

# טעינת משתני הסביבה מקובץ ה-.env
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

# מילון המרה חכם: מרמת המחיר של גוגל למחיר משוער במספרים (בשקלים)
# כך זה יעבוד מעולה עם סליידר המחירים ב-React
PRICE_LEVEL_MAPPING = {
    "PRICE_LEVEL_FREE": 0.0,
    "PRICE_LEVEL_INEXPENSIVE": 50.0,
    "PRICE_LEVEL_MODERATE": 150.0,
    "PRICE_LEVEL_EXPENSIVE": 300.0,
    "PRICE_LEVEL_VERY_EXPENSIVE": 600.0
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
                # חילוץ קואורדינטות מתוך האובייקט של גוגל
                location = place.get("location", {})
                lat = location.get("latitude")
                lng = location.get("longitude")
                
                # 🌟 חילוץ רמת המחיר והמרתה למספר. אם גוגל לא מחזיר מידע, נניח שזה חינם (0.0)
                raw_price_level = place.get("priceLevel")
                estimated_price = PRICE_LEVEL_MAPPING.get(raw_price_level, 0.0)
                
                formatted_attractions.append({
                    "google_place_id": place.get("id"),
                    "name": place.get("displayName", {}).get("text"),
                    "address": place.get("formattedAddress"),
                    "categories": place.get("types", []),
                    "rating": place.get("rating", 0.0),
                    "latitude": lat,  
                    "longitude": lng,
                    "default_price": estimated_price  # 🌟 הצמדנו את המחיר החדש לאטרקציה!
                })
            return formatted_attractions
        else:
            print(f"גוגל החזירה שגיאה: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"החיבור לגוגל נכשל: {e}")
        return []

if __name__ == "__main__":
    print("מריץ בדיקה מול גוגל...")
    test_results = fetch_attractions_from_google("Paris", "Museums")
    for attr in test_results[:3]:
        print(attr)