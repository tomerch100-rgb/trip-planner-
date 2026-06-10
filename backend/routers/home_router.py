
from fastapi import APIRouter ,HTTPException
from backend.classes.models import User
from backend.core import security 
router = APIRouter()

@router.get("/")
def home():
    return {"message": "welcome to tomer&tomer trip_planners"}
