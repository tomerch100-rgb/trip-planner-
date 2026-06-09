from routers import auth_router,trip_router,home_router
from fastapi import FastAPI
app = FastAPI()


app.include_router(home_router.router , prefix= "/") 
app.include_router(auth_router.router , prefix= "/auth") 
app.include_router(trip_router.router , prefix= "/trip") 


