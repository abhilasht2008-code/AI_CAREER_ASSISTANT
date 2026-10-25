import os
import sys
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

# Ensure root directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.config import Config
from backend.db import get_db
from backend.routes.auth_routes import auth_bp
from backend.routes.jobs_routes import jobs_bp
from backend.routes.internships_routes import internships_bp
from backend.routes.dashboard_routes import dashboard_bp
from backend.routes.career_routes import career_bp
from backend.routes.resume_routes import resume_bp

def create_app():
    frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
    app = Flask(__name__, static_folder=frontend_dir, static_url_path='')
    app.config.from_object(Config)

    # Enable CORS for all routes
    CORS(app)

    # Register API Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(internships_bp, url_prefix='/api/internships')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(career_bp, url_prefix='/api/career')
    app.register_blueprint(resume_bp, url_prefix='/api/resume')

    # Serve Frontend Single Page App
    @app.route('/')
    def serve_frontend():
        return send_from_directory(frontend_dir, 'index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        if os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)
        return send_from_directory(frontend_dir, 'index.html')

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource or endpoint not found."}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "An internal server error occurred. Please try again."}), 500

    # Auto-seed database if empty on startup
    with app.app_context():
        try:
            db = get_db()
            if db['jobs'].count_documents({}) == 0:
                print(" Database empty. Auto-seeding market data...")
                from scripts.import_jobs import import_jobs
                from scripts.import_internships import import_internships
                import_jobs()
                import_internships()
        except Exception as err:
            print(f" Note during DB initialization: {err}")

    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f" Starting AI Career Assistant Server on http://127.0.0.1:{port}")
    app.run(host='0.0.0.0', port=port, debug=True)
