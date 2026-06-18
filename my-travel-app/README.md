# Triper 🌍
**Personalized Trip Planner & Dynamic Itinerary Builder**

Triper is a smart, full-stack web application designed to simplify and elevate the travel planning experience. It allows users to explore worldwide destinations, receive personalized attraction recommendations based on their travel history, and build detailed, conflict-free daily itineraries effortlessly.

---

## 🛠 Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB">
  <img src="https://img.shields.io/badge/FastAPI-05998B?style=for-the-badge&logo=fastapi&logoColor=white">
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white">
</p>

---

## 🚀 Key Features

* 🌍 **Global Exploration:** Search for attractions, landmarks, and points of interest in any city or country worldwide.
* ✨ **Smart Recommendations Engine:** Provides highly personalized "Just For You" attraction suggestions by analyzing the user's past trips and category preferences.
* 🔍 **Advanced Filtering:** Streamline search results based on specific budgets and categories.
* 📅 **Dynamic Itinerary Builder:** An interactive, visual weekly planner that allows users to schedule attractions with a built-in real-time overlap prevention system.
* 👤 **Personal Dashboard:** A dedicated space to manage upcoming itineraries and track travel history.

---

## 📸 Preview

> **Note to self:** > [Insert a GIF or a high-quality screenshot here showcasing the Side-by-Side view of the Recommendations Gold Panel and the Attractions List, or the Weekly Planner grid.]
> `![Triper Planner Preview](./images/preview.png)`

---

## ⚙️ Getting Started

### Prerequisites
* Python 3.9+
* Node.js (v16+)
* PostgreSQL

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/tomer chaimi/trip-planner.git](https://github.com/your-username/trip-planner.git)
   cd trip-planner

   cd backend
# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate # On Windows use `venv\Scripts\activate`

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload

cd ../frontend
# Install dependencies
npm install

# Start the development server
npm start

💡 Lessons Learned
The most significant technical challenge in this project was developing a seamless, collision-free scheduling mechanism for the Itinerary Builder. I engineered a robust logic that validates time slots in real-time, preventing overlapping attractions. This required optimizing React's state management to keep the UI perfectly synchronized with the underlying database, ensuring a flawless and intuitive user experience.

👨‍💻 About The Project
This project was built to solve a real-world problem while showcasing modern Full-Stack development practices, focusing heavily on clean architecture, responsive UX/UI, and efficient data handling between a React client and a Python backend.

Built with ❤️ by Tomer Chaimi and Tomer shorani