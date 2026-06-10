import logging
import requests
from sqlalchemy.orm import Session

# Importing database connection and your specific models
from DB.db import SessionLocal
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
    Processes the first 5 countries to ensure a fast and safe initial run.
    """
    raw_data = fetch_geography_data()
    if not raw_data:
        logging.error("No data received from API. Seeding aborted.")
        return

    # Open a new database session
    db: Session = SessionLocal()
    
    try:
        logging.info("Starting database seeding process...")
        
        # Slicing the first 5 countries for initial testing and validation
        for item in raw_data[:5]:
            country_name = item["country"]
            country_code = item.get("iso2", "XX")
            cities_list = item["cities"]
            
            # Check if the country already exists to prevent duplicate entries
            existing_country = db.query(Country).filter(Country.name == country_name).first()
            
            if not existing_country:
                new_country = Country(name=country_name, country_code=country_code)
                db.add(new_country)
                db.flush()  # Flushes the session to generate the Country ID immediately
                country_id = new_country.id
                logging.info(f"Inserted country: {country_name}")
            else:
                country_id = existing_country.id
                logging.info(f"Country '{country_name}' already exists in database.")

            # Prepare list of cities to add for this country
            cities_to_add = []
            for city_name in cities_list:
                # Check for duplicate cities within the same country
                existing_city = db.query(City).filter(City.country_id == country_id, City.name == city_name).first()
                if not existing_city:
                    cities_to_add.append(City(name=city_name, country_id=country_id))
            
            # Efficiently bulk insert all new cities for performance optimization
            if cities_to_add:
                db.bulk_save_objects(cities_to_add)
                logging.info(f"Bulk inserted {len(cities_to_add)} cities for {country_name}")
        
        # Commit all changes to the PostgreSQL database
        db.commit()
        logging.info("Database seeding completed successfully!")
        
    except Exception as e:
        # Rollback the transaction in case of any database error
        db.rollback()
        logging.error(f"Error occurred during database seeding: {e}")
    finally:
        # Always close the database session when done
        db.close()

if __name__ == "__main__":
    seed_database()