from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.nim_client import generate_application_materials

router = APIRouter()


class ApplicationRequest(BaseModel):
    job_description: str
    resume: str


class ApplicationResponse(BaseModel):
    cover_letter: str
    gap_analysis: str


@router.post("/generate", response_model=ApplicationResponse)
async def generate(request: ApplicationRequest):
    if not request.job_description.strip() or not request.resume.strip():
        raise HTTPException(status_code=400, detail="Both job description and resume are required.")
    return await generate_application_materials(request.job_description, request.resume)
