
from pydantic import BaseModel, Field

# Model for receiving user data - Frontend during registration or login
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, description="Username must contain at least 3 characters")
    password: str = Field(..., min_length=6, description="Password must contain at least 6 characters")
