/**
 * Dron-AI Authentication Module
 *
 * Handles:
 *   - Login form submission
 *   - Registration form submission
 *   - JWT token storage
 *   - Logout functionality
 *   - Auth state checking (redirect if not logged in)
 */

/**
 * Check if the user is authenticated.
 * Redirects to login page if no token is found.
 */
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = "login.html";
    }
}

/**
 * Handle login form submission.
 */
function initLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("login-error");
        const submitBtn = document.getElementById("login-submit-btn");

        errorDiv.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.textContent = "Logging in...";

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: {
                    email: document.getElementById("login-email").value,
                    password: document.getElementById("login-password").value,
                },
            });

            setToken(data.access_token);
            window.location.href = "index.html";
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = "block";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Login";
        }
    });
}

/**
 * Handle registration form submission.
 */
function initRegisterForm() {
    const form = document.getElementById("register-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById("register-error");
        const successDiv = document.getElementById("register-success");
        const submitBtn = document.getElementById("register-submit-btn");

        errorDiv.style.display = "none";
        successDiv.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.textContent = "Creating account...";

        try {
            await apiRequest("/auth/register", {
                method: "POST",
                body: {
                    full_name: document.getElementById("reg-name").value,
                    email: document.getElementById("reg-email").value,
                    password: document.getElementById("reg-password").value,
                    cohort_year: parseInt(document.getElementById("reg-cohort").value) || null,
                    academic_branch: document.getElementById("reg-branch").value || null,
                },
            });

            successDiv.textContent = "Account created! Redirecting to login...";
            successDiv.style.display = "block";
            setTimeout(() => (window.location.href = "login.html"), 1500);
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.style.display = "block";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = "Create Account";
        }
    });
}

/**
 * Handle logout button click.
 */
function initLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
        clearToken();
        window.location.href = "login.html";
    });
}

// Auto-initialize based on which page is loaded
document.addEventListener("DOMContentLoaded", () => {
    initLoginForm();
    initRegisterForm();
    initLogout();
});
