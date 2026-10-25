import os
import io
from flask import Blueprint, request, jsonify
from datetime import datetime
from backend.services.resume_service import ResumeService
from backend.db import get_db

resume_bp = Blueprint('resume', __name__)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resume_bp.route('/analyze', methods=['POST'])
def analyze_resume():
    if 'resume' not in request.files:
        return jsonify({"error": "No resume PDF file uploaded in request."}), 400

    file = request.files['resume']
    if file.filename == '':
        return jsonify({"error": "No file selected for upload."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file format. Please upload a PDF file (.pdf)."}), 400

    try:
        # Read PDF binary stream directly into memory (zero mandatory disk clutter)
        pdf_stream = io.BytesIO(file.read())
        extracted_text = ResumeService.extract_text_from_pdf(pdf_stream)

        if not extracted_text or len(extracted_text.strip()) < 15:
            return jsonify({"error": "Could not extract readable text from PDF. Ensure the PDF contains text rather than scanned images."}), 400

        # Perform skill, gap, career matching and learning roadmap analysis
        analysis_result = ResumeService.analyze_resume(extracted_text)

        if "error" in analysis_result:
            return jsonify(analysis_result), 400

        # Store analysis record in MongoDB for user history
        user_id = request.form.get('user_id', 'anonymous_user')
        db = get_db()
        doc = {
            "user_id": user_id,
            "filename": file.filename,
            "overall_match_score": analysis_result["overall_match_score"],
            "detected_skills": analysis_result["detected_skills"],
            "missing_skills": analysis_result["missing_skills"],
            "matched_careers": analysis_result["matched_careers"],
            "created_at": datetime.now().isoformat()
        }
        res = db['resume_analyses'].insert_one(doc)
        analysis_result["analysis_id"] = str(res.inserted_id)

        return jsonify({
            "message": "Resume analyzed successfully!",
            "data": analysis_result
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error analyzing resume: {str(e)}"}), 500
