from flask import Blueprint, jsonify
from backend.services.analytics_service import AnalyticsService

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/stats', methods=['GET'])
def get_stats():
    return jsonify(AnalyticsService.get_dashboard_stats()), 200

@dashboard_bp.route('/skills', methods=['GET'])
def get_skills():
    return jsonify(AnalyticsService.get_top_skills(10)), 200

@dashboard_bp.route('/companies', methods=['GET'])
def get_companies():
    return jsonify(AnalyticsService.get_top_companies(10)), 200

@dashboard_bp.route('/salaries', methods=['GET'])
def get_salaries():
    return jsonify(AnalyticsService.get_salary_distribution()), 200

@dashboard_bp.route('/stipends', methods=['GET'])
def get_stipends():
    return jsonify(AnalyticsService.get_stipend_trends()), 200

@dashboard_bp.route('/locations', methods=['GET'])
def get_locations():
    return jsonify(AnalyticsService.get_locations_distribution()), 200

@dashboard_bp.route('/experience', methods=['GET'])
def get_experience():
    return jsonify(AnalyticsService.get_experience_distribution()), 200

@dashboard_bp.route('/trends', methods=['GET'])
def get_trends():
    return jsonify(AnalyticsService.get_hiring_trends()), 200
