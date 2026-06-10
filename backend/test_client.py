import requests
import random

# כתובת השרת הבסיסית שלך
BASE_URL = "http://127.0.0.1:8000"

# נייצר שם משתמש אקראי כדי שנוכל להריץ את הטסט שוב ושוב בלי שגיאות כפילות
rand_num = random.randint(1000, 9999)
TEST_USER = {
    "email": f"tomer{rand_num}@example.com",
    "username": f"Tomer{rand_num}",
    "password": "password123!"
}

def run_test():
    print(f"--- מתחיל טסט אוטומטי למערכת ---")
    
    # ==========================================
    # 1. הרשמה והתחברות (קבלת טוקן)
    # ==========================================
    print("\n1. רושם משתמש חדש...")
    res = requests.post(f"{BASE_URL}/auth/register", json=TEST_USER)
    print("תשובת הרשמה:", res.status_code, res.json())

    print("\n2. מתחבר למערכת (Login)...")
    res = requests.post(f"{BASE_URL}/auth/login", json={
        "username": TEST_USER["username"], 
        "password": TEST_USER["password"]
    })
    
    if res.status_code != 200:
        print("התחברות נכשלה!")
        return
        
    # שומרים את הטוקן שחזר!
    token = res.json().get("access_token")
    
    # מכאן והלאה, זה ה"מפתח" שלנו לכל הבקשות
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ התחברות בהצלחה! טוקן התקבל.")

    # ==========================================
    # 2. יצירת טיול חדש
    # ==========================================
    print("\n3. יוצר טיול חדש לפריז (נניח ש-city_id=1)...")
    trip_data = {
        "city_id": 1,
        "start_date": "2026-09-10",
        "end_date": "2026-09-15"
    }
    res = requests.post(f"{BASE_URL}/trip/new_trip", json=trip_data, headers=headers)
    
    if res.status_code != 201:
        print("שגיאה ביצירת טיול:", res.text)
        return
        
    trip_id = res.json()["id"]
    print(f"✅ טיול נוצר בהצלחה! מזהה טיול: {trip_id}")

    # ==========================================
    # 3. שמירת אטרקציה (כאילו חיפשנו בגוגל)
    # ==========================================
    print("\n4. שומר את מגדל אייפל כאטרקציה חדשה במערכת...")
    attraction_data = {
        "category_id": 1,
        "name": "Eiffel Tower",
        "address": "Champ de Mars, Paris",
        "default_price": 25.50,
        "latitude": 48.8584,
        "longitude": 2.2945
    }
    res = requests.post(f"{BASE_URL}/attractions/", json=attraction_data, headers=headers)
    attraction_id = res.json()["id"]
    print(f"✅ אטרקציה נשמרה בהצלחה! מזהה: {attraction_id}")

    # ==========================================
    # 4. בניית הלו"ז (Bulk)
    # ==========================================
    print("\n5. משבץ את האטרקציה בלוז של הטיול...")
    itinerary_data = {
        "items": [
            {
                "trip_id": trip_id,
                "attraction_id": attraction_id,
                "visit_date": "2026-09-11",
                "start_time": "09:00:00",
                "end_time": "12:00:00",
                "actual_price": 25.50
            }
        ]
    }
    res = requests.post(f"{BASE_URL}/itinerary/bulk", json=itinerary_data, headers=headers)
    print("✅ תשובת בניית לוז:", res.status_code, res.json())

    # ==========================================
    # 5. בדיקת תקציב ושליפת הלו"ז (Read)
    # ==========================================
    print("\n6. שולף את כל הלוז של הטיול...")
    res = requests.get(f"{BASE_URL}/itinerary/{trip_id}", headers=headers)
    print("✅ הלוז שלך:\n", res.json())

    print("\n7. מחשב תקציב כולל...")
    res = requests.get(f"{BASE_URL}/itinerary/{trip_id}/budget", headers=headers)
    print("✅ תקציב:\n", res.json())
    
    print("\n🎉 --- הטסט עבר בהצלחה! השרת עובד פיקס מקצה לקצה --- 🎉")

if __name__ == "__main__":
    run_test()