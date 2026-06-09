import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_API_KEY"],
)

# Verify this ID in NIM catalog: https://build.nvidia.com/deepseek-ai/deepseek-v4-flash
MODEL = "deepseek-ai/deepseek-v4-flash"

SYSTEM_PROMPT = """You are an expert career coach and professional writer.

Given a job description and resume, produce two things:

1. A tailored cover letter — 3 paragraphs, professional tone, no placeholders, ready to send.
2. A gap analysis with three sections:
   - Matching Skills: what aligns between resume and job
   - Missing Skills: what the job requires that the resume lacks
   - Recommendations: 3 specific, actionable steps to address the gaps

Format your response EXACTLY like this (include the headers):

COVER_LETTER:
[cover letter here]

GAP_ANALYSIS:
[gap analysis here]"""


async def generate_application_materials(job_description: str, resume: str) -> dict:
    user_message = f"JOB DESCRIPTION:\n{job_description}\n\nRESUME:\n{resume}"

    response = await client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.7,
        max_tokens=2000,
    )

    content = response.choices[0].message.content or ""

    if "COVER_LETTER:" in content and "GAP_ANALYSIS:" in content:
        gap_split = content.split("GAP_ANALYSIS:")
        cover_letter = gap_split[0].replace("COVER_LETTER:", "").strip()
        gap_analysis = gap_split[1].strip()
    else:
        cover_letter = content.strip()
        gap_analysis = "Could not parse gap analysis. Try again."

    return {"cover_letter": cover_letter, "gap_analysis": gap_analysis}
