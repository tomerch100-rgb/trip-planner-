from pydantic import BaseModel, Field,EmailStr

# מודל לקבלת נתוני משתמש מה-Frontend בזמן הרשמה או התחברות
class UserCreate(BaseModel):
    username: str = Field(..., min_length=2, description="שם המשתמש חייב להכיל לפחות 2 תווים")
    password: str = Field(..., min_length=6, description="הסיסמה חייבת להכיל לפחות 6 תווים")
    email : EmailStr

class userlogin (BaseModel):
    username: str = Field(..., min_length=2, description="שם המשתמש חייב להכיל לפחות 2 תווים")
    password: str = Field(..., min_length=6, description="הסיסמה חייבת להכיל לפחות 6 תווים")
    

from pydantic import BaseModel, Field
# Model for receiving user data - Frontend during registration or login
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, description="Username must contain at least 3 characters")
    password: str = Field(..., min_length=6, description="Password must contain at least 6 characters")

