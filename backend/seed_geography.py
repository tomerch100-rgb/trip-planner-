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
    Its purpose is to fetch country and city data from the external API.
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
        
        # Pre-fetched existing countries and cities to avoid looping queries (saves substantial network time vs Neon)
        existing_countries_dict = {c.name: c.id for c in db.query(Country).all()}
        
        # Loop through all countries in the world (removed the :5 slice)
        for item in raw_data:
            country_name = item["country"]
            country_code = item.get("iso2", "XX")
            cities_list = item["cities"]
            
            # Fast check from local memory instead of querying the database
            if country_name not in existing_countries_dict:
                new_country = Country(name=country_name, country_code=country_code)
                db.add(new_country)
                db.flush()  # Generates immediate ID
                country_id = new_country.id
                existing_countries_dict[country_name] = country_id
                logging.info(f"Inserted country: {country_name}")
            else:
                country_id = existing_countries_dict[country_name]

            # Fetching cities that already exist in the database for this country (to prevent duplicates on re-runs)
            existing_cities = set(res[0] for res in db.query(City.name).filter(City.country_id == country_id).all())

            # Preparing the list of new cities
            cities_to_add = []
            for city_name in cities_list:
                if city_name and city_name not in existing_cities:
                    cities_to_add.append(City(name=city_name, country_id=country_id))
                    existing_cities.add(city_name) # Prevents duplicates within the same external array
            
            # Fast bulk insert for every single city
            if cities_to_add:
                db.bulk_save_objects(cities_to_add)
                logging.info(f"Bulk inserted {len(cities_to_add)} cities for {country_name}")
        
        # Saving all modifications finally
        db.commit()
        logging.info("Database seeding completed successfully for the entire world!")
        
    except Exception as e:
        db.rollback()
        logging.error(f"Error occurred during database seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()