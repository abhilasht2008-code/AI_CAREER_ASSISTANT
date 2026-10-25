from flask import Blueprint, request, jsonify
from backend.db import get_db

jobs_bp = Blueprint('jobs', __name__)

@jobs_bp.route('', methods=['GET'])
def get_jobs():
    search = request.args.get('search', '').strip()
    location = request.args.get('location', '').strip()
    experience = request.args.get('experience', '').strip()
    skill = request.args.get('skill', '').strip()
    min_salary = request.args.get('min_salary', type=float)

    db = get_db()
    jobs_col = db['jobs']

    query = {}

    if search:
        regex_pattern = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"title": regex_pattern},
            {"company": regex_pattern},
            {"skills": regex_pattern},
            {"location": regex_pattern}
        ]

    if location:
        query["location"] = {"$regex": location, "$options": "i"}

    if experience:
        query["experience"] = {"$regex": experience, "$options": "i"}

    if skill:
        query["skills"] = {"$regex": skill, "$options": "i"}

    if min_salary is not None:
        query["salary_max_lpa"] = {"$gte": min_salary}

    jobs_cursor = jobs_col.find(query, {'_id': 0})
    jobs = list(jobs_cursor)

    return jsonify({
        "count": len(jobs),
        "jobs": jobs
    }), 200

@jobs_bp.route('/<int:job_id>', methods=['GET'])
def get_job_by_id(job_id):
    db = get_db()
    jobs = list(db['jobs'].find({}, {'_id': 0}))
    if 0 <= job_id < len(jobs):
        return jsonify(jobs[job_id]), 200
    return jsonify({"error": "Job not found"}), 404
