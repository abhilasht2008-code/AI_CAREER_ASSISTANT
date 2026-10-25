/**
 * JOB TRENDS MODULE - DEEP DATA SCIENCE VISUALIZATIONS
 */

async function loadTrendsData() {
  try {
    const [skillsRes, salariesRes, locationsRes, experienceRes, trendsRes] = await Promise.all([
      fetch(`${API_BASE}/dashboard/skills`),
      fetch(`${API_BASE}/dashboard/salaries`),
      fetch(`${API_BASE}/dashboard/locations`),
      fetch(`${API_BASE}/dashboard/experience`),
      fetch(`${API_BASE}/dashboard/trends`)
    ]);

    if (skillsRes.ok) {
      const skills = await skillsRes.json();
      renderTrendsSkillsChart(skills);
    }

    if (salariesRes.ok) {
      const salaries = await salariesRes.json();
      renderTrendsSalaryChart(salaries);
    }

    if (locationsRes.ok) {
      const locs = await locationsRes.json();
      renderTrendsLocationChart(locs);
    }

    if (experienceRes.ok) {
      const exps = await experienceRes.json();
      renderTrendsExpChart(exps);
    }

    if (trendsRes.ok) {
      const trends = await trendsRes.json();
      renderTrendsLineChart(trends);
    }

  } catch (err) {
    console.error('Error loading job trends:', err);
  }
}

function renderTrendsSkillsChart(data) {
  createChart('trendsChartSkills', 'bar', {
    labels: data.map(d => d.skill),
    datasets: [{
      label: 'Demand Count Across Postings',
      data: data.map(d => d.count),
      backgroundColor: 'rgba(20, 184, 166, 0.8)',
      borderColor: '#14B8A6',
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

function renderTrendsSalaryChart(data) {
  createChart('trendsChartSalaries', 'bar', {
    labels: data.map(d => d.range),
    datasets: [{
      label: 'Jobs in Salary Bracket',
      data: data.map(d => d.count),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
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

function renderTrendsLocationChart(data) {
  createChart('trendsChartLocations', 'bar', {
    indexAxis: 'y',
    labels: data.map(d => d.location),
    datasets: [{
      label: 'Opportunities Count',
      data: data.map(d => d.count),
      backgroundColor: 'rgba(245, 158, 11, 0.8)',
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

function renderTrendsExpChart(data) {
  createChart('trendsChartExperience', 'doughnut', {
    labels: data.map(d => d.level),
    datasets: [{
      data: data.map(d => d.count),
      backgroundColor: ['#3B82F6', '#14B8A6', '#F59E0B', '#22C55E', '#EC4899'],
      borderWidth: 2,
      borderColor: '#111C2E'
    }]
  }, {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#F8FAFC' } } }
  });
}

function renderTrendsLineChart(data) {
  createChart('trendsChartTimeline', 'line', {
    labels: data.months,
    datasets: [{
      label: 'Market Hiring Momentum Index',
      data: data.jobs,
      borderColor: '#14B8A6',
      backgroundColor: 'rgba(20, 184, 166, 0.15)',
      fill: true,
      tension: 0.4
    }]
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
