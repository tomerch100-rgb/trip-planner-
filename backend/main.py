from backend.routers import auth_router,trip_router,home_router,attractions_router, intinerary_router,geography_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://10.0.0.3:3000", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)
app.include_router(home_router.router , prefix= "/home" ) 
app.include_router(auth_router.router , prefix= "/auth") 
app.include_router(trip_router.router , prefix= "/trips")
app.include_router(attractions_router.router,prefix="/attractions") 
app.include_router(intinerary_router.router,prefix="/itinerary") 
app.include_router(geography_router.router , prefix="/geography")