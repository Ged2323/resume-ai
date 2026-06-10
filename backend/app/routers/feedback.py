from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import Feedback

router = APIRouter()


class FeedbackIn(BaseModel):
    rating: str  # "up" or "down"
    message: str | None = None


@router.post("/feedback", status_code=201)
def submit_feedback(body: FeedbackIn, db: Session = Depends(get_db)):
    if body.rating not in ("up", "down"):
        raise HTTPException(status_code=422, detail="rating must be 'up' or 'down'")
    db.add(Feedback(rating=body.rating, message=body.message))
    db.commit()
    return {"ok": True}
