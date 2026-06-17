import bcrypt
from fastapi import HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from fastapi import Depends
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv

load_dotenv()

# Instantiating the HTTPBearer security scheme to extract the Authorization header
safe = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def hash_password(password):
    """
    Hashes a plain-text password using bcrypt with a securely generated salt.
    Converts strings to bytes before hashing and decodes the result back to a string for DB storage.
    """
    bytes_password = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(bytes_password, salt)
    return hashed.decode()

def verify_password(stored_hash, check_password): 
    """
    Verifies a plain-text password against a stored bcrypt hash.
    Safely handles byte encoding required by the bcrypt library.
    """
    bytes_hash = stored_hash.encode('utf-8')
    bytes_password = check_password.encode('utf-8')
    return bcrypt.checkpw(bytes_password, bytes_hash)
      
def create_token(user_id):
    """
    Generates a secure, signed JWT access token for a given user ID.
    Enforces a strict 30-minute expiration window using UTC time.
    """
    expire_time = datetime.now(timezone.utc) + timedelta(minutes=30)       
    payload = {
        "sub": str(user_id),
        "exp": expire_time
    }
    token = jwt.encode(payload, SECRET_KEY, ALGORITHM)
    return token

def verify_token(token: str):
    """
    Decodes and validates an incoming JWT token against signature expiration and tampering.
    Raises standardized 401 Unauthorized exceptions upon validation failure.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload

    except jwt.ExpiredSignatureError:
        # Debug log for development environment verification
        print("DEBUG: Token has expired") 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        # Debug log for invalid signatures or malformed tokens
        print("DEBUG: Invalid token") 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except Exception as e:
        # Fallback catch for unexpected JWT errors to guarantee error uniformity
        print(f"DEBUG: Unknown JWT error: {e}") 
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Error"
        )
    
def get_current_user_id(box: HTTPAuthorizationCredentials = Depends(safe)):
    """
    FastAPI dependency that protects endpoints. Extracts the token from the 
    Authorization header, verifies it, and returns the authenticated User's ID.
    """
    token = box.credentials
    payload = verify_token(token)
    user_id = payload.get("sub")
    return int(user_id)