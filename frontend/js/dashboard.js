/**
 * DASHBOARD MODULE - CHART.JS INTERACTIVE VISUALIZATIONS
 */

let chartInstances = {};

async function loadDashboardData() {
  try {
    // 1. Load Stats
    const statsRes = await fetch(`${API_BASE}/dashboard/stats`);
    if (statsRes.ok) {
      const stats = await statsRes.json();
      document.getElementById('statTotalJobs').textContent = stats.total_jobs || 0;
      document.getElementById('statTotalInternships').textContent = stats.total_internships || 0;
      document.getElementById('statTotalCompanies').textContent = stats.total_companies || 0;
      document.getElementById('statTopSkill').textContent = stats.most_demanded_skill || 'Python';
      document.getElementById('statAvgSalary').textContent = `₹${stats.average_salary_lpa} LPA`;
      document.getElementById('statAvgStipend').textContent = `₹${stats.average_stipend_monthly.toLocaleString()}/mo`;
    }

    // 2. Load Charts in Parallel
    await Promise.all([
      renderSkillsChart(),
      renderCompaniesChart(),
      renderSalaryChart(),
      renderLocationsChart(),
      renderExperienceChart(),
      renderStipendChart(),
      renderHiringTrendsChart()
    ]);

  } catch (err) {
    console.error('Error loading dashboard charts:', err);
    showToast('Failed to load real-time database charts.', 'error');
  }
}

// Chart 1: Most Demanded Skills
async function renderSkillsChart() {
  const res = await fetch(`${API_BASE}/dashboard/skills`);
  if (!res.ok) return;
  const data = await res.json();

  const labels = data.map(d => d.skill);
  const values = data.map(d => d.count);

  createChart('chartSkills', 'bar', {
    labels: labels,
    datasets: [{
      label: 'Job & Internship Postings Count',
      data: values,
      backgroundColor: 'rgba(59, 130, 246, 0.75)',
      borderColor: '#3B82F6',
      borderWidth: 1,
      borderRadius: 6
    }]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } },
      y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } }
    }
  });
}

// Chart 2: Top Hiring Companies
async function renderCompaniesChart() {
  const res = await fetch(`${API_BASE}/dashboard/companies`);
  if (!res.ok) return;
  const data = await res.json();

  const labels = data.map(d => d.company);
  const values = data.map(d => d.count);

  createChart('chartCompanies', 'bar', {
    labels: labels,
    datasets: [{
      label: 'Active Openings',
      data: values,
      backgroundColor: 'rgba(20, 184, 166, 0.75)',
      borderColor: '#14B8A6',
      borderWidth: 1,
      borderRadius: 6
    }]
  }, {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } },
      y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } }
    }
  });
}

// Chart 3: Salary Distribution
async function renderSalaryChart() {
  const res = await fetch(`${API_BASE}/dashboard/salaries`);
  if (!res.ok) return;
  const data = await res.json();

  const labels = data.map(d => d.range);
  const values = data.map(d => d.count);

  createChart('chartSalaries', 'bar', {
    labels: labels,
    datasets: [{
      label: 'Job Offerings',
      data: values,
      backgroundColor: 'rgba(34, 197, 94, 0.75)',
      borderColor: '#22C55E',
      borderWidth: 1,
      borderRadius: 6
    }]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } },
      y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } }
    }
  });
}

// Chart 4: Jobs by Location
async function renderLocationsChart() {
  const res = await fetch(`${API_BASE}/dashboard/locations`);
  if (!res.ok) return;
  const data = await res.json();

  const labels = data.map(d => d.location);
  const values = data.map(d => d.count);
  const colors = ['#3B82F6', '#14B8A6', '#F59E0B', '#8B5CF6', '#EC4899', '#6366F1'];

  createChart('chartLocations', 'doughnut', {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: colors.slice(0, labels.length),
      borderWidth: 2,
      borderColor: '#111C2E'
    }]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#F8FAFC' } }
    }
  });
}

// Chart 5: Experience Distribution
async function renderExperienceChart() {
  const res = await fetch(`${API_BASE}/dashboard/experience`);
  if (!res.ok) return;
  const data = await res.json();

  const labels = data.map(d => d.level);
  const values = data.map(d => d.count);

  createChart('chartExperience', 'pie', {
    labels: labels,
    datasets: [{
      data: values,
      backgroundColor: ['#3B82F6', '#14B8A6', '#F59E0B', '#22C55E', '#A855F7'],
      borderWidth: 2,
      borderColor: '#111C2E'
    }]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#F8FAFC' } }
    }
  });
}

// Chart 6: Internship Stipend Trends
async function renderStipendChart() {
  const res = await fetch(`${API_BASE}/dashboard/stipends`);
  if (!res.ok) return;
  const data = await res.json();

  const labels = data.map(d => d.range);
  const values = data.map(d => d.count);

  createChart('chartStipends', 'bar', {
    labels: labels,
    datasets: [{
      label: 'Internship Count',
      data: values,
      backgroundColor: 'rgba(245, 158, 11, 0.75)',
      borderColor: '#F59E0B',
      borderWidth: 1,
      borderRadius: 6
    }]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } },
      y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } }
    }
  });
}

// Chart 7: Hiring Trends
async function renderHiringTrendsChart() {
  const res = await fetch(`${API_BASE}/dashboard/trends`);
  if (!res.ok) return;
  const data = await res.json();

  createChart('chartHiringTrends', 'line', {
    labels: data.months,
    datasets: [
      {
        label: 'Job Postings',
        data: data.jobs,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.3
      },
      {
        label: 'Internship Postings',
        data: data.internships,
        borderColor: '#14B8A6',
        backgroundColor: 'rgba(20, 184, 166, 0.15)',
        fill: true,
        tension: 0.3
      }
    ]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#F8FAFC' } } },
    scales: {
      x: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } },
      y: { ticks: { color: '#94A3B8' }, grid: { color: 'rgba(248, 250, 252, 0.05)' } }
    }
  });
}

// Chart creation and destruction helper
function createChart(canvasId, type, data, options) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  chartInstances[canvasId] = new Chart(canvas.getContext('2d'), {
    type: type,
    data: data,
    options: options
  });
}
