import os
import re
import json
import logging
import warnings
from time import sleep
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor

warnings.filterwarnings("ignore")

import PyPDF2
from groq import Groq
import google.generativeai as genai
from backend.app.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

def sanitize_string_list(items: Any) -> List[str]:
    if not isinstance(items, list):
        return []
    result = []
    for item in items:
        if isinstance(item, str):
            if item.strip():
                result.append(item.strip())
        elif isinstance(item, dict):
            role_or_title = item.get("role") or item.get("title") or item.get("name") or item.get("position")
            company_or_org = item.get("company") or item.get("organization") or item.get("issuer")
            desc = item.get("description") or item.get("details")
            parts = []
            if role_or_title and isinstance(role_or_title, str):
                parts.append(role_or_title.strip())
            if company_or_org and isinstance(company_or_org, str):
                parts.append(f"at {company_or_org.strip()}" if parts else company_or_org.strip())
            if desc and isinstance(desc, str):
                parts.append(f"({desc.strip()})")
            if parts:
                result.append(" ".join(parts))
            else:
                val_strs = [str(v) for v in item.values() if v]
                if val_strs:
                    result.append(" - ".join(val_strs))
        elif item is not None:
            result.append(str(item))
    return result

DEFAULT_CRITERIA = [
    "Domain & Role Expertise",
    "Practical Experience & Projects",
    "Key Technical & Soft Skills",
    "Leadership & Problem Solving"
]

DEFAULT_BENCHMARK_ROLES = [
    {"role_name": "Senior Full Stack Engineer", "core_skills": "React, Node.js, TypeScript, PostgreSQL, REST APIs, Cloud"},
    {"role_name": "AI / ML & LLM Specialist", "core_skills": "Python, PyTorch, Large Language Models, RAG, Vector Databases, MLOps"},
    {"role_name": "Senior Data Scientist", "core_skills": "Python, SQL, Statistical Modeling, Machine Learning, Data Analytics, Pandas"},
    {"role_name": "Technical Product Manager", "core_skills": "Product Strategy, Technical Roadmapping, Agile, System Architecture, Metrics"},
    {"role_name": "DevOps & Cloud Architect", "core_skills": "Docker, Kubernetes, AWS/GCP, CI/CD, Terraform, Microservices"}
]

