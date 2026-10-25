/**
 * AUTHENTICATION MODULE - SIGNUP & LOGIN
 */

function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.add('open');
  switchAuthTab(mode);
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.remove('open');
}

function switchAuthTab(mode) {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabSignupBtn = document.getElementById('tabSignupBtn');

  if (mode === 'login') {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    tabLoginBtn.classList.add('btn-primary');
    tabLoginBtn.classList.remove('btn-outline');
    tabSignupBtn.classList.add('btn-outline');
    tabSignupBtn.classList.remove('btn-primary');
  } else {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    tabSignupBtn.classList.add('btn-primary');
    tabSignupBtn.classList.remove('btn-outline');
    tabLoginBtn.classList.add('btn-outline');
    tabLoginBtn.classList.remove('btn-primary');
  }
}

async function handleLoginSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showToast('Please provide both email and password.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Login failed', 'error');
      return;
    }

    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    AppState.currentUser = data.user;
    updateAuthUI();
    closeAuthModal();
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    window.location.hash = 'dashboard';

  } catch (err) {
    showToast('Network error during login.', 'error');
  }
}

async function handleSignupSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const degree = document.getElementById('signupDegree').value;
  const branch = document.getElementById('signupBranch').value;
  const gradYear = document.getElementById('signupGradYear').value;
  const careerInterest = document.getElementById('signupCareerInterest').value;

  if (!name || !email || !password) {
    showToast('Name, email, and password are required.', 'error');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        degree,
        branch,
        graduation_year: gradYear,
        career_interest: careerInterest
      })
    });

    const data = await res.json();

    if (!res.ok) {
      showToast(data.error || 'Registration failed', 'error');
      return;
    }

    showToast('Account registered! Logging you in...', 'success');
    
    // Auto-login after registration
    localStorage.setItem('user', JSON.stringify(data.user));
    AppState.currentUser = data.user;
    updateAuthUI();
    closeAuthModal();
    window.location.hash = 'dashboard';

  } catch (err) {
    showToast('Network error during registration.', 'error');
  }
}
