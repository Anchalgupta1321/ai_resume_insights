import os
import uuid
import json
import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse

from backend.app.config import settings
from backend.app.models.schemas import (
    AnalysisBatchResponse,
    DriveSyncRequest,
    HealthResponse,
    InterviewKitRequest,
    InterviewKitResponse,
    CopilotChatRequest,
    CopilotChatResponse,
    OutreachEmailRequest,
    OutreachEmailResponse,
    MultiRoleRematchRequest,
    MultiRoleRematchResponse
)
from backend.app.services.analyzer import ResumeAnalyzerService
from backend.app.services.drive_service import GoogleDriveService
from backend.app.services.excel_generator import ExcelReportGenerator

router = APIRouter()
logger = logging.getLogger("routes")

@router.get("/health", response_model=HealthResponse)
async def health_check():
    key_available = bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY)
    return HealthResponse(
        status="healthy",
        project=settings.PROJECT_NAME,
        version=settings.VERSION,
        gemini_key_configured=key_available
    )

@router.post("/config/validate-key")
async def validate_key(
    api_key: str = Form(...),
    provider: Optional[str] = Form("groq")
):
    try:
        service = ResumeAnalyzerService(api_key=api_key, provider=provider)
        test_res = service.analyze_resume_text(
            text="Jane Doe, BS Computer Science Stanford University, Python developer, built REST APIs.",
            target_role="Software Engineer"
        )
        return {"valid": True, "message": f"{provider.capitalize()} API key is active and verified successfully!"}
    except Exception as e:
        return {"valid": False, "message": f"Validation failed: {str(e)}"}

