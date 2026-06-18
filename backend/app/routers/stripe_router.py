import os
import stripe
from fastapi import APIRouter, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from app.auth import require_user
from app.db import get_db
from app.models import Subscription
from datetime import datetime, timezone

router = APIRouter()

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRICE_ID = os.environ.get("STRIPE_PRICE_ID", "")  # $9/mo price ID
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")


@router.post("/create-checkout-session")
async def create_checkout_session(
    user: dict = Depends(require_user),
    db: Session = Depends(get_db),
):
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Stripe not configured.")
    session = stripe.checkout.Session.create(
        mode="subscription",
        payment_method_types=["card"],
        line_items=[{"price": STRIPE_PRICE_ID, "quantity": 1}],
        success_url=f"{FRONTEND_URL}?upgrade=success",
        cancel_url=f"{FRONTEND_URL}?upgrade=cancel",
        metadata={"user_id": user["id"]},
        customer_email=user["email"],
    )
    return {"url": session.url}


@router.post("/stripe-webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature.")

    if event["type"] in ("customer.subscription.created", "customer.subscription.updated"):
        sub_obj = event["data"]["object"]
        user_id = sub_obj.get("metadata", {}).get("user_id") or \
                  _user_id_from_customer(sub_obj["customer"], db)
        if user_id:
            _upsert_subscription(db, user_id, sub_obj["customer"], sub_obj["id"], sub_obj["status"])

    elif event["type"] == "customer.subscription.deleted":
        sub_obj = event["data"]["object"]
        sub = db.query(Subscription).filter_by(stripe_subscription_id=sub_obj["id"]).first()
        if sub:
            sub.status = "inactive"
            sub.updated_at = datetime.now(timezone.utc)
            db.commit()

    elif event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("metadata", {}).get("user_id")
        customer_id = session.get("customer")
        subscription_id = session.get("subscription")
        if user_id and customer_id:
            _upsert_subscription(db, user_id, customer_id, subscription_id, "active")

    return {"ok": True}


def _upsert_subscription(db, user_id, customer_id, sub_id, status):
    sub = db.query(Subscription).filter_by(user_id=user_id).first()
    if sub:
        sub.stripe_customer_id = customer_id
        sub.stripe_subscription_id = sub_id
        sub.status = "active" if status == "active" else "inactive"
        sub.updated_at = datetime.now(timezone.utc)
    else:
        sub = Subscription(
            user_id=user_id,
            stripe_customer_id=customer_id,
            stripe_subscription_id=sub_id,
            status="active" if status == "active" else "inactive",
        )
        db.add(sub)
    db.commit()


def _user_id_from_customer(customer_id: str, db: Session) -> str | None:
    sub = db.query(Subscription).filter_by(stripe_customer_id=customer_id).first()
    return sub.user_id if sub else None
