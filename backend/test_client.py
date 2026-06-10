import requests

# הכתובת הדיפולטיבית שבה FastAPI רץ מקומית
BASE_URL = "http://127.0.0.1:8000"

def test_register():
    print("\n=== בדיקת ראוטר הרשמה (Register) ===")
    url = f"{BASE_URL}/auth/register"
    
    # הנתונים נשלחים בדיוק לפי ה-UserCreate Pydantic schema של השותף
    payload = {
        "username": "tomer_test4",
        "email": "tomer4@example.com",
        "password": "securepassword123"  # לפחות 6 תווים כמו שהגדרתם
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code (קוד תגובה): {response.status_code}")
        print(f"Response Body (תוכן התשובה): {response.json()}")
    except Exception as e:
        print(f"שגיאה בהתחברות לשרת: {e}")

def test_login():
    print("\n=== בדיקת ראוטר התחברות (Login) ===")
    url = f"{BASE_URL}/auth/login"
    
    # נתונים המבוססים על ה-userlogin schema שלכם (רק שם משתמש וסיסמה)
    payload = {
        "username": "tomer_test4",
        "password": "securepassword123"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code (קוד תגובה): {response.status_code}")
        print(f"Response Body (תוכן התשובה): {response.json()}")
        
        # אם ההתחברות הצליחה, נשלוף את הטוקן שאתה מייצר בראוטר
        if response.status_code == 200:
            token_data = response.json()
            print(f"\nהטוקן (JWT) שנוצר בהצלחה: {token_data.get('access_token')}")
    except Exception as e:
        print(f"שגיאה בהתחברות לשרת: {e}")

if __name__ == "__main__":
    print("מתחיל הרצת בדיקות מול שרת ה-FastAPI...")
    test_register()
    test_login()