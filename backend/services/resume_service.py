import re
from pypdf import PdfReader
from backend.db import get_db
from backend.services.analytics_service import AnalyticsService

# Master taxonomy of technical skills for resume matching
MASTER_SKILLS_TAXONOMY = [
    "Python", "Java", "C++", "C#", "C", "SQL", "JavaScript", "TypeScript", "HTML", "CSS",
    "Flask", "Django", "FastAPI", "React", "React Native", "Angular", "Vue", "Node.js", "Express",
    "MongoDB", "PostgreSQL", "MySQL", "Oracle SQL", "Redis", "DynamoDB",
    "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "PyTorch", "OpenCV", "NLTK", "Keras",
    "Machine Learning", "Deep Learning", "Data Mining", "Natural Language Processing", "AI",
    "AWS", "Azure", "Google Cloud", "Docker", "Kubernetes", "Linux", "Git", "GitHub", "Jira",
    "REST API", "GraphQL", "Microservices", "Kafka", "PySpark", "ETL", "Tableau", "Power BI",
    "Selenium", "Postman", "Figma", "Excel", "Data Structures", "Algorithms", "OOP", "System Design",
    "CI/CD", "Terraform", "Bash Scripting", "Shell Scripting", "Networking", "Security"
]

class ResumeService:

    @staticmethod
    def extract_text_from_pdf(pdf_file_path_or_stream):
        try:
            reader = PdfReader(pdf_file_path_or_stream)
            text = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    @staticmethod
    def parse_resume_content(text):
        if not text or len(text.strip()) < 10:
            return {"error": "Uploaded PDF contains no readable text or is empty."}

        text_lower = text.lower()

        # 1. Skill Extraction
        detected_skills = []
        for skill in MASTER_SKILLS_TAXONOMY:
            # Match whole word pattern or precise substring for acronyms/tools
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, text_lower):
                detected_skills.append(skill)
            elif skill.lower() in ["c++", "c#", ".net"] and skill.lower() in text_lower:
                detected_skills.append(skill)

        # Deduplicate
        detected_skills = list(dict.fromkeys(detected_skills))

        # 2. Education Detection
        education_found = []
        degrees = ["B.Tech", "B.E.", "M.Tech", "B.Sc", "M.Sc", "MCA", "BCA", "Bachelor", "Master", "Computer Science", "Data Science", "Information Technology"]
        for d in degrees:
            if d.lower() in text_lower:
                education_found.append(d)

        # 3. Sections Detection
        has_projects = "project" in text_lower or "portfolio" in text_lower
        has_experience = "experience" in text_lower or "internship" in text_lower or "work history" in text_lower
        has_certifications = "certification" in text_lower or "certificate" in text_lower or "coursework" in text_lower

        return {
            "text_length": len(text),
            "detected_skills": detected_skills,
            "education": list(set(education_found)),
            "has_projects": has_projects,
            "has_experience": has_experience,
            "has_certifications": has_certifications
        }

    @staticmethod
    def analyze_resume(text):
        parsed = ResumeService.parse_resume_content(text)
        if "error" in parsed:
            return parsed

        detected_skills = parsed["detected_skills"]
        user_skills_set = set(s.lower() for s in detected_skills)

        # Retrieve all market demand skills from MongoDB
        db = get_db()
        market_skills = list(db['skills'].find({}).sort("demand_count", -1))
        
        # Determine missing in-demand skills
        in_demand_missing = []
        for item in market_skills:
            skill_name = item.get("name")
            if skill_name and skill_name.lower() not in user_skills_set:
                in_demand_missing.append({
                    "skill": skill_name,
                    "demand_count": item.get("demand_count", 1)
                })

        top_missing_skills = [item["skill"] for item in in_demand_missing[:8]]

        # Retrieve predefined career profiles from DB
        career_profiles = list(db['career_profiles'].find({}, {'_id': 0}))
        
        matched_careers = []
        for profile in career_profiles:
            c_name = profile["career_name"]
            req_skills = profile.get("required_skills", [])
            req_set = set(s.lower() for s in req_skills)
            
            matching = [s for s in req_skills if s.lower() in user_skills_set]
            missing = [s for s in req_skills if s.lower() not in user_skills_set]
            
            if req_skills:
                match_pct = int(round((len(matching) / len(req_skills)) * 100))
            else:
                match_pct = 50

            matched_careers.append({
                "career_name": c_name,
                "match_percentage": match_pct,
                "matching_skills": matching,
                "missing_skills": missing,
                "recommended_tools": profile.get("recommended_tools", []),
                "certifications": profile.get("certifications", [])
            })

        # Sort matched careers by percentage descending
        matched_careers.sort(key=lambda x: x["match_percentage"], reverse=True)

        # Overall Project-generated Match Score (0-100%)
        # Weighted average of top career match + skills volume + project/exp flags
        top_role_score = matched_careers[0]["match_percentage"] if matched_careers else 50
        skills_volume_score = min(len(detected_skills) * 8, 100)
        overall_match_score = int(round((0.60 * top_role_score) + (0.30 * skills_volume_score) + (10 if parsed["has_projects"] else 0)))
        overall_match_score = min(max(overall_match_score, 25), 98)

        # Match jobs from MongoDB
        matching_jobs = ResumeService._find_matching_jobs(user_skills_set)
        matching_internships = ResumeService._find_matching_internships(user_skills_set)

        # Build Personalized Learning Roadmap
        learning_roadmap = []
        priority_map = {0: "High", 1: "High", 2: "High", 3: "Medium", 4: "Medium", 5: "Medium"}
        for idx, item in enumerate(in_demand_missing[:6]):
            learning_roadmap.append({
                "skill": item["skill"],
                "priority": priority_map.get(idx, "Low"),
                "reason": f"Required in {item['demand_count']} active market job/internship postings."
            })

        return {
            "overall_match_score": overall_match_score,
            "score_label": "Project-generated Match Score",
            "detected_skills": detected_skills,
            "missing_skills": top_missing_skills,
            "education": parsed["education"],
            "has_projects": parsed["has_projects"],
            "has_experience": parsed["has_experience"],
            "matched_careers": matched_careers,
            "recommended_jobs": matching_jobs,
            "recommended_internships": matching_internships,
            "learning_roadmap": learning_roadmap
        }

    @staticmethod
    def _find_matching_jobs(user_skills_set, limit=6):
        db = get_db()
        all_jobs = list(db['jobs'].find({}, {'_id': 0}))
        
        scored_jobs = []
        for job in all_jobs:
            job_skills = job.get("skills", [])
            if not job_skills:
                continue
            j_set = set(s.lower() for s in job_skills)
            overlap = user_skills_set.intersection(j_set)
            match_pct = int(round((len(overlap) / len(j_set)) * 100))
            
            scored_jobs.append({
                "title": job.get("title"),
                "company": job.get("company"),
                "location": job.get("location"),
                "salary": job.get("salary"),
                "skills": job.get("skills"),
                "experience": job.get("experience"),
                "job_type": job.get("job_type"),
                "match_percentage": match_pct
            })

        scored_jobs.sort(key=lambda x: x["match_percentage"], reverse=True)
        return scored_jobs[:limit]

    @staticmethod
    def _find_matching_internships(user_skills_set, limit=6):
        db = get_db()
        all_internships = list(db['internships'].find({}, {'_id': 0}))
        
        scored_internships = []
        for item in all_internships:
            skills = item.get("skills", [])
            if not skills:
                continue
            i_set = set(s.lower() for s in skills)
            overlap = user_skills_set.intersection(i_set)
            match_pct = int(round((len(overlap) / len(i_set)) * 100))
            
            scored_internships.append({
                "title": item.get("title"),
                "company": item.get("company"),
                "location": item.get("location"),
                "stipend": item.get("stipend"),
                "duration": item.get("duration"),
                "skills": item.get("skills"),
                "internship_type": item.get("internship_type"),
                "match_percentage": match_pct
            })

        scored_internships.sort(key=lambda x: x["match_percentage"], reverse=True)
        return scored_internships[:limit]
