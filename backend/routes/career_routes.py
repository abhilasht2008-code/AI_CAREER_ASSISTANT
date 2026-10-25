from flask import Blueprint, request, jsonify
from backend.db import get_db
from backend.services.recommendation_service import RecommendationService

career_bp = Blueprint('career', __name__)

@career_bp.route('/profiles', methods=['GET'])
def get_profiles():
    db = get_db()
    profiles = list(db['career_profiles'].find({}, {'_id': 0}))
    return jsonify(profiles), 200

@career_bp.route('/recommend', methods=['POST'])
def recommend_career():
    data = request.get_json() or {}
    target_career = data.get('target_career', 'Python Developer')
    user_skills = data.get('skills', [])

    if isinstance(user_skills, str):
        user_skills = [s.strip() for s in user_skills.split(',') if s.strip()]

    result = RecommendationService.get_career_recommendation(target_career, user_skills)
    return jsonify(result), 200
