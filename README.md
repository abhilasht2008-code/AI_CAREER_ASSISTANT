# AI Career Assistant — Job & Internship Market Analysis Using Data Science

**B.Tech Data Analysis Essentials (DAE) Capstone Web Application**

---

## 📌 1. PROJECT OVERVIEW

The **AI Career Assistant** is a full-stack, data-driven web application designed to help students, fresh graduates, and career seekers analyze real job market demand, identify in-demand technical skills, compare salary structures and internship stipends, evaluate target career roles, and receive customized learning roadmaps based on PDF resume text extraction.

The application combines **Python Data Analytics (Pandas, NumPy)**, **MongoDB**, **Flask REST APIs**, and a **Modern Dark SaaS Dashboard** powered by Vanilla JavaScript and Chart.js.

---

## 🎯 2. PROBLEM STATEMENT

Students and fresh graduates often struggle to identify the exact technical skills, tools, companies, locations, and compensation ranges that are currently in demand in the tech market. They lack an effective mechanism to evaluate whether their current resume skills match available job openings.

This uncertainty can lead students to spend hundreds of hours learning obsolete tools. This platform solves the problem by providing real-time data science insights, PDF resume parsing, skill gap analysis, job matching, and a prioritized learning roadmap.

---

## 🛠️ 3. TECHNOLOGY STACK

### **Frontend**
- **HTML5 & Vanilla CSS3**: Custom design system styled in a high-end dark SaaS theme (`#0B1220`, `#111C2E`, `#3B82F6`, `#14B8A6`).
- **Vanilla JavaScript (ES6+)**: SPA router, modal state management, async `fetch` API handlers, zero heavy framework lock-in (optimized for B.Tech demonstration).
- **Chart.js**: Interactive bar, pie, doughnut, line, and histogram chart visualizations.

### **Backend**
- **Python 3**: Core backend execution environment.
- **Flask & Flask REST APIs**: Modular blueprints for authentication, jobs, internships, analytics dashboard, career recommendations, and resume processing.
- **Werkzeug Security**: Hashed user password storage (`generate_password_hash`, `check_password_hash`).

### **Data Science & Database**
- **MongoDB & PyMongo**: Multi-collection database (`users`, `jobs`, `internships`, `skills`, `career_profiles`, `resume_analyses`) with automatic fallback to `mongomock` in-memory execution.
- **Pandas & NumPy**: Data cleaning, missing-value handling, grouping, aggregation, skill frequency counting, salary binnings, and stipend distributions.
- **PyPDF**: Automated PDF text extraction for PDF resume skill parsing.

---

## 🗄️ 4. DATABASE SCHEMAS (MONGODB)

- **`users`**: User authentication profiles, education degree, branch, graduation year, and career interests.
- **`jobs`**: Job postings containing title, company, location, required skills list, experience level, salary range (LPA), job type, and description.
- **`internships`**: Internship postings containing title, company, location, required skills list, duration, monthly stipend, type (Hybrid/Remote/On-site).
- **`skills`**: Master taxonomy of technical skills and market frequency demand counts.
- **`career_profiles`**: Career role definitions, required skills, recommended tools/IDEs, and certifications.
- **`resume_analyses`**: Stored PDF resume analysis results, extracted skills, missing skills, career match percentages, and learning roadmaps.

---

## 🚀 5. HOW TO RUN THE APPLICATION LOCALLY

### **Prerequisites**
- Python 3.10+ installed on your system.
- Git & Pip installed.

### **Step 1: Clone or Navigate to Project Directory**
```bash
cd "c:\Users\ABHILASH\Desktop\DAE MAIN"
```

### **Step 2: Install Required Dependencies**
```bash
pip install -r backend/requirements.txt
```

### **Step 3: Import Sample Datasets into MongoDB**
Run the automated preprocessing and dataset ingestion scripts:
```bash
python scripts/import_jobs.py
python scripts/import_internships.py
```
*(Note: If a local MongoDB daemon is not running, the application automatically uses an in-memory MongoMock database seamlessly so you can present without setup friction!)*

### **Step 4: Launch Flask Backend Server**
```bash
python backend/app.py
```

### **Step 5: Open Application in Web Browser**
Open your browser and navigate to:
```text
http://127.0.0.1:5000
```

---

## 📄 6. AI RESUME ANALYZER WORKFLOW

1. **Upload PDF**: User drags & drops or browses a `.pdf` resume file.
2. **Text Extraction**: Flask backend invokes `pypdf` to extract raw resume text.
3. **Skill Detection**: `ResumeService` scans extracted text against a master taxonomy of 100+ technical skills.
4. **Market Gap Analysis**: Detected skills are compared against live MongoDB market demand counts.
5. **Project-generated Match Score**: Calculates a transparent match score (0–100%) based on target skill overlap and experience indicators.
6. **Role Match Alignment**: Computes alignment percentage across 7 target careers (Python Developer, Data Analyst, Java Developer, Frontend Developer, Backend Developer, Full Stack Engineer, Machine Learning Engineer).
7. **Job Recommendations**: Queries MongoDB to recommend jobs matching candidate skills.
8. **Personalized Learning Roadmap**: Generates a High / Medium / Low priority learning roadmap based on skill market demand counts.

---

## 🌐 7. REST API ENDPOINTS

| HTTP Method | API Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new student account (hashed password) |
| `POST` | `/api/auth/login` | Authenticate user and return session token |
| `GET` | `/api/jobs` | Search & filter jobs by title, skill, location, experience |
| `GET` | `/api/internships` | Search & filter internships by location, stipend, type |
| `GET` | `/api/dashboard/stats` | Retrieve total jobs, internships, companies, top skill, avg salary |
| `GET` | `/api/dashboard/skills` | Retrieve top demanded technical skills frequency |
| `GET` | `/api/dashboard/companies` | Retrieve top hiring companies count |
| `GET` | `/api/dashboard/salaries` | Retrieve binned salary distribution histogram |
| `GET` | `/api/dashboard/stipends` | Retrieve binned internship stipend distribution |
| `GET` | `/api/dashboard/locations` | Retrieve job & internship counts by location |
| `GET` | `/api/dashboard/trends` | Retrieve hiring momentum timeline |
| `POST` | `/api/career/recommend` | Generate career match %, missing skills & tool recommendations |
| `POST` | `/api/resume/analyze` | Process PDF resume file upload & generate complete market report |

---

## 🎨 8. DESIGN SYSTEM PALETTE

- **Main Background**: `#0B1220`
- **Card Background**: `#111C2E`
- **Primary Blue**: `#3B82F6`
- **Secondary Teal**: `#14B8A6`
- **Success Accent**: `#22C55E`
- **Warning Accent**: `#F59E0B`
- **Error Accent**: `#EF4444`

---

## 📜 9. B.TECH PRESENTATION SUMMARY
- **Domain**: Data Science & Full-Stack Web Development
- **Course**: B.Tech Data Analysis Essentials (DAE)
- **Key Modules**: Data Preprocessing, Data Aggregation (Pandas/NumPy), Document Database (MongoDB), RESTful Services (Flask), Data Visualization (Chart.js), PDF Text Processing (`pypdf`), Skill Matching Algorithms.
