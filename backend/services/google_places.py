import os
import requests
from dotenv import load_dotenv

# טעינת משתני הסביבה מקובץ ה-.env
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"

def fetch_attractions_from_google(city_name: str, category_name: str):
    """
    פונקציה הפונה ל-Google Places API ומחזירה אטרקציות לפי עיר וקטגוריה, כולל מיקום גיאוגרפי
    """
    search_query = f"{category_name} in {city_name}"
    
    # הגדרת הכותרות - הוספנו את places.location ל-FieldMask
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        # places.location דואג שגוגל יחזיר לנו את ה-latitude וה-longitude
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.location"
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
                
                formatted_attractions.append({
                    "google_place_id": place.get("id"),
                    "name": place.get("displayName", {}).get("text"),
                    "address": place.get("formattedAddress"),
                    "rating": place.get("rating", 0.0),
                    "latitude": lat,   # <-- הנתון החדש שנשלח לפרונט
                    "longitude": lng   # <-- הנתון החדש שנשלח לפרונט
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