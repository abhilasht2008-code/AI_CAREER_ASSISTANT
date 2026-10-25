/**
 * CAREER RECOMMENDATIONS MODULE
 */

async function handleGenerateCareerRecommendation() {
  const targetCareer = document.getElementById('careerTargetSelect').value;
  const skillsInput = document.getElementById('userSkillsInput').value;

  const resultContainer = document.getElementById('careerResultContainer');
  resultContainer.style.display = 'block';
  resultContainer.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">Analyzing market data for <strong>${escapeHtml(targetCareer)}</strong>...</div>`;

  try {
    const res = await fetch(`${API_BASE}/career/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_career: targetCareer,
        skills: skillsInput
      })
    });

    if (!res.ok) throw new Error('Failed to generate career recommendation');
    const data = await res.json();

    const matchPct = data.match_percentage;
    const matchColor = matchPct >= 70 ? 'var(--status-success)' : (matchPct >= 45 ? 'var(--status-warning)' : 'var(--status-error)');

    resultContainer.innerHTML = `
      <div class="card" style="margin-top:1.5rem; border-color:var(--border-glow);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-color);">
          <div>
            <h3 style="font-size:1.5rem; color:var(--text-main); font-weight:800;">Target Role: ${escapeHtml(data.target_career)}</h3>
            <p style="color:var(--text-muted); font-size:0.9rem;">Market alignment based on current database requirements</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:2.25rem; font-weight:800; color:${matchColor};">${matchPct}%</div>
            <div style="font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">Career Match Score</div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem; margin-bottom:1.5rem;">
          <div style="background:var(--bg-main); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <h4 style="color:var(--status-success); font-size:1rem; margin-bottom:0.75rem;">✓ Existing Skills Matched (${(data.existing_skills || []).length})</h4>
            <div class="skills-tags">
              ${(data.existing_skills || []).map(s => `<span class="skill-tag" style="background:rgba(34, 197, 94, 0.15); color:#86EFAC; border-color:rgba(34,197,94,0.3);">✓ ${escapeHtml(s)}</span>`).join('') || '<span style="color:var(--text-dim); font-size:0.85rem;">None matched yet</span>'}
            </div>
          </div>

          <div style="background:var(--bg-main); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <h4 style="color:var(--status-warning); font-size:1rem; margin-bottom:0.75rem;">⚠ Missing Skills To Learn (${(data.missing_skills || []).length})</h4>
            <div class="skills-tags">
              ${(data.missing_skills || []).map(s => `<span class="skill-tag missing">⚠ ${escapeHtml(s)}</span>`).join('') || '<span style="color:var(--status-success); font-size:0.85rem;">All target skills acquired!</span>'}
            </div>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:1.5rem; margin-bottom:1.5rem;">
          <div style="background:var(--bg-main); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <h4 style="color:var(--primary-blue); font-size:0.95rem; margin-bottom:0.5rem;">🛠️ Recommended Tools & IDEs</h4>
            <ul style="list-style-type:none; color:var(--text-muted); font-size:0.9rem; display:flex; flex-direction:column; gap:0.35rem;">
              ${(data.recommended_tools || []).map(t => `<li>🔹 ${escapeHtml(t)}</li>`).join('')}
            </ul>
          </div>

          <div style="background:var(--bg-main); padding:1.25rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
            <h4 style="color:var(--secondary-teal); font-size:0.95rem; margin-bottom:0.5rem;">📜 Recommended Certifications</h4>
            <ul style="list-style-type:none; color:var(--text-muted); font-size:0.9rem; display:flex; flex-direction:column; gap:0.35rem;">
              ${(data.recommended_certifications || []).map(c => `<li>🏆 ${escapeHtml(c)}</li>`).join('')}
            </ul>
          </div>
        </div>

        ${data.recommended_jobs && data.recommended_jobs.length > 0 ? `
          <div style="margin-top:1.5rem;">
            <h4 style="color:var(--text-main); font-size:1.1rem; margin-bottom:1rem;">Top Matching Jobs For This Role</h4>
            <div class="jobs-list-grid">
              ${data.recommended_jobs.map(j => `
                <div style="background:var(--bg-main); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color);">
                  <strong style="color:var(--text-main);">${escapeHtml(j.title)}</strong>
                  <div style="font-size:0.85rem; color:var(--secondary-teal);">${escapeHtml(j.company)}</div>
                  <div style="font-size:0.8rem; color:var(--text-muted); margin:0.35rem 0;">📍 ${escapeHtml(j.location)} | 💰 ${escapeHtml(j.salary)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

  } catch (err) {
    console.error(err);
    resultContainer.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--status-error);">Failed to generate recommendation.</div>`;
  }
}
