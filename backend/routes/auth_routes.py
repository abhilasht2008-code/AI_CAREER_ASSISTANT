from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from backend.db import get_db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    
    name = data.get('name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required fields."}), 400

    db = get_db()
    users_col = db['users']

    if users_col.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists."}), 400

    # Secure Password Hashing
    password_hash = generate_password_hash(password)

    user_doc = {
        "name": name,
        "email": email,
        "password_hash": password_hash,
        "education": data.get('education', ''),
        "degree": data.get('degree', ''),
        "branch": data.get('branch', ''),
        "graduation_year": data.get('graduation_year', ''),
        "career_interest": data.get('career_interest', ''),
        "skills": data.get('skills', []),
        "created_at": datetime.now().isoformat()
    }

    users_col.insert_one(user_doc)

    return jsonify({
        "message": "Registration successful!",
        "user": {
            "name": name,
            "email": email,
            "degree": user_doc["degree"],
            "career_interest": user_doc["career_interest"]
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    db = get_db()
    user = db['users'].find_one({"email": email})

    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid email or password."}), 401

    return jsonify({
        "message": "Login successful!",
        "token": f"token-{user['email']}",
        "user": {
            "name": user.get('name'),
            "email": user.get('email'),
            "degree": user.get('degree'),
            "branch": user.get('branch'),
            "graduation_year": user.get('graduation_year'),
            "career_interest": user.get('career_interest')
        }
    }), 200
