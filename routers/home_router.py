
from fastapi import APIRouter ,HTTPException
from classes.models import User
from core import security 
router = APIRouter()

@router.get("/")
def home():
    return {"message": "welcome to tomer&tomer trip_planners"}
