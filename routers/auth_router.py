from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from classes import schemas
import crud
from core import security
from DB.db import get_db

router = APIRouter( tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    
    if crud.get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if crud.get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=400, detail="Username already taken")
        
    # אם הכל פנוי - ניצור את המשתמש
    new_user = crud.create_user(db, user_data)
    return {"message": "User created successfully", "user_id": new_user.user_id}


@router.post("/login")
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    
    user = crud.authenticate_user(db, user_data)
    
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    access_token = security.create_token(user.user_id)
    return {"access_token": access_token, "token_type": "bearer"}