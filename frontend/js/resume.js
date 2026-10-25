/**
 * AI RESUME ANALYZER MODULE - PDF PARSING & MARKET MATCHING UI
 */

let selectedResumeFile = null;

document.addEventListener('DOMContentLoaded', () => {
  initResumeUploadZone();
});

function initResumeUploadZone() {
  const dropZone = document.getElementById('resumeDropZone');
  const fileInput = document.getElementById('resumeFileInput');

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add('dragover');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('dragover');
    }, false);
  });

  dropZone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files && files[0]) {
      handleFileSelected(files[0]);
    }
  });
}

function handleFileSelected(file) {
  // Validate file format
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    showToast('Invalid file format! Please upload a PDF resume (.pdf).', 'error');
    return;
  }

  // Validate file size (16MB limit)
  if (file.size > 16 * 1024 * 1024) {
    showToast('File size exceeds 16 MB limit.', 'error');
    return;
  }

  selectedResumeFile = file;
  document.getElementById('selectedFileName').textContent = `📄 Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  document.getElementById('analyzeResumeBtn').disabled = false;
  showToast('PDF Resume uploaded! Click "Analyze Resume" to scan.', 'success');
}

async function handleAnalyzeResumeSubmit() {
  if (!selectedResumeFile) {
    showToast('Please select a PDF resume file first.', 'error');
    return;
  }

  const outputContainer = document.getElementById('resumeAnalysisResult');
  const btn = document.getElementById('analyzeResumeBtn');

  btn.disabled = true;
  btn.innerHTML = `⏳ Analyzing PDF with Data Science Model...`;
  outputContainer.style.display = 'block';
  outputContainer.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">Extracting resume text, parsing technical skills, and comparing against live MongoDB job market data...</div>`;

  const formData = new FormData();
  formData.append('resume', selectedResumeFile);
  if (AppState.currentUser) {
    formData.append('user_id', AppState.currentUser.email);
  }

  try {
    const res = await fetch(`${API_BASE}/resume/analyze`, {
      method: 'POST',
      body: formData
    });

    const responseData = await res.json();

    if (!res.ok) {
      showToast(responseData.error || 'Failed to analyze resume.', 'error');
      outputContainer.innerHTML = `<div style="padding:2rem; color:var(--status-error); text-align:center;">${escapeHtml(responseData.error || 'Failed to analyze resume.')}</div>`;
      btn.disabled = false;
      btn.innerHTML = `⚡ Analyze Resume`;
      return;
    }

    const data = responseData.data;
    renderResumeAnalysisOutput(data);

    btn.disabled = false;
    btn.innerHTML = `⚡ Analyze Resume`;
    showToast('Resume Analysis Complete!', 'success');

  } catch (err) {
    console.error(err);
    showToast('Network error while analyzing resume.', 'error');
    btn.disabled = false;
    btn.innerHTML = `⚡ Analyze Resume`;
  }
}

