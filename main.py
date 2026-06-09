from routers import auth_router
from fastapi import FastAPI
app = FastAPI()

app.include_router(auth_router.router , prefix= "/auth") 
