import pandas as pd
import numpy as np
from backend.db import get_db

class AnalyticsService:

    @staticmethod
    def get_dashboard_stats():
        db = get_db()
        jobs_col = db['jobs']
        internships_col = db['internships']
        skills_col = db['skills']

        jobs_list = list(jobs_col.find({}, {'_id': 0}))
        internships_list = list(internships_col.find({}, {'_id': 0}))

        df_jobs = pd.DataFrame(jobs_list) if jobs_list else pd.DataFrame()
        df_internships = pd.DataFrame(internships_list) if internships_list else pd.DataFrame()

        total_jobs = len(df_jobs)
        total_internships = len(df_internships)

        # Unique hiring companies using Pandas
        companies = set()
        if not df_jobs.empty and 'company' in df_jobs.columns:
            companies.update(df_jobs['company'].dropna().unique())
        if not df_internships.empty and 'company' in df_internships.columns:
            companies.update(df_internships['company'].dropna().unique())

        total_companies = len(companies)

        # Top demanded skill
        top_skill = "Python"
        skill_counts = AnalyticsService._get_skill_counts(df_jobs, df_internships)
        if skill_counts:
            top_skill = skill_counts[0]['skill']

        # Average Salary Calculation (Pandas / NumPy)
        avg_salary_lpa = 8.5
        if not df_jobs.empty and 'salary_max_lpa' in df_jobs.columns and 'salary_min_lpa' in df_jobs.columns:
            df_jobs['avg_sal'] = (df_jobs['salary_min_lpa'] + df_jobs['salary_max_lpa']) / 2
            avg_salary_lpa = float(np.round(df_jobs['avg_sal'].mean(), 1))

        # Average Internship Stipend Calculation
        avg_stipend = 18500
        if not df_internships.empty and 'stipend_monthly' in df_internships.columns:
            avg_stipend = int(np.round(df_internships['stipend_monthly'].mean()))

        return {
            "total_jobs": total_jobs,
            "total_internships": total_internships,
            "total_companies": total_companies,
            "most_demanded_skill": top_skill,
            "average_salary_lpa": avg_salary_lpa,
            "average_stipend_monthly": avg_stipend,
            "total_skills": len(skill_counts),
            "total_locations": len(AnalyticsService.get_locations_distribution())
        }

    @staticmethod
    def _get_skill_counts(df_jobs=None, df_internships=None):
        skill_freq = {}
        
        if df_jobs is None or df_internships is None:
            db = get_db()
            df_jobs = pd.DataFrame(list(db['jobs'].find({}, {'_id': 0})))
            df_internships = pd.DataFrame(list(db['internships'].find({}, {'_id': 0})))

        if not df_jobs.empty and 'skills' in df_jobs.columns:
            for skills in df_jobs['skills'].dropna():
                for s in skills:
                    skill_freq[s] = skill_freq.get(s, 0) + 1

        if not df_internships.empty and 'skills' in df_internships.columns:
            for skills in df_internships['skills'].dropna():
                for s in skills:
                    skill_freq[s] = skill_freq.get(s, 0) + 1

        # Sort skills by count descending
        sorted_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)
        return [{"skill": k, "count": v} for k, v in sorted_skills]

    @staticmethod
    def get_top_skills(limit=10):
        skills = AnalyticsService._get_skill_counts()
        return skills[:limit]

    @staticmethod
    def get_top_companies(limit=10):
        db = get_db()
        df_jobs = pd.DataFrame(list(db['jobs'].find({}, {'_id': 0})))
        df_internships = pd.DataFrame(list(db['internships'].find({}, {'_id': 0})))

        comp_counts = {}
        if not df_jobs.empty and 'company' in df_jobs.columns:
            for c in df_jobs['company'].dropna():
                comp_counts[c] = comp_counts.get(c, 0) + 1
        if not df_internships.empty and 'company' in df_internships.columns:
            for c in df_internships['company'].dropna():
                comp_counts[c] = comp_counts.get(c, 0) + 1

        sorted_comps = sorted(comp_counts.items(), key=lambda x: x[1], reverse=True)
        return [{"company": k, "count": v} for k, v in sorted_comps[:limit]]

    @staticmethod
    def get_salary_distribution():
        db = get_db()
        df = pd.DataFrame(list(db['jobs'].find({}, {'_id': 0})))
        if df.empty or 'salary_max_lpa' not in df.columns:
            return []

        df['mid_salary'] = (df['salary_min_lpa'] + df['salary_max_lpa']) / 2

        # NumPy binning
        bins = [0, 5, 8, 12, 18, 50]
        labels = ['< ₹5 LPA', '₹5–8 LPA', '₹8–12 LPA', '₹12–18 LPA', '> ₹18 LPA']
        df['salary_bucket'] = pd.cut(df['mid_salary'], bins=bins, labels=labels, right=False)

        counts = df['salary_bucket'].value_counts().reindex(labels, fill_value=0)
        return [{"range": str(k), "count": int(v)} for k, v in counts.items()]

    @staticmethod
    def get_stipend_trends():
        db = get_db()
        df = pd.DataFrame(list(db['internships'].find({}, {'_id': 0})))
        if df.empty or 'stipend_monthly' not in df.columns:
            return []

        bins = [0, 12000, 18000, 25000, 100000]
        labels = ['< ₹12k', '₹12k–18k', '₹18k–25k', '> ₹25k']
        df['stipend_bucket'] = pd.cut(df['stipend_monthly'], bins=bins, labels=labels, right=False)

        counts = df['stipend_bucket'].value_counts().reindex(labels, fill_value=0)
        return [{"range": str(k), "count": int(v)} for k, v in counts.items()]

    @staticmethod
    def get_locations_distribution():
        db = get_db()
        df_jobs = pd.DataFrame(list(db['jobs'].find({}, {'_id': 0})))
        df_internships = pd.DataFrame(list(db['internships'].find({}, {'_id': 0})))

        loc_counts = {}
        if not df_jobs.empty and 'location' in df_jobs.columns:
            for loc in df_jobs['location'].dropna():
                loc_counts[loc] = loc_counts.get(loc, 0) + 1
        if not df_internships.empty and 'location' in df_internships.columns:
            for loc in df_internships['location'].dropna():
                loc_counts[loc] = loc_counts.get(loc, 0) + 1

        sorted_locs = sorted(loc_counts.items(), key=lambda x: x[1], reverse=True)
        return [{"location": k, "count": v} for k, v in sorted_locs]

    @staticmethod
    def get_experience_distribution():
        db = get_db()
        df = pd.DataFrame(list(db['jobs'].find({}, {'_id': 0})))
        if df.empty or 'experience' not in df.columns:
            return []

        counts = df['experience'].value_counts()
        return [{"level": str(k), "count": int(v)} for k, v in counts.items()]

    @staticmethod
    def get_hiring_trends():
        # Simulated hiring trends per month for visualization
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
        job_postings = [28, 35, 42, 50, 65, 78, 92, 110, 125]
        internship_postings = [15, 20, 25, 30, 45, 55, 60, 75, 85]
        return {
            "months": months,
            "jobs": job_postings,
            "internships": internship_postings
        }