class ResumeAnalyzerService:
    def __init__(
        self, 
        api_key: Optional[str] = None, 
        provider: Optional[str] = None, 
        model_name: Optional[str] = None
    ):
        self.provider = provider or settings.DEFAULT_AI_PROVIDER
        
        if self.provider == "groq" or (api_key and api_key.startswith("gsk_")):
            self.api_key = api_key or settings.GROQ_API_KEY
            self.model_name = model_name or settings.DEFAULT_GROQ_MODEL
            self.groq_client = Groq(api_key=self.api_key) if self.api_key else None
            self.gemini_model = None
        else:
            self.api_key = api_key or settings.GEMINI_API_KEY
            self.model_name = model_name or settings.DEFAULT_GEMINI_MODEL
            self.groq_client = None
            if self.api_key:
                genai.configure(api_key=self.api_key)
                self.gemini_model = genai.GenerativeModel(self.model_name)
            else:
                self.gemini_model = None

    @staticmethod
    def extract_text_from_pdf(pdf_path: str) -> str:
        """Extract text from a PDF file using PyPDF2 with sanitization."""
        try:
            text = ""
            with open(pdf_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    page_text = page.extract_text() or ""
                    page_text = re.sub(r'\s+', ' ', page_text)
                    page_text = re.sub(r'[^\x00-\x7F]+', '', page_text)
                    text += page_text + "\n"
            return text.strip()
        except Exception as e:
            logging.error(f"Error extracting text from PDF {pdf_path}: {str(e)}")
            return ""

    @staticmethod
    def clean_json_response(response_text: str) -> str:
        """Extract and clean valid JSON content from LLM response."""
        try:
            json_content = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_content:
                json_str = json_content.group()
                json_str = re.sub(r'```json|```', '', json_str)
                json_str = re.sub(r'\s+', ' ', json_str)
                return json_str.strip()
            return ""
        except Exception as e:
            logging.error(f"Error cleaning JSON response: {str(e)}")
            return ""

    def _call_groq_llm(self, prompt: str, system_msg: str = "You are an expert AI recruiting assistant. Respond strictly in valid JSON format.") -> str:
        if not self.groq_client:
            if not self.api_key:
                raise ValueError("Groq API Key is not configured. Please provide a key or set GROQ_API_KEY in .env.")
            self.groq_client = Groq(api_key=self.api_key)

        models_to_try = [self.model_name, "llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192", "mixtral-8x7b-32768"]
        for m in models_to_try:
            try:
                chat_completion = self.groq_client.chat.completions.create(
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": prompt}
                    ],
                    model=m,
                    response_format={"type": "json_object"}
                )
                return chat_completion.choices[0].message.content
            except Exception as e:
                logging.warning(f"Groq model {m} attempt failed: {str(e)}, trying next model...")
                continue
        raise RuntimeError("All Groq model attempts failed.")

    def _call_gemini_llm(self, prompt: str) -> str:
        if not self.gemini_model:
            if not self.api_key:
                raise ValueError("Gemini API key is not configured.")
            genai.configure(api_key=self.api_key)
            self.gemini_model = genai.GenerativeModel(self.model_name)

        models_to_try = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-pro"]
        for m_name in models_to_try:
            try:
                m = genai.GenerativeModel(m_name)
                response = m.generate_content(prompt)
                return response.text
            except Exception as e:
                logging.warning(f"Gemini model {m_name} failed: {str(e)}, trying next...")
                continue
        raise RuntimeError("All Gemini model attempts failed.")

    def _execute_prompt(self, prompt: str, system_msg: Optional[str] = None) -> str:
        if self.provider == "groq" or (self.api_key and self.api_key.startswith("gsk_")):
            return self._call_groq_llm(prompt, system_msg or "You are a professional ATS AI assistant. Output strictly valid JSON.")
        return self._call_gemini_llm(prompt)

    # ==========================================
    # 1. Core Resume Screening & Risk Extraction
    # ==========================================
    def build_dynamic_prompt(
        self, 
        resume_text: str, 
        target_role: Optional[str] = None,
        job_description: Optional[str] = None,
        scoring_criteria: Optional[List[str]] = None
    ) -> str:
        role = target_role or "Specified Role / General Candidate"
        criteria = scoring_criteria if scoring_criteria and len(scoring_criteria) > 0 else DEFAULT_CRITERIA
        criteria_list_str = "\n".join([f"   - {c} (Rate 1 to 5, where 1=Poor/No Evidence, 3=Competent, 5=Outstanding/Mastery)" for c in criteria])
        criteria_json_template = ", ".join([f'"{c}": 3' for c in criteria])

        jd_section = f"""
TARGET JOB DESCRIPTION / REQUIREMENTS:
----------------------------------------
{job_description.strip() if job_description and job_description.strip() else f"Target Role: {role}. Evaluate candidate domain excellence and readiness."}
----------------------------------------
"""

        return f"""
You are an expert Executive Hiring Manager and AI Talent Intelligence System.
Analyze the provided resume against the Target Role / Job Description.
Also assess resume authenticity, quantifiable metrics impact, and risk flags (e.g., timeline gaps, buzzword density without proof).

{jd_section}

EVALUATION RULES:
1. Overall Match Score (0 to 100): Alignment with the Target Role/JD as an integer percentage.
2. Dynamic Criteria Scores (1 to 5):
{criteria_list_str}
3. Recommendation: Must be one of ["Strong Hire", "Shortlist", "Review", "Reject"]
4. Matched Skills vs Missing Skills
5. Risk & Authenticity Assessment:
   - authenticity_score (0-100%): Level of credibility based on detailed projects and verifiable details.
   - metric_impact_score (0-100%): Proportion of achievements backed up by quantitative numbers/metrics (% improvements, user scale, revenue, speedup).
   - buzzword_density_score (0-100%): Ratio of unsubstantiated keywords vs substantiated projects.
   - risk_flags: List of any detected timeline anomalies, vague project descriptions, or missing critical qualifications.

REQUIRED STRICT JSON OUTPUT STRUCTURE:
{{
    "name": "Full name of candidate",
    "contact_details": "Email, phone number, LinkedIn, location, or GitHub if present",
    "university": "University / College name or N/A",
    "year_of_study": "Graduation year or current status",
    "course": "Degree or program name (e.g., B.Tech, MBA, BS, BA, MS)",
    "discipline": "Field of study / Major",
    "cgpa_percentage": "CGPA / GPA / Percentage or N/A",
    "target_role": "{role}",
    "match_score_pct": 85,
    "evaluation_scores": {{
        {criteria_json_template}
    }},
    "recommendation": "Shortlist",
    "fit_summary": "1-2 sentence executive assessment of why the candidate fits or does not fit this role",
    "matched_skills": ["skill1", "skill2"],
    "missing_skills": ["missing_skill1"],
    "key_skills": ["all", "extracted", "skills", "and", "tools"],
    "technical_skills": ["extracted", "tech", "skills"],
    "pipeline_stage": "screened",
    "risk_assessment": {{
        "authenticity_score": 92,
        "metric_impact_score": 85,
        "buzzword_density_score": 18,
        "risk_flags": [],
        "authenticity_summary": "High-confidence resume with verifiable project deliverables and metrics."
    }},
    "supporting_info": {{
        "certifications": ["list of certifications"],
        "internships": ["list of internships / roles with details"],
        "projects": [
            {{
                "name": "project or initiative name",
                "description": "brief description of problem and outcome with metrics",
                "technologies": ["tools or technologies used"]
            }}
        ]
    }},
    "additional_insights": {{
        "career_potential": "Assessment of growth trajectory",
        "technical_strength": "Primary domain strengths and core expertise",
        "experience_level": "Entry-level / Intermediate / Senior / Lead"
    }}
}}

RESUME TEXT TO EVALUATE:
----------------------------------------
{resume_text}
----------------------------------------
"""

    def analyze_resume_text(
        self, 
        text: str,
        target_role: Optional[str] = None,
        job_description: Optional[str] = None,
        scoring_criteria: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Analyze resume text using the selected AI provider."""
        prompt = self.build_dynamic_prompt(text, target_role, job_description, scoring_criteria)
        max_retries = 3
        last_error = None

        for attempt in range(max_retries):
            try:
                raw_text = self._execute_prompt(prompt)
                if not raw_text:
                    raise ValueError("Empty response received from LLM.")

                json_str = self.clean_json_response(raw_text)
                if not json_str:
                    raise ValueError("No valid JSON found in model output.")

                data = json.loads(json_str)

                # Normalize Match Score % (0-100)
                try:
                    match_val = int(data.get("match_score_pct", 75))
                    data["match_score_pct"] = max(0, min(100, match_val))
                except (ValueError, TypeError):
                    data["match_score_pct"] = 75

                if "evaluation_scores" not in data or not isinstance(data["evaluation_scores"], dict):
                    data["evaluation_scores"] = {}

                if "technical_skills" not in data or not isinstance(data["technical_skills"], list):
                    data["technical_skills"] = data.get("key_skills", [])

                for str_field in ["name", "contact_details", "university", "year_of_study", "course", "discipline", "cgpa_percentage", "fit_summary", "recommendation", "pipeline_stage"]:
                    if str_field not in data or not data[str_field]:
                        data[str_field] = "screened" if str_field == "pipeline_stage" else ("Shortlist" if str_field == "recommendation" else "N/A")

                data["matched_skills"] = sanitize_string_list(data.get("matched_skills", []))
                data["missing_skills"] = sanitize_string_list(data.get("missing_skills", []))
                data["key_skills"] = sanitize_string_list(data.get("key_skills", []))
                data["technical_skills"] = sanitize_string_list(data.get("technical_skills") or data.get("key_skills", []))

                if "supporting_info" not in data or not isinstance(data["supporting_info"], dict):
                    data["supporting_info"] = {"certifications": [], "internships": [], "projects": []}
                else:
                    supp = data["supporting_info"]
                    supp["certifications"] = sanitize_string_list(supp.get("certifications", []))
                    supp["internships"] = sanitize_string_list(supp.get("internships", []))

                    raw_projects = supp.get("projects", [])
                    cleaned_projects = []
                    if isinstance(raw_projects, list):
                        for proj in raw_projects:
                            if isinstance(proj, dict):
                                cleaned_projects.append({
                                    "name": str(proj.get("name") or "Project"),
                                    "description": str(proj.get("description") or ""),
                                    "technologies": sanitize_string_list(proj.get("technologies", [])),
                                    "candidate_name": proj.get("candidate_name")
                                })
                            elif isinstance(proj, str):
                                cleaned_projects.append({
                                    "name": proj,
                                    "description": "",
                                    "technologies": [],
                                    "candidate_name": None
                                })
                    supp["projects"] = cleaned_projects

                if "risk_assessment" not in data or not isinstance(data["risk_assessment"], dict):
                    data["risk_assessment"] = {
                        "authenticity_score": 90,
                        "metric_impact_score": 80,
                        "buzzword_density_score": 20,
                        "risk_flags": [],
                        "authenticity_summary": "Verified candidate profile with practical deliverables."
                    }
                else:
                    data["risk_assessment"]["risk_flags"] = sanitize_string_list(data["risk_assessment"].get("risk_flags", []))

                return data

            except json.JSONDecodeError as je:
                logging.warning(f"JSON parse error on attempt {attempt + 1}: {str(je)}")
                last_error = je
                if attempt < max_retries - 1:
                    sleep(0.5)
            except Exception as e:
                logging.warning(f"Error during resume analysis attempt {attempt + 1}: {str(e)}")
                last_error = e
                if attempt < max_retries - 1:
                    sleep(0.5)

        logging.error(f"Failed to analyze resume after {max_retries} attempts: {str(last_error)}")
        raise RuntimeError(f"Resume evaluation failed: {str(last_error)}")

    # ==========================================
    # 2. Tailored Interview Kit Generator
    # ==========================================
    def generate_interview_kit(
        self, 
        candidate: Dict[str, Any], 
        target_role: Optional[str] = None, 
        job_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Generate a tailored interview question kit and rubric for the interview panel."""
        role = target_role or candidate.get("target_role", "Software Engineer")
        cand_name = candidate.get("name", "Candidate")
        skills = ", ".join(candidate.get("key_skills", [])[:8])
        missing = ", ".join(candidate.get("missing_skills", [])[:4])
        projects = json.dumps(candidate.get("supporting_info", {}).get("projects", [])[:3])

        prompt = f"""
You are an expert Principal Interviewer and Hiring Bar Raiser.
Generate a comprehensive, tailored Interview Question Kit for candidate "{cand_name}" applying for "{role}".

CANDIDATE CONTEXT:
- Key Skills: {skills}
- Gaps / Missing Competencies: {missing if missing else "None explicitly detected"}
- Highlights / Projects: {projects}
- Job Description Context: {job_description or "Standard role requirements"}

Generate:
1. 3 tailored Technical & Architecture questions grounded in their specific projects/skills.
2. 2 Behavioral & Ownership questions grounded in their career trajectory.
3. 2 Probing questions specifically evaluating their missing/gap skills or weak areas.
4. An expected answer rubric (what a great answer looks like vs red flags) and an interviewer tip for each.

STRICT JSON OUTPUT STRUCTURE:
{{
    "candidate_name": "{cand_name}",
    "target_role": "{role}",
    "suggested_duration_mins": 45,
    "interview_focus_areas": ["System Design", "Practical Execution", "Problem Solving Under Pressure"],
    "technical_questions": [
        {{
            "category": "Technical Architecture",
            "question": "Clear, deep technical question referencing their project",
            "context_from_resume": "Why we are asking this based on their resume",
            "expected_answer_rubric": "What a top 5/5 answer should demonstrate",
            "difficulty": "Senior",
            "interviewer_tip": "Look for trade-off analysis between latency vs consistency"
        }}
    ],
    "behavioral_questions": [
        {{
            "category": "Cross-Functional Collaboration",
            "question": "Behavioral question",
            "context_from_resume": "Context",
            "expected_answer_rubric": "Expected answer",
            "difficulty": "Intermediate",
            "interviewer_tip": "Check for accountability"
        }}
    ],
    "probing_questions": [
        {{
            "category": "Skill Gap Verification",
            "question": "Probing question on missing skill",
            "context_from_resume": "Resume lacks evidence of X",
            "expected_answer_rubric": "Willingness to learn and foundational understanding",
            "difficulty": "Intermediate",
            "interviewer_tip": "Assess depth vs superficial knowledge"
        }}
    ]
}}
"""
        raw_text = self._execute_prompt(prompt)
        json_str = self.clean_json_response(raw_text)
        if not json_str:
            raise ValueError("Failed to generate valid interview kit JSON.")
        data = json.loads(json_str)
        data["success"] = True
        return data

    # ==========================================
    # 3. AI Resume Copilot (Interactive Q&A)
    # ==========================================
    def copilot_chat(
        self, 
        question: str, 
        candidate: Optional[Dict[str, Any]] = None, 
        talent_pool_summary: Optional[str] = None,
        history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Answer recruiter questions about a candidate or talent pool in real-time."""
        context_str = ""
        if candidate:
            cand_json = json.dumps(candidate, indent=2)
            context_str = f"ACTIVE CANDIDATE PROFILE:\n{cand_json}\n"
        elif talent_pool_summary:
            context_str = f"TALENT POOL SUMMARY:\n{talent_pool_summary}\n"

        history_str = ""
        if history:
            for msg in history[-4:]:
                history_str += f"{msg.get('role', 'user').upper()}: {msg.get('content', '')}\n"

        prompt = f"""
You are the AI Recruitment Copilot for an enterprise ATS.
Answer the recruiter's question accurately, concisely, and objectively based on the provided candidate resume context.

{context_str}

RECENT CONVERSATION HISTORY:
{history_str}

RECRUITER'S QUESTION:
"{question}"

Provide a crisp, actionable answer with 2-3 suggested follow-up questions recruiters might want to ask.

STRICT JSON OUTPUT STRUCTURE:
{{
    "answer": "Clear, detailed response addressing the recruiter's inquiry with specific citations from the resume.",
    "citations": ["Quoted project or bullet from resume proving the point"],
    "suggested_followups": ["Followup question 1", "Followup question 2"]
}}
"""
        raw_text = self._execute_prompt(prompt)
        json_str = self.clean_json_response(raw_text)
        if not json_str:
            raise ValueError("Failed to get copilot answer.")
        data = json.loads(json_str)
        data["success"] = True
        return data

    # ==========================================
    # 4. 1-Click Candidate Outreach & Email Composer
    # ==========================================
    def compose_outreach_email(
        self, 
        candidate: Dict[str, Any], 
        email_type: str = "interview_invite", 
        custom_note: Optional[str] = None,
        sender_name: Optional[str] = "Talent Acquisition Team",
        company_name: Optional[str] = "Our Company"
    ) -> Dict[str, Any]:
        """Generate personalized candidate outreach emails with customized praise and clear instructions."""
        cand_name = candidate.get("name", "Candidate")
        role = candidate.get("target_role", "Software Engineer")
        skills = ", ".join(candidate.get("key_skills", [])[:5])
        projects = candidate.get("supporting_info", {}).get("projects", [])
        if projects and isinstance(projects[0], dict):
            top_project = projects[0].get("name", "your recent technical accomplishments")
        elif projects and isinstance(projects[0], str):
            top_project = projects[0]
        else:
            top_project = "your recent technical accomplishments"

        type_instructions = {
            "interview_invite": f"Draft an enthusiastic, professional Technical Interview Invitation. Mention their standout project '{top_project}' and explain the next steps for a 45-min interview.",
            "phone_screen": f"Draft an introductory Phone Screen Invitation to discuss the '{role}' opportunity and learn more about their background in {skills}.",
            "polite_rejection": f"Draft a respectful, warm, and constructive feedback rejection email. Acknowledge their strong skills in {skills}, but inform them that we are moving forward with a candidate whose immediate experience closer matches the specific requirements.",
            "offer_letter": f"Draft an exciting Formal Offer Summary congratulating them on the '{role}' offer, summarizing compensation discussion, and outlining next onboarding steps."
        }

        instruction = type_instructions.get(email_type, type_instructions["interview_invite"])

        prompt = f"""
You are an expert Head of Talent Acquisition at {company_name}.
Compose a personalized, professional email to candidate {cand_name} regarding the {role} position.

INSTRUCTION: {instruction}
{f"ADDITIONAL CUSTOM RECRUITER NOTE: {custom_note}" if custom_note else ""}
SENDER: {sender_name} from {company_name}

STRICT JSON OUTPUT STRUCTURE:
{{
    "subject": "Compelling subject line",
    "body_text": "Complete, beautifully formatted email body with proper greeting and sign-off.",
    "email_type": "{email_type}",
    "candidate_email": "{candidate.get('contact_details', '')}",
    "call_to_action": "e.g. Schedule Interview Link or Acknowledge Receipt"
}}
"""
        raw_text = self._execute_prompt(prompt)
        json_str = self.clean_json_response(raw_text)
        if not json_str:
            raise ValueError("Failed to compose email.")
        data = json.loads(json_str)
        data["success"] = True
        return data

    # ==========================================
    # 5. Multi-Role Re-Matching & Recycling
    # ==========================================
    def rematch_multi_roles(
        self, 
        candidate: Dict[str, Any], 
        custom_roles: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """Evaluate candidate cross-compatibility against multiple organizational benchmark roles."""
        cand_name = candidate.get("name", "Candidate")
        skills = ", ".join(candidate.get("key_skills", []))
        projects = json.dumps(candidate.get("supporting_info", {}).get("projects", []))
        roles_to_evaluate = custom_roles if custom_roles and len(custom_roles) > 0 else DEFAULT_BENCHMARK_ROLES

        prompt = f"""
You are an AI Talent Mobility and Cross-Role Matching Engine.
Evaluate candidate "{cand_name}" against multiple organizational benchmark roles to determine best-fit alternatives.

CANDIDATE PROFILE:
- Skills: {skills}
- Projects & Experience: {projects}
- Current Evaluated Role: {candidate.get('target_role', 'N/A')}

BENCHMARK ROLES TO MATCH AGAINST:
{json.dumps(roles_to_evaluate, indent=2)}

Compute a match score (0-100%), fit level ("High Match", "Moderate Match", "Low Match"), matched skills, gap skills, and concise reason for each role.

STRICT JSON OUTPUT STRUCTURE:
{{
    "candidate_name": "{cand_name}",
    "best_fit_role": "Role with highest compatibility",
    "matches": [
        {{
            "role_name": "Senior Full Stack Engineer",
            "match_score_pct": 88,
            "fit_level": "High Match",
            "matched_skills": ["React", "Node.js", "PostgreSQL"],
            "gap_skills": ["Kubernetes"],
            "recommendation_reason": "Strong fullstack web foundation with production API building experience."
        }}
    ]
}}
"""
        raw_text = self._execute_prompt(prompt)
        json_str = self.clean_json_response(raw_text)
        if not json_str:
            raise ValueError("Failed to calculate multi-role matches.")
        data = json.loads(json_str)
        data["success"] = True
        data.setdefault("candidate_name", cand_name)
        data.setdefault("matches", [])
        for m in data.get("matches", []):
            if isinstance(m, dict):
                m["matched_skills"] = sanitize_string_list(m.get("matched_skills", []))
                m["gap_skills"] = sanitize_string_list(m.get("gap_skills", []))
        return data

    # ==========================================
    # 6. PDF Processing Utilities
    # ==========================================
    def process_single_pdf(
        self, 
        pdf_path: str,
        target_role: Optional[str] = None,
        job_description: Optional[str] = None,
        scoring_criteria: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Process a single PDF file and return parsed candidate evaluation."""
        text = self.extract_text_from_pdf(pdf_path)
        if not text:
            raise ValueError("No readable text could be extracted from the PDF file.")
        
        result = self.analyze_resume_text(
            text=text,
            target_role=target_role,
            job_description=job_description,
            scoring_criteria=scoring_criteria
        )
        result["source_file"] = os.path.basename(pdf_path)
        result["raw_text"] = text[:1500]
        return result

    def process_batch(
        self, 
        pdf_paths: List[str], 
        target_role: Optional[str] = None,
        job_description: Optional[str] = None,
        scoring_criteria: Optional[List[str]] = None,
        max_workers: int = 5
    ) -> Dict[str, Any]:
        """Process multiple PDFs concurrently with generalized criteria."""
        results = []
        failed_files = []

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_path = {
                executor.submit(
                    self.process_single_pdf, 
                    path, 
                    target_role, 
                    job_description, 
                    scoring_criteria
                ): path
                for path in pdf_paths
            }
            for future in future_to_path:
                path = future_to_path[future]
                filename = os.path.basename(path)
                try:
                    res = future.result()
                    if res:
                        results.append(res)
                except Exception as e:
                    logging.error(f"Error processing {filename}: {str(e)}")
                    failed_files.append({"filename": filename, "error": str(e)})

        return {
            "success": True,
            "total_processed": len(pdf_paths),
            "successful_count": len(results),
            "failed_count": len(failed_files),
            "results": results,
            "failed_files": failed_files
        }
