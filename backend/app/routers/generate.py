from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy import text
from app.nim_client import generate_application_materials
from app.auth import get_current_user
from app.db import get_db
from app.models import UsageRecord, Subscription

router = APIRouter()

FREE_LIMIT = 3  # generates per month for unauthenticated / non-paying users


class ApplicationRequest(BaseModel):
    job_description: str
    resume: str


class ApplicationResponse(BaseModel):
    cover_letter: str
    gap_analysis: str
    uses_this_month: int
    limit: int
    is_subscribed: bool


def _period() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def _get_usage(db: Session, user_id: str) -> int:
    rec = db.query(UsageRecord).filter_by(user_id=user_id, period=_period()).first()
    return rec.count if rec else 0


def _increment_usage(db: Session, user_id: str) -> int:
    period = _period()
    rec = db.query(UsageRecord).filter_by(user_id=user_id, period=period).first()
    if rec:
        rec.count += 1
    else:
        rec = UsageRecord(user_id=user_id, period=period, count=1)
        db.add(rec)
    db.commit()
    return rec.count


def _is_subscribed(db: Session, user_id: str) -> bool:
    sub = db.query(Subscription).filter_by(user_id=user_id).first()
    return sub is not None and sub.status == "active"


@router.post("/generate", response_model=ApplicationResponse)
async def generate(
    request: ApplicationRequest,
    user: dict | None = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not request.job_description.strip() or not request.resume.strip():
        raise HTTPException(status_code=400, detail="Both fields required.")

    # Anonymous users tracked by a fixed sentinel — no per-IP tracking for simplicity
    user_id = user["id"] if user else "anonymous"
    subscribed = _is_subscribed(db, user_id) if user else False

    if not subscribed:
        uses = _get_usage(db, user_id)
        if uses >= FREE_LIMIT:
            raise HTTPException(
                status_code=429,
                detail=f"Free limit of {FREE_LIMIT} uses/month reached. Upgrade to continue.",
            )

    result = await generate_application_materials(request.job_description, request.resume)
    uses_after = _increment_usage(db, user_id)

    return ApplicationResponse(
        cover_letter=result["cover_letter"],
        gap_analysis=result["gap_analysis"],
        uses_this_month=uses_after,
        limit=FREE_LIMIT,
        is_subscribed=subscribed,
    )
