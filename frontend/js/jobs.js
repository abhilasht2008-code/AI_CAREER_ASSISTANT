/**
 * JOBS & INTERNSHIPS MODULE - SEARCH, FILTERS & CARDS RENDERING
 */

async function loadJobsData() {
  const search = document.getElementById('jobSearchInput')?.value || '';
  const location = document.getElementById('jobLocationFilter')?.value || '';
  const experience = document.getElementById('jobExpFilter')?.value || '';
  const skill = document.getElementById('jobSkillFilter')?.value || '';

  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (location) queryParams.append('location', location);
  if (experience) queryParams.append('experience', experience);
  if (skill) queryParams.append('skill', skill);

  const container = document.getElementById('jobsContainer');
  if (!container) return;

  container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">Loading live job opportunities from MongoDB...</div>`;

  try {
    const res = await fetch(`${API_BASE}/jobs?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    const data = await res.json();

    document.getElementById('jobCountBadge').textContent = `${data.count} Jobs Found`;

    if (!data.jobs || data.jobs.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:4rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color);">
          <div style="font-size:2.5rem; margin-bottom:1rem;">🔍</div>
          <h3 style="color:var(--text-main); font-size:1.25rem;">No matching jobs found</h3>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.5rem;">Try adjusting your search query or clear filters to see available opportunities.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.jobs.map((job, idx) => `
      <div class="job-card">
        <div>
          <div class="job-card-header">
            <div>
              <h3 class="job-title">${escapeHtml(job.title)}</h3>
              <div class="job-company">🏢 ${escapeHtml(job.company)}</div>
            </div>
            <span class="badge" style="background:rgba(59, 130, 246, 0.15); color:var(--primary-blue); font-size:0.75rem; padding:3px 8px; border-radius:4px; border:1px solid rgba(59,130,246,0.3);">${escapeHtml(job.job_type)}</span>
          </div>

          <div class="job-meta-list">
            <span class="job-meta-item">📍 ${escapeHtml(job.location)}</span>
            <span class="job-meta-item">💼 Exp: ${escapeHtml(job.experience)}</span>
          </div>

          <div class="skills-tags">
            ${(job.skills || []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>

        <div class="job-card-footer">
          <div class="job-salary">${escapeHtml(job.salary)}</div>
          <button onclick="viewJobDetails(${idx})" class="btn btn-outline btn-sm">View Details</button>
        </div>
      </div>
    `).join('');

    // Cache current jobs list globally for modal inspection
    window.currentJobsList = data.jobs;

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--status-error);">Failed to load jobs. Please ensure backend server is running.</div>`;
  }
}

async function loadInternshipsData() {
  const search = document.getElementById('internSearchInput')?.value || '';
  const location = document.getElementById('internLocationFilter')?.value || '';
  const typeFilter = document.getElementById('internTypeFilter')?.value || '';

  const queryParams = new URLSearchParams();
  if (search) queryParams.append('search', search);
  if (location) queryParams.append('location', location);
  if (typeFilter) queryParams.append('internship_type', typeFilter);

  const container = document.getElementById('internshipsContainer');
  if (!container) return;

  container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">Loading live internship opportunities from MongoDB...</div>`;

  try {
    const res = await fetch(`${API_BASE}/internships?${queryParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch internships');
    const data = await res.json();

    document.getElementById('internCountBadge').textContent = `${data.count} Internships Found`;

    if (!data.internships || data.internships.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:4rem; background:var(--bg-card); border-radius:var(--radius-lg); border:1px solid var(--border-color);">
          <div style="font-size:2.5rem; margin-bottom:1rem;">💼</div>
          <h3 style="color:var(--text-main); font-size:1.25rem;">No internships found</h3>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-top:0.5rem;">Try adjusting search keywords or filters.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = data.internships.map((intern, idx) => `
      <div class="job-card">
        <div>
          <div class="job-card-header">
            <div>
              <h3 class="job-title">${escapeHtml(intern.title)}</h3>
              <div class="job-company">🏢 ${escapeHtml(intern.company)}</div>
            </div>
            <span class="badge" style="background:rgba(20, 184, 166, 0.15); color:var(--secondary-teal); font-size:0.75rem; padding:3px 8px; border-radius:4px; border:1px solid rgba(20,184,166,0.3);">${escapeHtml(intern.internship_type)}</span>
          </div>

          <div class="job-meta-list">
            <span class="job-meta-item">📍 ${escapeHtml(intern.location)}</span>
            <span class="job-meta-item">⏱️ Duration: ${escapeHtml(intern.duration)}</span>
          </div>

          <div class="skills-tags">
            ${(intern.skills || []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>

        <div class="job-card-footer">
          <div class="job-salary" style="color:var(--secondary-teal);">${escapeHtml(intern.stipend)}</div>
          <button onclick="viewInternshipDetails(${idx})" class="btn btn-outline btn-sm">View Internship</button>
        </div>
      </div>
    `).join('');

    window.currentInternshipsList = data.internships;

  } catch (err) {
    console.error(err);
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--status-error);">Failed to load internships.</div>`;
  }
}

function viewJobDetails(idx) {
  const job = window.currentJobsList ? window.currentJobsList[idx] : null;
  if (!job) return;

  const modal = document.getElementById('detailsModal');
  const modalBody = document.getElementById('modalDetailsContent');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <h2 style="font-size:1.4rem; color:var(--text-main); margin-bottom:0.25rem;">${escapeHtml(job.title)}</h2>
    <div style="font-size:1.05rem; color:var(--secondary-teal); font-weight:600; margin-bottom:1rem;">🏢 ${escapeHtml(job.company)}</div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; background:var(--bg-main); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; border:1px solid var(--border-color);">
      <div><strong style="color:var(--text-muted); font-size:0.85rem;">Location:</strong><br><span style="color:var(--text-main); font-weight:600;">📍 ${escapeHtml(job.location)}</span></div>
      <div><strong style="color:var(--text-muted); font-size:0.85rem;">Salary:</strong><br><span style="color:var(--status-success); font-weight:700;">💰 ${escapeHtml(job.salary)}</span></div>
      <div><strong style="color:var(--text-muted); font-size:0.85rem;">Experience Required:</strong><br><span style="color:var(--text-main);">💼 ${escapeHtml(job.experience)}</span></div>
      <div><strong style="color:var(--text-muted); font-size:0.85rem;">Job Type:</strong><br><span style="color:var(--primary-blue); font-weight:600;">🏷️ ${escapeHtml(job.job_type)}</span></div>
    </div>

    <div style="margin-bottom:1.25rem;">
      <h4 style="font-size:0.95rem; color:var(--text-main); margin-bottom:0.5rem;">Required Technical Skills</h4>
      <div class="skills-tags">
        ${(job.skills || []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:0.95rem; color:var(--text-main); margin-bottom:0.5rem;">Job Description</h4>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">${escapeHtml(job.description)}</p>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
      <button onclick="closeDetailsModal()" class="btn btn-outline">Close</button>
      <button onclick="showToast('Application link generated! Directing to verified job portal...', 'success'); closeDetailsModal();" class="btn btn-primary">Apply Now 🚀</button>
    </div>
  `;

  modal.classList.add('open');
}

function viewInternshipDetails(idx) {
  const item = window.currentInternshipsList ? window.currentInternshipsList[idx] : null;
  if (!item) return;

  const modal = document.getElementById('detailsModal');
  const modalBody = document.getElementById('modalDetailsContent');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <h2 style="font-size:1.4rem; color:var(--text-main); margin-bottom:0.25rem;">${escapeHtml(item.title)}</h2>
    <div style="font-size:1.05rem; color:var(--secondary-teal); font-weight:600; margin-bottom:1rem;">🏢 ${escapeHtml(item.company)}</div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; background:var(--bg-main); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; border:1px solid var(--border-color);">
      <div><strong style="color:var(--text-muted); font-size:0.85rem;">Location:</strong><br><span style="color:var(--text-main); font-weight:600;">📍 ${escapeHtml(item.location)}</span></div>
      <div><strong style="color:var(--text-muted); font-size:0.85rem;">Monthly Stipend:</strong><br><span style="color:var(--secondary-teal); font-weight:700;">💳 ${escapeHtml(item.stipend)}</span></div>
      <div><strong style="color:var(--text-muted); font-size:0.85rem;">Duration:</strong><br><span style="color:var(--text-main);">⏱️ ${escapeHtml(item.duration)}</span></div>
      <div><strong style="color:var(--text-muted); font-size:0.85rem;">Internship Type:</strong><br><span style="color:var(--primary-blue); font-weight:600;">🏷️ ${escapeHtml(item.internship_type)}</span></div>
    </div>

    <div style="margin-bottom:1.25rem;">
      <h4 style="font-size:0.95rem; color:var(--text-main); margin-bottom:0.5rem;">Required Skills</h4>
      <div class="skills-tags">
        ${(item.skills || []).map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('')}
      </div>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h4 style="font-size:0.95rem; color:var(--text-main); margin-bottom:0.5rem;">Internship Description</h4>
      <p style="font-size:0.9rem; color:var(--text-muted); line-height:1.6;">${escapeHtml(item.description)}</p>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:0.75rem;">
      <button onclick="closeDetailsModal()" class="btn btn-outline">Close</button>
      <button onclick="showToast('Internship application submitted! HR team will review your profile.', 'success'); closeDetailsModal();" class="btn btn-teal">Apply For Internship 🎓</button>
    </div>
  `;

  modal.classList.add('open');
}

function closeDetailsModal() {
  const modal = document.getElementById('detailsModal');
  if (modal) modal.classList.remove('open');
}
