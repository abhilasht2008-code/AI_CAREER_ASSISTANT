/**
 * AI CAREER ASSISTANT - MAIN APPLICATION JS
 * Handles SPA navigation, Toast notifications, Modal dialogs, and Global State
 */

const API_BASE = '/api';

const AppState = {
  currentUser: JSON.parse(localStorage.getItem('user')) || null,
  activeView: 'home',
  skillsList: []
};

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initMobileDrawer();
  updateAuthUI();
  
  // Hash routing handler
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
});

// View Navigation & Router
function handleRoute() {
  const hash = window.location.hash.replace('#', '') || 'home';
  switchView(hash);
}

function switchView(viewName) {
  const validViews = ['home', 'dashboard', 'jobs', 'internships', 'trends', 'recommendations', 'resume'];
  const targetView = validViews.includes(viewName) ? viewName : 'home';

  // Hide all views
  document.querySelectorAll('.view-section').forEach(sec => {
    sec.classList.remove('active');
  });

  // Show target view
  const targetEl = document.getElementById(`view-${targetView}`);
  if (targetEl) {
    targetEl.classList.add('active');
    AppState.activeView = targetView;
  }

  // Update active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${targetView}`) {
      link.classList.add('active');
    }
  });

  // Close mobile nav drawer if open
  const drawer = document.getElementById('mobileNavDrawer');
  const toggleBtn = document.getElementById('hamburgerBtn');
  if (drawer) drawer.classList.remove('open');
  if (toggleBtn) {
    toggleBtn.classList.remove('active');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  // Trigger page-specific data loaders
  if (targetView === 'dashboard') {
    if (window.loadDashboardData) window.loadDashboardData();
  } else if (targetView === 'jobs') {
    if (window.loadJobsData) window.loadJobsData();
  } else if (targetView === 'internships') {
    if (window.loadInternshipsData) window.loadInternshipsData();
  } else if (targetView === 'trends') {
    if (window.loadTrendsData) window.loadTrendsData();
  } else if (targetView === 'home') {
    if (window.loadHomeStats) window.loadHomeStats();
  }
}

function initNavigation() {
  document.querySelectorAll('[data-route]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const route = btn.getAttribute('data-route');
      window.location.hash = route;
    });
  });
}

function initMobileDrawer() {
  const toggleBtn = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('mobileNavDrawer');
  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = drawer.classList.toggle('open');
      toggleBtn.classList.toggle('active', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (drawer.classList.contains('open') && 
          !drawer.contains(e.target) && 
          !toggleBtn.contains(e.target)) {
        drawer.classList.remove('open');
        toggleBtn.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// Global Auth UI Sync
function updateAuthUI() {
  const authContainer = document.getElementById('navAuthContainer');
  const mobileAuth = document.getElementById('mobileAuthContainer');
  const user = AppState.currentUser;

  if (authContainer) {
    if (user) {
      authContainer.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <span style="font-size:0.875rem; color:var(--text-main); font-weight:600;">👋 ${escapeHtml(user.name)}</span>
          <button onclick="logoutUser()" class="btn btn-outline btn-sm">Logout</button>
        </div>
      `;
    } else {
      authContainer.innerHTML = `
        <button onclick="openAuthModal('login')" class="btn btn-outline btn-sm">Login</button>
        <button onclick="openAuthModal('signup')" class="btn btn-primary btn-sm">Sign Up</button>
      `;
    }
  }

  if (mobileAuth) {
    if (user) {
      mobileAuth.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:0.5rem; text-align:center;">
          <span style="font-size:0.9rem; color:var(--text-main); font-weight:600;">👋 Signed in as ${escapeHtml(user.name)}</span>
          <button onclick="logoutUser()" class="btn btn-outline btn-sm btn-full">Logout</button>
        </div>
      `;
    } else {
      mobileAuth.innerHTML = `
        <button onclick="openAuthModal('login')" class="btn btn-outline btn-sm btn-full">Login</button>
        <button onclick="openAuthModal('signup')" class="btn btn-primary btn-sm btn-full">Sign Up</button>
      `;
    }
  }
}

function logoutUser() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  AppState.currentUser = null;
  updateAuthUI();
  showToast('Logged out successfully.', 'info');
  window.location.hash = 'home';
}

// Toast Notifications Helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Helper to escape HTML characters
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
