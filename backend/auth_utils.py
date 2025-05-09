# backend/auth_utils.py
import os
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer # Can be adapted for Bearer token
import firebase_admin
from firebase_admin import auth, credentials

# Initialize Firebase Admin SDK if not already initialized
# This might also be in your main.py or a services/firestore.py. Ensure it's initialized once.
# GOOGLE_APPLICATION_CREDENTIALS should be set in your environment.
if not firebase_admin._apps:
    try:
        cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not cred_path:
            raise ValueError("GOOGLE_APPLICATION_CREDENTIALS environment variable not set.")
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Error initializing Firebase Admin SDK in auth_utils: {e}")
        # Depending on your setup, you might want to raise the error or handle it

# This scheme can be used to extract the token from the Authorization header
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token") # tokenUrl is not used here
# For pure Bearer token (non-OAuth2 flow), we can directly access header

# Use Header(...) for explicit header extraction and optional handling
async def get_current_user(authorization: str | None = Header(default=None)):
    if authorization is None: # Explicitly check for None
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated: No Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    parts = authorization.split()
    if parts[0].lower() != "bearer" or len(parts) == 1 or len(parts) > 2:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials: Malformed Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = parts[1]

    try:
        # Verify the ID token while checking if the token is revoked.
        decoded_token = auth.verify_id_token(token, check_revoked=True)
        return decoded_token 
    except firebase_admin.auth.RevokedIdTokenError:
        # Token has been revoked, user needs to reauthenticate.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token revoked, please re-authenticate.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except firebase_admin.auth.InvalidIdTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not process token: {e}",
            headers={"WWW-Authenticate": "Bearer"}, 
        )

# You can also create a dependency that just returns the UID if that's all you need
async def get_current_user_uid(current_user_token: dict = Depends(get_current_user)) -> str:
    return current_user_token["uid"] 