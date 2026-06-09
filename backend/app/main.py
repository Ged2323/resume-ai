from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import generate

app = FastAPI(title="Resume AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router, prefix="/api")
