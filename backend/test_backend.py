import sys
import os

# Add root to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from backend.app.services.analyzer import ResumeAnalyzerService
from backend.app.services.excel_generator import ExcelReportGenerator

def test_json_cleaning():
    raw_response = '```json\n{"name": "Alice Johnson", "university": "MIT", "gen_ai_score": 3, "ai_ml_score": 3, "key_skills": ["PyTorch", "LangChain"]}\n```'
    cleaned = ResumeAnalyzerService.clean_json_response(raw_response)
    print("Cleaned JSON output:", cleaned)
    assert "Alice Johnson" in cleaned
    print("[SUCCESS] JSON cleaning test passed.")

def test_excel_generation():
    sample_data = [
        {
            "source_file": "sample_resume.pdf",
            "name": "Jane Doe",
            "contact_details": "jane@example.com",
            "university": "Stanford University",
            "year_of_study": "2024",
            "course": "BS Computer Science",
            "discipline": "AI",
            "cgpa_percentage": "3.9",
            "key_skills": ["Python", "TensorFlow", "FastAPI", "Agentic RAG"],
            "gen_ai_score": 3,
            "ai_ml_score": 3,
            "supporting_info": {
                "certifications": ["AWS Certified ML Specialist"],
                "internships": ["AI Research Intern at TechCorp"],
                "projects": [
                    {
                        "name": "Autonomous Agent System",
                        "description": "Built multi-agent evaluation framework.",
                        "technologies": ["LangGraph", "Gemini", "Python"]
                    }
                ]
            },
            "additional_insights": {
                "career_potential": "Exceptional",
                "technical_strength": "Advanced LLM engineering",
                "experience_level": "Advanced"
            }
        }
    ]

    output_path = os.path.join("temp_exports", "test_output.xlsx")
    res_path = ExcelReportGenerator.generate_excel_report(sample_data, [], output_path)
    assert os.path.exists(res_path), "Excel file was not created!"
    print(f"[SUCCESS] Excel generation test passed: {res_path} generated successfully.")

def test_dict_internships_sanitization():
    from backend.app.services.analyzer import sanitize_string_list
    from backend.app.models.schemas import AnalysisBatchResponse, CandidateAnalysis

    raw_internships = [
        {"role": "Junior Software Engineer", "company": "Communication Services", "description": "Developed microservices"},
        "Direct String Internship"
    ]
    cleaned = sanitize_string_list(raw_internships)
    assert len(cleaned) == 2
    assert "Junior Software Engineer at Communication Services" in cleaned[0]
    assert cleaned[1] == "Direct String Internship"

    # Test Pydantic model validation with dict in internships
    cand_data = {
        "name": "John Doe",
        "supporting_info": {
            "internships": raw_internships,
            "certifications": [{"title": "AWS Architect"}],
            "projects": []
        }
    }
    analysis = CandidateAnalysis(**cand_data)
    batch_resp = AnalysisBatchResponse(
        success=True,
        total_processed=1,
        successful_count=1,
        failed_count=0,
        results=[analysis]
    )
    assert len(batch_resp.results) == 1
    print("[SUCCESS] Dict internships sanitization & Pydantic validation test passed.")

if __name__ == "__main__":
    test_json_cleaning()
    test_excel_generation()
    test_dict_internships_sanitization()
    print("[SUCCESS] All backend unit tests passed successfully!")
