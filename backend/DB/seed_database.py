import logging
import requests
from backend.DB.db import SessionLocal
from backend.classes.models import Country, City

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
countriesnow_API_URL = "https://countriesnow.space/api/v0.1/countries"

def fetch_geography_data():
    logging.info("שואב נתונים מה-API החיצוני...")
    try:
        response = requests.get(countriesnow_API_URL)
        if response.status_code == 200:
            return response.json()["data"]
        return None
    except Exception as e:
        return None

def seed_database():
    raw_data = fetch_geography_data()
    if not raw_data:
        return

    db = SessionLocal()
    try:
        # לוקחים 5 מדינות רק כדי למלא נתונים ראשוניים לבדיקה
        for item in raw_data[:5]:
            country_name = item["country"]
            country_code = item.get("iso2", "XX")

            existing_country = db.query(Country).filter(Country.name == country_name).first()
            if not existing_country:
                new_country = Country(name=country_name, country_code=country_code)
                db.add(new_country)
                db.flush()
                country_id = new_country.id
            else:
                country_id = existing_country.id

            cities_to_add = []
            for city_name in item["cities"]:
                existing_city = db.query(City).filter(City.country_id == country_id, City.name == city_name).first()
                if not existing_city:
                    cities_to_add.append(City(name=city_name, country_id=country_id))

            if cities_to_add:
                db.bulk_save_objects(cities_to_add)

        db.commit()
        logging.info("ההזרקה מה-API לדאטה-בייס הסתיימה בהצלחה!")
    except Exception as e:
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()