function renderResumeAnalysisOutput(data) {
  const container = document.getElementById('resumeAnalysisResult');
  if (!container) return;

  const score = data.overall_match_score;
  const scoreColor = score >= 75 ? 'var(--status-success)' : (score >= 50 ? 'var(--status-warning)' : 'var(--status-error)');

  container.innerHTML = `
    <!-- 1. Match Score Banner -->
    <div class="match-score-card">
      <div style="font-size:0.9rem; color:var(--text-muted); font-weight:600; text-transform:uppercase;">Overall Market Match Score</div>
      <div class="score-circle-container">
        <div class="score-number" style="color:${scoreColor};">${score}%</div>
      </div>
      <div class="score-label-sub">${escapeHtml(data.score_label)}</div>
      <div style="max-width:550px; margin:0.75rem auto 0 auto; font-size:0.875rem; color:var(--text-muted);">
        Calculated based on detected technical skills, market demand frequency, and career alignment.
      </div>
    </div>

    <!-- 2. Skills Detected vs Missing -->
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:1.5rem; margin-top:2rem;">
      <div class="card">
        <h3 style="font-size:1.1rem; color:var(--status-success); margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
          ✓ Skills Detected in Resume (${(data.detected_skills || []).length})
        </h3>
        <div class="skills-tags">
          ${(data.detected_skills || []).map(s => `<span class="skill-tag" style="background:rgba(34, 197, 94, 0.15); color:#86EFAC; border-color:rgba(34,197,94,0.3);">✓ ${escapeHtml(s)}</span>`).join('') || '<span style="color:var(--text-dim);">No specific technical skills extracted.</span>'}
        </div>
      </div>

      <div class="card">
        <h3 style="font-size:1.1rem; color:var(--status-warning); margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem;">
          ⚠ Top In-Demand Missing Skills
        </h3>
        <div class="skills-tags">
          ${(data.missing_skills || []).map(s => `<span class="skill-tag missing">⚠ ${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>
    </div>

    <!-- 3. Career Role Matching -->
    <div class="card" style="margin-top:2rem;">
      <h3 style="font-size:1.25rem; color:var(--text-main); margin-bottom:1rem;">🎯 Target Career Role Alignment</h3>
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1rem;">
        ${(data.matched_careers || []).map(c => `
          <div style="background:var(--bg-main); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
              <strong style="color:var(--text-main);">${escapeHtml(c.career_name)}</strong>
              <span style="font-weight:800; color:${c.match_percentage >= 70 ? 'var(--status-success)' : 'var(--primary-blue)'};">${c.match_percentage}%</span>
            </div>
            <div style="width:100%; height:6px; background:#1E293B; border-radius:3px; overflow:hidden; margin-bottom:0.5rem;">
              <div style="width:${c.match_percentage}%; height:100%; background:linear-gradient(90deg, var(--primary-blue), var(--secondary-teal));"></div>
            </div>
            <div style="font-size:0.75rem; color:var(--text-muted);">
              Matching: ${(c.matching_skills || []).slice(0,3).join(', ')}...
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 4. Recommended Jobs & Internships -->
    <div style="margin-top:2rem;">
      <h3 style="font-size:1.25rem; color:var(--text-main); margin-bottom:1rem;">💼 Recommended Opportunities Based On Resume</h3>
      <div class="jobs-list-grid">
        ${(data.recommended_jobs || []).map(j => `
          <div class="job-card">
            <div>
              <div class="job-card-header">
                <div>
                  <h4 class="job-title" style="font-size:1.05rem;">${escapeHtml(j.title)}</h4>
                  <div class="job-company">${escapeHtml(j.company)}</div>
                </div>
                <span class="badge" style="background:rgba(34, 197, 94, 0.15); color:var(--status-success); font-size:0.75rem; padding:2px 6px;">${j.match_percentage}% Match</span>
              </div>
              <div class="job-meta-list">
                <span>📍 ${escapeHtml(j.location)}</span>
                <span>💰 ${escapeHtml(j.salary)}</span>
              </div>
            </div>
            <div class="job-card-footer">
              <span class="skill-tag">${escapeHtml(j.job_type)}</span>
              <button onclick="window.location.hash='jobs'" class="btn btn-outline btn-sm">View Job</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 5. Personalized Learning Roadmap -->
    <div class="card" style="margin-top:2rem;">
      <h3 style="font-size:1.25rem; color:var(--text-main); margin-bottom:0.5rem;">🗺️ Personalized Skill Roadmap</h3>
      <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:1rem;">Prioritized recommendations to boost your resume match percentage based on real MongoDB job frequencies.</p>
      <div class="roadmap-list">
        ${(data.learning_roadmap || []).map((item, idx) => `
          <div class="roadmap-item">
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <span style="font-weight:800; color:var(--primary-blue); font-size:1.1rem;">#${idx+1}</span>
              <div>
                <div style="font-weight:700; color:var(--text-main);">${escapeHtml(item.skill)}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(item.reason)}</div>
              </div>
            </div>
            <span class="roadmap-badge ${item.priority.toLowerCase()}">${escapeHtml(item.priority)} Priority</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
