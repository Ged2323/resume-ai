from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import generate, feedback
from app.db import engine
from app.models import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resume AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api")
app.include_router(feedback.router, prefix="/api")
