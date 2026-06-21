# 🌍 Triper - Smart Travel Planner

Welcome to **Triper**, an intelligent full-stack travel planning application designed to help users discover top attractions, build dynamic daily itineraries, and manage their trips seamlessly. 

With live fallback to the Google Places API and real-time currency localization, Triper offers a premium and accurate trip-planning experience.

![Triper Banner](https://via.placeholder.com/1000x300?text=Triper+-+Smart+Travel+Planner) *(Optional: Replace with a real screenshot of your app)*

## ✨ Key Features

* **🔍 Smart Destination Explorer:** Search for cities and fetch top attractions. If data is missing locally, the app acts as a smart proxy and fetches live data using the **Google Places API**.
* **📅 Interactive Itinerary Planner:** Build detailed, hourly schedules for your trips using a user-friendly trip builder interface.
* **💱 Dynamic Currency Localization:** Automatically extracts the destination's ISO country code and converts base prices (USD) to the **local currency** using real-time market exchange rates.
* **👤 Personal Dashboard:** Secure user authentication (JWT). Users can save their favorite attractions, manage upcoming trips, and view detailed trip summaries.
* **🎨 Modern UI:** A fully responsive, beautifully designed user interface built with React, Tailwind CSS, and Lucide React icons.

## 🛠 Tech Stack

**Frontend (Client-Side)**
* **Framework:** React.js
* **Styling:** Tailwind CSS
* **Mapping:** Leaflet.js
* **HTTP Client:** Axios (with automated JWT interceptors)
* **Utilities:** `iso-country-currency` (for localized formatting)

**Backend (Server-Side)**
* **Framework:** Python / FastAPI
* **Database:** PostgreSQL / SQLite via SQLAlchemy (ORM)
* **Authentication:** JWT (JSON Web Tokens)
* **External APIs:** Google Places API, Open Exchange Rates API

---

## 🚀 Getting Started (Local Development)

Follow these steps to run the project locally on your machine.

### Prerequisites
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Python](https://www.python.org/) (v3.8 or higher)
* A valid Google Maps/Places API Key

### 1. Backend Setup (FastAPI)

Navigate to the backend directory and set up your virtual environment:

```bash
cd backend
python -m venv venv

# Activate the virtual environment:
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies:
pip install -r requirements.txt
Create a .env file in the backend folder and add your environment variables:
GOOGLE_API_KEY=your_google_api_key_here
SECRET_KEY=your_jwt_secret_string
. Frontend Setup (React)
Open a new terminal window, navigate to the frontend directory:

Bash
# Navigate to the frontend folder
cd my-travel-app 

# Install Node modules
npm install

# Start the development server
npm start

