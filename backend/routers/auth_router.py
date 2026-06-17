from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.classes import schemas
import backend.classes.crud as crud
from backend.core import security
from backend.DB.db import get_db

# Router configuration specifically isolated for Identity and Access Management (IAM)
router = APIRouter(tags=["Authentication"])

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Handles new user registration. 
    Enforces strict uniqueness validation for both email and username 
    before persisting the new account to the database.
    """
    
    # Pre-flight validation: Check for email collisions
    if crud.get_user_by_email(db, user_data.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    
    # Pre-flight validation: Check for username collisions
    if crud.get_user_by_username(db, user_data.username):
        raise HTTPException(status_code=409, detail="Username already taken")
        
    # Validations passed: Proceed with persisting the new user record
    new_user = crud.create_user(db, user_data)
    
    return {"message": "User created successfully", "user_id": new_user.user_id}


@router.post("/login",response_model=schemas.UserLoginResponse)
def login(user_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user credentials against the database.
    Upon successful verification, provisions and returns a stateless JWT access token 
    for subsequent authorized requests.
    """
    
    # Attempt to authenticate the user using the provided credentials
    user = crud.authenticate_user(db, user_data)
    
    # Fail-fast pattern: Return a generic 401 message to prevent username enumeration attacks
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
        
    # Provision the secure JWT token for the session
    access_token = security.create_token(user.user_id)
    
    return {"access_token": access_token, "token_type": "bearer"}