@router.post("/analyze/upload", response_model=AnalysisBatchResponse)
async def analyze_uploaded_files(
    files: List[UploadFile] = File(...),
    api_key: Optional[str] = Form(None),
    provider: Optional[str] = Form(None),
    model_name: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
    scoring_criteria: Optional[str] = Form(None)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided for upload.")

    key_to_use = api_key or settings.GROQ_API_KEY or settings.GEMINI_API_KEY
    if not key_to_use:
        raise HTTPException(
            status_code=400, 
            detail="AI API key missing. Please set GROQ_API_KEY in .env or configure in Settings."
        )

    provider_to_use = provider or ("groq" if key_to_use.startswith("gsk_") else settings.DEFAULT_AI_PROVIDER)

    # Parse scoring criteria
    parsed_criteria = []
    if scoring_criteria and scoring_criteria.strip():
        try:
            parsed_criteria = json.loads(scoring_criteria)
        except Exception:
            parsed_criteria = [c.strip() for c in scoring_criteria.split(",") if c.strip()]

    batch_id = str(uuid.uuid4())[:8]
    batch_dir = os.path.join(settings.TEMP_UPLOAD_DIR, batch_id)
    os.makedirs(batch_dir, exist_ok=True)

    saved_pdf_paths = []
    for f in files:
        if not f.filename.lower().endswith(".pdf"):
            continue
        dest_path = os.path.join(batch_dir, f.filename)
        content = await f.read()
        with open(dest_path, "wb") as out_f:
            out_f.write(content)
        saved_pdf_paths.append(dest_path)

    if not saved_pdf_paths:
        raise HTTPException(status_code=400, detail="No valid .pdf files were uploaded.")

    try:
        analyzer = ResumeAnalyzerService(
            api_key=key_to_use, 
            provider=provider_to_use, 
            model_name=model_name
        )
        batch_result = analyzer.process_batch(
            pdf_paths=saved_pdf_paths,
            target_role=target_role,
            job_description=job_description,
            scoring_criteria=parsed_criteria
        )
        return AnalysisBatchResponse(**batch_result)
    except Exception as e:
        logger.error(f"Error during batch upload analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.post("/analyze/drive", response_model=AnalysisBatchResponse)
async def analyze_google_drive(request: DriveSyncRequest):
    key_to_use = request.api_key or settings.GROQ_API_KEY or settings.GEMINI_API_KEY
    if not key_to_use:
        raise HTTPException(
            status_code=400, 
            detail="AI API key missing. Please set GROQ_API_KEY in .env or configure in Settings."
        )

    if not request.folder_id:
        raise HTTPException(status_code=400, detail="Google Drive folder_id is required.")

    batch_id = str(uuid.uuid4())[:8]
    batch_dir = os.path.join(settings.TEMP_UPLOAD_DIR, f"drive_{batch_id}")

    try:
        drive_service = GoogleDriveService(credentials_dict=request.service_account_json)
        downloaded_paths = drive_service.download_folder_resumes(request.folder_id, batch_dir)
        
        if not downloaded_paths:
            return AnalysisBatchResponse(
                success=True,
                total_processed=0,
                successful_count=0,
                failed_count=0,
                results=[],
                failed_files=[],
                message="No PDF files found in the specified Google Drive folder."
            )

        provider_to_use = "groq" if key_to_use.startswith("gsk_") else settings.DEFAULT_AI_PROVIDER
        analyzer = ResumeAnalyzerService(api_key=key_to_use, provider=provider_to_use)
        batch_result = analyzer.process_batch(
            pdf_paths=downloaded_paths,
            target_role=request.target_role,
            job_description=request.job_description,
            scoring_criteria=request.scoring_criteria
        )
        return AnalysisBatchResponse(**batch_result)
    except Exception as e:
        logger.error(f"Error during Google Drive analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Google Drive sync/analysis failed: {str(e)}")

# ==========================================
# 1. Interview Kit Endpoint
# ==========================================
@router.post("/interview-kit/generate", response_model=InterviewKitResponse)
async def generate_interview_kit(request: InterviewKitRequest):
    key_to_use = request.api_key or settings.GROQ_API_KEY or settings.GEMINI_API_KEY
    provider_to_use = request.provider or ("groq" if key_to_use.startswith("gsk_") else settings.DEFAULT_AI_PROVIDER)

    try:
        analyzer = ResumeAnalyzerService(api_key=key_to_use, provider=provider_to_use)
        kit_data = analyzer.generate_interview_kit(
            candidate=request.candidate,
            target_role=request.target_role,
            job_description=request.job_description
        )
        return InterviewKitResponse(**kit_data)
    except Exception as e:
        logger.error(f"Error generating interview kit: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Interview kit generation failed: {str(e)}")

# ==========================================
# 2. AI Copilot Chat Endpoint
# ==========================================
@router.post("/copilot/chat", response_model=CopilotChatResponse)
async def chat_with_copilot(request: CopilotChatRequest):
    key_to_use = request.api_key or settings.GROQ_API_KEY or settings.GEMINI_API_KEY
    provider_to_use = request.provider or ("groq" if key_to_use.startswith("gsk_") else settings.DEFAULT_AI_PROVIDER)

    try:
        analyzer = ResumeAnalyzerService(api_key=key_to_use, provider=provider_to_use)
        history_list = [{"role": m.role, "content": m.content} for m in request.history]
        chat_data = analyzer.copilot_chat(
            question=request.question,
            candidate=request.candidate,
            talent_pool_summary=request.talent_pool_summary,
            history=history_list
        )
        return CopilotChatResponse(**chat_data)
    except Exception as e:
        logger.error(f"Error during copilot chat: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Copilot query failed: {str(e)}")

# ==========================================
# 3. Candidate Outreach Email Endpoint
# ==========================================
@router.post("/outreach/compose", response_model=OutreachEmailResponse)
async def compose_outreach(request: OutreachEmailRequest):
    key_to_use = request.api_key or settings.GROQ_API_KEY or settings.GEMINI_API_KEY
    provider_to_use = request.provider or ("groq" if key_to_use.startswith("gsk_") else settings.DEFAULT_AI_PROVIDER)

    try:
        analyzer = ResumeAnalyzerService(api_key=key_to_use, provider=provider_to_use)
        email_data = analyzer.compose_outreach_email(
            candidate=request.candidate,
            email_type=request.email_type,
            custom_note=request.custom_note,
            sender_name=request.sender_name,
            company_name=request.company_name
        )
        return OutreachEmailResponse(**email_data)
    except Exception as e:
        logger.error(f"Error composing outreach email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Email composition failed: {str(e)}")

# ==========================================
# 5. Multi-Role Rematch Endpoint
# ==========================================
@router.post("/rematch/multi-role", response_model=MultiRoleRematchResponse)
async def rematch_multi_role(request: MultiRoleRematchRequest):
    key_to_use = request.api_key or settings.GROQ_API_KEY or settings.GEMINI_API_KEY
    provider_to_use = request.provider or ("groq" if key_to_use.startswith("gsk_") else settings.DEFAULT_AI_PROVIDER)

    try:
        analyzer = ResumeAnalyzerService(api_key=key_to_use, provider=provider_to_use)
        rematch_data = analyzer.rematch_multi_roles(
            candidate=request.candidate,
            custom_roles=request.custom_roles
        )
        return MultiRoleRematchResponse(**rematch_data)
    except Exception as e:
        logger.error(f"Error performing multi-role rematch: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Multi-role evaluation failed: {str(e)}")

# ==========================================
# Export Endpoint
# ==========================================
@router.post("/export/excel")
async def export_excel_report(data: List[dict]):
    if not data:
        raise HTTPException(status_code=400, detail="No candidate data provided to export.")

    filename = f"Resume_Analysis_{uuid.uuid4().hex[:6]}.xlsx"
    export_path = os.path.join(settings.TEMP_EXPORT_DIR, filename)

    try:
        ExcelReportGenerator.generate_excel_report(
            results=data,
            failed_files=[],
            output_filepath=export_path
        )

        return FileResponse(
            path=export_path,
            filename=filename,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        logger.error(f"Failed to generate Excel export: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate Excel report: {str(e)}")
