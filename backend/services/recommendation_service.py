from backend.db import get_db

class RecommendationService:

    @staticmethod
    def get_career_recommendation(target_career, user_skills):
        db = get_db()
        career_col = db['career_profiles']
        
        profile = career_col.find_one({"career_name": target_career}, {'_id': 0})
        
        if not profile:
            # Fallback if profile not exact match
            profile = {
                "career_name": target_career,
                "required_skills": ["Python", "SQL", "REST API", "Git", "MongoDB"],
                "recommended_tools": ["VS Code", "Postman", "Git"],
                "certifications": ["Industry Developer Certificate"]
            }

        req_skills = profile.get("required_skills", [])
        user_skills_clean = [s.strip() for s in user_skills if s.strip()]
        user_set = set(s.lower() for s in user_skills_clean)

        existing_skills = [s for s in req_skills if s.lower() in user_set]
        missing_skills = [s for s in req_skills if s.lower() not in user_set]

        if req_skills:
            match_percentage = int(round((len(existing_skills) / len(req_skills)) * 100))
        else:
            match_percentage = 50

        # Retrieve matching jobs from MongoDB
        jobs_col = db['jobs']
        internships_col = db['internships']

        query_regex = {"$regex": target_career.split()[0], "$options": "i"}
        matched_jobs_cursor = list(jobs_col.find({"$or": [{"title": query_regex}, {"skills": {"$in": existing_skills or req_skills}}]}, {'_id': 0}).limit(4))
        matched_internships_cursor = list(internships_col.find({"$or": [{"title": query_regex}, {"skills": {"$in": existing_skills or req_skills}}]}, {'_id': 0}).limit(4))

        return {
            "target_career": target_career,
            "match_percentage": match_percentage,
            "existing_skills": existing_skills,
            "missing_skills": missing_skills,
            "required_skills": req_skills,
            "recommended_tools": profile.get("recommended_tools", []),
            "recommended_certifications": profile.get("certifications", []),
            "recommended_jobs": matched_jobs_cursor,
            "recommended_internships": matched_internships_cursor
        }
