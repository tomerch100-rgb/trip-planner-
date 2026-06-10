from backend.routers import auth_router,trip_router,home_router,attractions_router, intinerary_router,geography_router
from fastapi import FastAPI
app = FastAPI()


app.include_router(home_router.router ) 
app.include_router(auth_router.router , prefix= "/auth") 
app.include_router(trip_router.router , prefix= "/trip")
app.include_router(attractions_router.router,prefix="/attractions") 
app.include_router(intinerary_router.router,prefix="/intinerary") 
app.include_router(geography_router.router)