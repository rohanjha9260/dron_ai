/* ==========================================================================
   FUTUREPREDICT AI - AUTHENTICATION JS (Modular)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Check active user session
  const currentUser = JSON.parse(localStorage.getItem('futurepredict_user') || 'null');
  updateNavUserState(currentUser);

  // Login Form Submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;

      if (!email || !password) {
        showToast('Please enter both email and password', 'warning');
        return;
      }

      // Simulate quick secure login
      const user = {
        name: email.split('@')[0].toUpperCase(),
        email: email,
        avatar: '👨‍💻',
        isLoggedIn: true
      };

      localStorage.setItem('futurepredict_user', JSON.stringify(user));
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = 'predict.html';
      }, 1000);
    });
  }

  // Register Form Submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    // Password Strength Meter
    const regPass = document.getElementById('regPassword');
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');

    if (regPass && strengthBar) {
      regPass.addEventListener('input', () => {
        const val = regPass.value;
        let score = 0;
        if (val.length >= 6) score += 25;
        if (val.length >= 10) score += 25;
        if (/[A-Z]/.test(val)) score += 25;
        if (/[0-9!@#$%^&*]/.test(val)) score += 25;

        strengthBar.style.width = score + '%';
        if (score < 50) {
          strengthBar.style.backgroundColor = '#f43f5e';
          strengthText.innerText = 'Strength: Weak';
          strengthText.style.color = '#f43f5e';
        } else if (score < 80) {
          strengthBar.style.backgroundColor = '#f59e0b';
          strengthText.innerText = 'Strength: Moderate';
          strengthText.style.color = '#f59e0b';
        } else {
          strengthBar.style.backgroundColor = '#10b981';
          strengthText.innerText = 'Strength: Excellent & Secure';
          strengthText.style.color = '#10b981';
        }
      });
    }

    // Avatar selector
    const avatarOptions = document.querySelectorAll('.avatar-option');
    avatarOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        avatarOptions.forEach(a => a.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });

    // Role tags
    const rolePills = document.querySelectorAll('.role-pill');
    rolePills.forEach(pill => {
      pill.addEventListener('click', () => {
        rolePills.forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
      });
    });

    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value;
      const selectedAvatar = document.querySelector('.avatar-option.selected')?.innerText || '🚀';
      const selectedRole = document.querySelector('.role-pill.selected')?.innerText || 'Fullstack Developer';

      if (!fullName || !email || !password) {
        showToast('Please fill in all required fields', 'warning');
        return;
      }

      const user = {
        name: fullName,
        email: email,
        avatar: selectedAvatar,
        targetRole: selectedRole,
        isLoggedIn: true
      };

      localStorage.setItem('futurepredict_user', JSON.stringify(user));
      showToast('Registration successful! Welcome aboard.', 'success');
      setTimeout(() => {
        window.location.href = 'predict.html';
      }, 1000);
    });
  }
});

// Quick Demo Credential Fill
function fillDemoLogin() {
  const emailField = document.getElementById('loginEmail');
  const passField = document.getElementById('loginPassword');
  if (emailField && passField) {
    emailField.value = 'alex.coder@futurepredict.ai';
    passField.value = 'DemoPass@2026';
    showToast('Demo credentials filled!', 'info');
  }
}

// Password toggle helper
function togglePasswordVisibility(fieldId, iconBtn) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  if (field.type === 'password') {
    field.type = 'text';
    iconBtn.innerHTML = '👁️';
  } else {
    field.type = 'password';
    iconBtn.innerHTML = '🔒';
  }
}

// Update nav user state
function updateNavUserState(user) {
  const navActions = document.querySelector('.nav-actions');
  if (!navActions) return;

  if (user && user.isLoggedIn) {
    navActions.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 0.9rem;">
        <span style="font-size: 1.3rem;">${user.avatar || '👨‍💻'}</span>
        <span style="color: var(--cyan);">${user.name}</span>
      </div>
      <a href="predict.html" class="btn-nav-cta">🚀 Predict Now</a>
      <button onclick="logoutUser()" class="btn-nav-login" style="cursor: pointer; background: none; border: 1px solid var(--border-glass);">Logout</button>
    `;
  }
}

function logoutUser() {
  localStorage.removeItem('futurepredict_user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 600);
}

// Global Toast System
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';
  if (type === 'danger') icon = '❌';

  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

window.fillDemoLogin = fillDemoLogin;
window.togglePasswordVisibility = togglePasswordVisibility;
window.logoutUser = logoutUser;
window.showToast = showToast;
