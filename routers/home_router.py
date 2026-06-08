
from fastapi import APIRouter ,HTTPException
from models import User
from core import security 
router = APIRouter()



@app.get("/")
def home():
    return {"message": "welcome to tomer's stock portfolio "}