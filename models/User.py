
from pydantic import BaseModel, Field

# מודל לקבלת נתוני משתמש מה-Frontend בזמן הרשמה או התחברות
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, description="שם המשתמש חייב להכיל לפחות 3 תווים")
    password: str = Field(..., min_length=6, description="הסיסמה חייבת להכיל לפחות 6 תווים")
