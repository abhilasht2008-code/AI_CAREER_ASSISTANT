import sys
import os
sys.path.insert(0, os.path.abspath('.'))
import urllib.request
import json
from backend.services.resume_service import ResumeService

pdf_text = """
Abhilash Student
Email: abhilash@student.edu | Degree: B.Tech Computer Science 2026
Career Objective: Seeking a role as a Python Developer / Data Analyst.

Technical Skills:
- Programming Languages: Python, SQL, Java, C++
- Web Development: HTML, CSS, Flask, REST API
- Databases: MongoDB, MySQL
- Data Analysis: Pandas, NumPy, Tableau
- Version Control: Git, GitHub

Projects:
- E-Commerce Web Application built with Python Flask and MongoDB.
- Student Performance Data Analytics using Pandas and Matplotlib.
"""

print(" Direct Testing ResumeService.analyze_resume()...")
result = ResumeService.analyze_resume(pdf_text)
print(" Analysis Result:")
print(json.dumps(result, indent=2))
