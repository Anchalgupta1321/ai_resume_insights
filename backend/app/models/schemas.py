from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field

class ProjectInfo(BaseModel):
    name: str = ""
    description: str = ""
    technologies: List[str] = []
    candidate_name: Optional[str] = None

class SupportingInfo(BaseModel):
    certifications: List[Union[str, Dict[str, Any]]] = []
    internships: List[Union[str, Dict[str, Any]]] = []
    projects: List[Union[ProjectInfo, Dict[str, Any]]] = []

class AdditionalInsights(BaseModel):
    career_potential: Optional[str] = "Good potential"
    technical_strength: Optional[str] = "Solid foundation"
    experience_level: Optional[str] = "Entry / Intermediate"

class RiskAssessment(BaseModel):
    authenticity_score: int = Field(default=90, ge=0, le=100)
    metric_impact_score: int = Field(default=85, ge=0, le=100)
    buzzword_density_score: int = Field(default=20, ge=0, le=100)
    risk_flags: List[str] = []
    authenticity_summary: Optional[str] = "High confidence resume with verified skills and quantifiable metrics."

class CandidateAnalysis(BaseModel):
    source_file: Optional[str] = "resume.pdf"
    name: str = "Candidate"
    contact_details: Optional[str] = ""
    university: Optional[str] = "N/A"
    year_of_study: Optional[str] = "N/A"
    course: Optional[str] = "N/A"
    discipline: Optional[str] = "N/A"
    cgpa_percentage: Optional[str] = "N/A"
    key_skills: List[str] = []
    technical_skills: List[str] = []
    
    # Generalized & Dynamic Scoring
    target_role: Optional[str] = "General / Evaluated Role"
    match_score_pct: int = Field(default=75, ge=0, le=100)
    evaluation_scores: Dict[str, int] = Field(default_factory=dict)
    recommendation: Optional[str] = "Shortlist"  # Strong Hire, Shortlist, Review, Reject
    fit_summary: Optional[str] = ""
    matched_skills: List[str] = []
    missing_skills: List[str] = []
    
    # ATS Workflow & Risk Intelligence
    pipeline_stage: Optional[str] = "screened"  # applied, screened, interviewing, offered, hired, rejected
    risk_assessment: Optional[RiskAssessment] = Field(default_factory=RiskAssessment)

    # Legacy backward compatibility fields
    gen_ai_score: Optional[int] = 1
    ai_ml_score: Optional[int] = 1

    supporting_info: Optional[SupportingInfo] = Field(default_factory=SupportingInfo)
    additional_insights: Optional[AdditionalInsights] = Field(default_factory=AdditionalInsights)
    raw_text: Optional[str] = None

class FailedFileRecord(BaseModel):
    filename: str
    error: str

class AnalysisBatchResponse(BaseModel):
    success: bool
    total_processed: int
    successful_count: int
    failed_count: int
    results: List[CandidateAnalysis]
    failed_files: List[FailedFileRecord] = []
    message: str = "Analysis completed"

# ==========================================
# 1. Interview Kit Schemas
# ==========================================
class InterviewQuestion(BaseModel):
    category: str  # Technical, Architecture & System Design, Behavioral, Problem Solving
    question: str
    context_from_resume: str
    expected_answer_rubric: str
    difficulty: str = "Intermediate"  # Junior, Intermediate, Senior
    interviewer_tip: Optional[str] = None

class InterviewKitRequest(BaseModel):
    candidate: Dict[str, Any]
    target_role: Optional[str] = "Software Engineer"
    job_description: Optional[str] = None
    api_key: Optional[str] = None
    provider: Optional[str] = "groq"

class InterviewKitResponse(BaseModel):
    success: bool
    candidate_name: str
    target_role: str
    technical_questions: List[InterviewQuestion] = []
    behavioral_questions: List[InterviewQuestion] = []
    probing_questions: List[InterviewQuestion] = []
    interview_focus_areas: List[str] = []
    suggested_duration_mins: int = 45

# ==========================================
# 2. AI Copilot Chat Schemas
# ==========================================
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class CopilotChatRequest(BaseModel):
    question: str
    candidate: Optional[Dict[str, Any]] = None
    talent_pool_summary: Optional[str] = None
    history: List[ChatMessage] = []
    api_key: Optional[str] = None
    provider: Optional[str] = "groq"

class CopilotChatResponse(BaseModel):
    success: bool
    answer: str
    suggested_followups: List[str] = []
    citations: List[str] = []

# ==========================================
# 3. Outreach & Email Composer Schemas
# ==========================================
class OutreachEmailRequest(BaseModel):
    candidate: Dict[str, Any]
    email_type: str = "interview_invite"  # interview_invite, phone_screen, polite_rejection, offer_letter
    custom_note: Optional[str] = None
    sender_name: Optional[str] = "Hiring Team"
    company_name: Optional[str] = "Enterprise Recruitment"
    api_key: Optional[str] = None
    provider: Optional[str] = "groq"

class OutreachEmailResponse(BaseModel):
    success: bool
    subject: str
    body_text: str
    email_type: str
    candidate_email: Optional[str] = None
    call_to_action: Optional[str] = None

# ==========================================
# 5. Multi-Role Rematch Schemas
# ==========================================
class RoleMatchResult(BaseModel):
    role_name: str
    match_score_pct: int
    fit_level: str  # High Match, Moderate Match, Low Match
    matched_skills: List[str]
    gap_skills: List[str]
    recommendation_reason: str

class MultiRoleRematchRequest(BaseModel):
    candidate: Dict[str, Any]
    custom_roles: Optional[List[Dict[str, str]]] = None
    api_key: Optional[str] = None
    provider: Optional[str] = "groq"

class MultiRoleRematchResponse(BaseModel):
    success: bool
    candidate_name: str
    matches: List[RoleMatchResult] = []
    best_fit_role: Optional[str] = None

class DriveSyncRequest(BaseModel):
    folder_id: str
    target_role: Optional[str] = None
    job_description: Optional[str] = None
    scoring_criteria: Optional[List[str]] = None
    api_key: Optional[str] = None
    service_account_json: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    project: str
    version: str
    gemini_key_configured: bool
