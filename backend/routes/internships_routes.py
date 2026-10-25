from flask import Blueprint, request, jsonify
from backend.db import get_db

internships_bp = Blueprint('internships', __name__)

@internships_bp.route('', methods=['GET'])
def get_internships():
    search = request.args.get('search', '').strip()
    location = request.args.get('location', '').strip()
    duration = request.args.get('duration', '').strip()
    skill = request.args.get('skill', '').strip()
    internship_type = request.args.get('internship_type', '').strip()
    min_stipend = request.args.get('min_stipend', type=float)

    db = get_db()
    internships_col = db['internships']

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

    if duration:
        query["duration"] = {"$regex": duration, "$options": "i"}

    if skill:
        query["skills"] = {"$regex": skill, "$options": "i"}

    if internship_type:
        query["internship_type"] = {"$regex": internship_type, "$options": "i"}

    if min_stipend is not None:
        query["stipend_monthly"] = {"$gte": min_stipend}

    cursor = internships_col.find(query, {'_id': 0})
    internships = list(cursor)

    return jsonify({
        "count": len(internships),
        "internships": internships
    }), 200
