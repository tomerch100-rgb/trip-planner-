from fastapi import APIRouter ,HTTPException
from models import User
from core import security 
router = APIRouter()

@router.post("/register")
def register_user(user: User.UserCreate ):
        return register_user(User.username, User.password, User.email)

@router.post("/login")
def login_user(user:User.userlogin):
        user_id =  .login_user(user.username, user.password)

        if user_id is None :
            raise HTTPException (status_code=401, detail="wrong details")   
        access_token =  security.creat_token(user_id)
        return {
        "access_token": access_token,
        "token_type": "bearer"
    }