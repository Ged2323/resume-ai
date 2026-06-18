from fastapi import APIRouter, UploadFile, File, HTTPException
from pypdf import PdfReader
import io

router = APIRouter()


@router.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    contents = await file.read()
    reader = PdfReader(io.BytesIO(contents))

    pages_text = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages_text.append(text)

    if not pages_text:
        raise HTTPException(
            status_code=422,
            detail="PDF appears to be scanned — please paste your resume as text.",
        )

    return {"text": "\n".join(pages_text)}
