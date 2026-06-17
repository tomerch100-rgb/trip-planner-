import logging
import requests
from sqlalchemy.orm import Session

# Importing database connection and your specific models
from backend.DB.db import SessionLocal
from backend.classes.models import Country, City

# Configure logging to monitor progress in the terminal
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# External free API to fetch world countries and their respective cities
API_URL = "https://countriesnow.space/api/v0.1/countries"

def fetch_geography_data():
    """
    Fetches country and city data from the external API.
    Returns a list of dictionaries containing countries and their cities, or None if failed.
    """
    logging.info("Fetching data from the global geography API...")
    try:
        response = requests.get(API_URL)
        if response.status_code == 200:
            return response.json()["data"]
        else:
            logging.error(f"Failed to fetch data from API. Status code: {response.status_code}")
            return None
    except Exception as e:
        logging.error(f"Connection error while calling external API: {e}")
        return None

def seed_database():
    """
    Main function to populate the database with countries and cities.
    Processes ALL countries from the API efficiently.
    """
    raw_data = fetch_geography_data()
    if not raw_data:
        logging.error("No data received from API. Seeding aborted.")
        return

    # Open a new database session
    db: Session = SessionLocal()
    
    try:
        logging.info("Starting database seeding process for ALL countries...")
        
        # שלפנו מראש את המדינות והערים שכבר קיימות כדי לא לעשות שאילתות בלולאה (חוסך המון זמן רשת מול Neon)
        existing_countries_dict = {c.name: c.id for c in db.query(Country).all()}
        
        # לולאה על כל המדינות בעולם (הסרנו את ה- :5)
        for item in raw_data:
            country_name = item["country"]
            country_code = item.get("iso2", "XX")
            cities_list = item["cities"]
            
            # בדיקה מהירה מהזיכרון המקומי במקום שאילתה למסד הנתונים
            if country_name not in existing_countries_dict:
                new_country = Country(name=country_name, country_code=country_code)
                db.add(new_country)
                db.flush()  # מייצר ID מיידי
                country_id = new_country.id
                existing_countries_dict[country_name] = country_id
                logging.info(f"Inserted country: {country_name}")
            else:
                country_id = existing_countries_dict[country_name]

            # שליפת הערים שכבר קיימות במאגר למדינה הזו (למניעת כפילויות בריצה חוזרת)
            existing_cities = set(res[0] for res in db.query(City.name).filter(City.country_id == country_id).all())

            # הכנת רשימת הערים החדשות
            cities_to_add = []
            for city_name in cities_list:
                if city_name and city_name not in existing_cities:
                    cities_to_add.append(City(name=city_name, country_id=country_id))
                    existing_cities.add(city_name) # מונע כפילויות בתוך אותו המערך החיצוני
            
            # bulk insert מהיר לכל עיר ועיר
            if cities_to_add:
                db.bulk_save_objects(cities_to_add)
                logging.info(f"Bulk inserted {len(cities_to_add)} cities for {country_name}")
        
        # שמירת כל השינויים בצורה סופית
        db.commit()
        logging.info("Database seeding completed successfully for the entire world!")
        
    except Exception as e:
        db.rollback()
        logging.error(f"Error occurred during database seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()