import os
import requests
from dotenv import load_dotenv

# טעינת משתני הסביבה מקובץ ה-.env
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY")
GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchText"
def fetch_attractions_from_google(city_name: str, category_name: str):
    """
    פונקציה הפונה ל-Google Places API ומחזירה אטרקציות לפי עיר וקטגוריה
    """
    # יצירת שאילתת החיפוש (למשל: "Museums in Paris")
    search_query = f"{category_name} in {city_name}"
    
    # הגדרת הכותרות (Headers) שגוגל דורשת
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        # FieldMask קובע אילו שדות בדיוק אנחנו רוצים לקבל חזרה (כדי לחסוך ברוחב פס ועלויות)
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating"
    }
    
    # גוף הבקשה בפורמט JSON
    body = {
        "textQuery": search_query,
        "languageCode": "en" # נבקש באנגלית כדי שהשמות יהיו גלובליים, אפשר גם 'he' לעברית
    }
    
    try:
        # ביצוע בקשת POST לשרתים של גוגל
        response = requests.post(GOOGLE_PLACES_URL, json=body, headers=headers)
        
        if response.status_code == 200:
            results = response.json().get("places", [])
            
            # עיבוד התוצאות לפורמט נוח עבורנו
            formatted_attractions = []
            for place in results:
                formatted_attractions.append({
                    "google_place_id": place.get("id"),
                    "name": place.get("displayName", {}).get("text"),
                    "address": place.get("formattedAddress"),
                    "rating": place.get("rating", 0.0)
                })
            return formatted_attractions
        else:
            print(f"גוגל החזירה שגיאה: {response.status_code} - {response.text}")
            return []
            
    except Exception as e:
        print(f"החיבור לגוגל נכשל: {e}")
        return []

# קוד לבדיקה מהירה של הקובץ (ירוץ רק אם נפעיל את הקובץ הזה ישירות)
if __name__ == "__main__":
    print("מריץ בדיקה מול גוגל...")
    test_results = fetch_attractions_from_google("Paris", "Museums")
    for attr in test_results[:3]: # נדפיס רק את 3 האטרקציות הראשונות שחזרו
        print(attr)