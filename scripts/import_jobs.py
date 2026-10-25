import os
import sys
import pandas as pd
from datetime import datetime

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.db import get_db

def import_jobs():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'jobs.csv')
    if not os.path.exists(data_path):
        print(f" Error: {data_path} not found.")
        return

    print(f" Reading job dataset from {data_path}...")
    df = pd.read_csv(data_path)

    # Data Cleaning & Preprocessing using Pandas
    df['title'] = df['title'].str.strip()
    df['company'] = df['company'].str.strip()
    df['location'] = df['location'].str.strip()
    df['experience'] = df['experience'].str.strip()
    df['job_type'] = df['job_type'].fillna('Full-Time').str.strip()
    df['source'] = df['source'].fillna('Market Dataset').str.strip()
    df['salary_min_lpa'] = pd.to_numeric(df['salary_min_lpa'], errors='coerce').fillna(4.0)
    df['salary_max_lpa'] = pd.to_numeric(df['salary_max_lpa'], errors='coerce').fillna(8.0)

    db = get_db()
    jobs_col = db['jobs']
    skills_col = db['skills']
    career_col = db['career_profiles']

    # Clear previous sample jobs to avoid duplicates during import
    jobs_col.delete_many({})

    job_docs = []
    skill_counter = {}

    for _, row in df.iterrows():
        raw_skills_str = str(row['skills'])
        if ';' in raw_skills_str:
            raw_skills = raw_skills_str.split(';')
        else:
            raw_skills = raw_skills_str.split(',')
        clean_skills = [s.strip() for s in raw_skills if s.strip()]

        for s in clean_skills:
            skill_counter[s] = skill_counter.get(s, 0) + 1

        doc = {
            "title": row['title'],
            "company": row['company'],
            "location": row['location'],
            "skills": clean_skills,
            "experience": row['experience'],
            "salary_min_lpa": float(row['salary_min_lpa']),
            "salary_max_lpa": float(row['salary_max_lpa']),
            "salary": f"₹{row['salary_min_lpa']}–{row['salary_max_lpa']} LPA",
            "job_type": row['job_type'],
            "description": row['description'],
            "source": row['source'],
            "created_at": datetime.now().isoformat()
        }
        job_docs.append(doc)

    if job_docs:
        jobs_col.insert_many(job_docs)
        print(f" Successfully imported {len(job_docs)} jobs into MongoDB.")

    # Populate/Update skills collection
    for skill, count in skill_counter.items():
        skills_col.update_one(
            {"name": skill},
            {"$set": {"name": skill}, "$inc": {"demand_count": count}},
            upsert=True
        )
    print(f" Updated {len(skill_counter)} distinct skills in MongoDB.")

    # Populate predefined career profiles
    careers_data = [
        {
            "career_name": "Python Developer",
            "required_skills": ["Python", "Flask", "MongoDB", "SQL", "REST API", "Git"],
            "recommended_tools": ["PyCharm", "VS Code", "Postman", "Docker"],
            "certifications": ["Python Institute PCAP", "MongoDB Certified Developer", "AWS Certified Developer"]
        },
        {
            "career_name": "Data Analyst",
            "required_skills": ["Python", "SQL", "Pandas", "NumPy", "Tableau", "Excel", "Power BI"],
            "recommended_tools": ["Jupyter Notebook", "Tableau Desktop", "Power BI Desktop", "PostgreSQL"],
            "certifications": ["Google Data Analytics Professional", "Microsoft Certified Data Analyst", "Tableau Desktop Specialist"]
        },
        {
            "career_name": "Java Developer",
            "required_skills": ["Java", "Spring Boot", "MySQL", "REST API", "Git", "Maven"],
            "recommended_tools": ["IntelliJ IDEA", "Eclipse", "Postman", "Jenkins"],
            "certifications": ["Oracle Certified Professional Java SE", "Spring Certified Professional"]
        },
        {
            "career_name": "Frontend Developer",
            "required_skills": ["HTML", "CSS", "JavaScript", "React", "REST API", "Git"],
            "recommended_tools": ["VS Code", "Chrome DevTools", "Figma", "Webpack"],
            "certifications": ["Meta Front-End Developer Certificate", "FreeCodeCamp Responsive Web Design"]
        },
        {
            "career_name": "Backend Developer",
            "required_skills": ["Python", "Django", "Node.js", "MongoDB", "PostgreSQL", "REST API", "Redis"],
            "recommended_tools": ["Postman", "Docker", "GitLab", "Swagger"],
            "certifications": ["AWS Solutions Architect", "Node.js Certified Developer"]
        },
        {
            "career_name": "Full Stack Engineer",
            "required_skills": ["Python", "React", "JavaScript", "MongoDB", "Node.js", "REST API", "Git", "AWS"],
            "recommended_tools": ["VS Code", "Postman", "Docker", "GitHub Actions"],
            "certifications": ["AWS Certified Full Stack", "Meta Full-Stack Developer Certificate"]
        },
        {
            "career_name": "Machine Learning Engineer",
            "required_skills": ["Python", "Machine Learning", "Pandas", "NumPy", "Scikit-Learn", "TensorFlow", "SQL", "Docker"],
            "recommended_tools": ["JupyterLab", "Google Colab", "MLflow", "Docker"],
            "certifications": ["TensorFlow Developer Certificate", "AWS Certified Machine Learning Specialty"]
        }
    ]

    for career in careers_data:
        career_col.update_one(
            {"career_name": career["career_name"]},
            {"$set": career},
            upsert=True
        )
    print(f" Populated {len(careers_data)} career profiles into MongoDB.")

if __name__ == '__main__':
    import_jobs()
