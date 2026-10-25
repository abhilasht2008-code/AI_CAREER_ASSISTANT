import os
import sys
import pandas as pd
from datetime import datetime

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.db import get_db

def import_internships():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'internships.csv')
    if not os.path.exists(data_path):
        print(f" Error: {data_path} not found.")
        return

    print(f" Reading internship dataset from {data_path}...")
    df = pd.read_csv(data_path)

    # Data Cleaning & Preprocessing using Pandas
    df['title'] = df['title'].str.strip()
    df['company'] = df['company'].str.strip()
    df['location'] = df['location'].str.strip()
    df['duration'] = df['duration'].str.strip()
    df['internship_type'] = df['internship_type'].fillna('Hybrid').str.strip()
    df['source'] = df['source'].fillna('Market Dataset').str.strip()
    df['stipend_monthly'] = pd.to_numeric(df['stipend_monthly'], errors='coerce').fillna(15000)

    db = get_db()
    internships_col = db['internships']
    skills_col = db['skills']

    # Clear previous sample internships to avoid duplicates during import
    internships_col.delete_many({})

    internship_docs = []
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
            "duration": row['duration'],
            "stipend_monthly": float(row['stipend_monthly']),
            "stipend": f"₹{int(row['stipend_monthly']):,}/month",
            "internship_type": row['internship_type'],
            "description": row['description'],
            "source": row['source'],
            "created_at": datetime.now().isoformat()
        }
        internship_docs.append(doc)

    if internship_docs:
        internships_col.insert_many(internship_docs)
        print(f" Successfully imported {len(internship_docs)} internships into MongoDB.")

    # Update skills demand count
    for skill, count in skill_counter.items():
        skills_col.update_one(
            {"name": skill},
            {"$set": {"name": skill}, "$inc": {"demand_count": count}},
            upsert=True
        )
    print(f" Updated skill demand counts from internship dataset.")

if __name__ == '__main__':
    import_internships()
