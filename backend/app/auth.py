import os
from fastapi import Header, HTTPException
from jose import jwt, JWTError

SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")
ALGORITHM = "HS256"


def get_current_user(authorization: str = Header(default="")) -> dict | None:
    """Returns user dict {id, email} or None if unauthenticated."""
    if not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ").strip()
    if not SUPABASE_JWT_SECRET or not token:
        return None
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=[ALGORITHM],
                             options={"verify_aud": False})
        return {"id": payload["sub"], "email": payload.get("email", "")}
    except JWTError:
        return None


def require_user(authorization: str = Header(default="")) -> dict:
    user = get_current_user(authorization)
    if user is None:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    return user
