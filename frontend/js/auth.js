/**
 * Dron-AI Authentication Module
 *
 * Handles:
 *   - Login form submission & JWT token storage
 *   - Registration form submission & validation
 *   - Password visibility toggling
 *   - Error & success alert banner presentations without layout shifts
 *   - Logout functionality
 *   - Auth state checking (redirect if unauthenticated)
 */

/**
 * Check if the user is authenticated.
 * Redirects to login page if no token is found in localStorage.
 */
function checkAuth() {
    const token = getToken();
    if (!token) {
        window.location.href = "login.html";
    }
}

/**
 * Display an error message gracefully in the specified container.
 * @param {HTMLElement} errorElement - The DOM element to render error into
 * @param {string} message - The error message string
 */
function displayError(errorElement, message) {
    if (!errorElement) return;
    
    // Clean, formatted error message with icon
    errorElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
        </svg>
        <span>${escapeHtml(message)}</span>
    `;
    errorElement.style.display = "flex";
}

/**
 * Display a success message gracefully in the specified container.
 * @param {HTMLElement} successElement - The DOM element to render success into
 * @param {string} message - The success message string
 */
function displaySuccess(successElement, message) {
    if (!successElement) return;
    
    successElement.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>${escapeHtml(message)}</span>
    `;
    successElement.style.display = "flex";
}

/**
 * Escape HTML to prevent XSS in error banners.
 */
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize password visibility toggles.
 */
function initPasswordToggles() {
    const toggleButtons = document.querySelectorAll(".password-toggle-btn");
    
    toggleButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-target");
            const input = document.getElementById(targetId);
            if (!input) return;

            const isPassword = input.getAttribute("type") === "password";
            input.setAttribute("type", isPassword ? "text" : "password");

            // Swap SVG icon
            if (isPassword) {
                btn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                        <line x1="2" x2="22" y1="2" y2="22"/>
                    </svg>
                `;
                btn.setAttribute("aria-label", "Hide password");
            } else {
                btn.innerHTML = `
                    <svg class="eye-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                        <circle cx="12" cy="12" r="3"/>
                    </svg>
                `;
                btn.setAttribute("aria-label", "Show password");
            }
        });
    });
}

/**
 * Handle login form submission.
 */
function initLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;

    const errorDiv = document.getElementById("login-error");
    const submitBtn = document.getElementById("login-submit-btn");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    // Auto-clear error when user types
    [emailInput, passwordInput].forEach((input) => {
        if (input) {
            input.addEventListener("input", () => {
                if (errorDiv) errorDiv.style.display = "none";
            });
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        if (!email || !password) {
            displayError(errorDiv, "Please enter both email and password.");
            return;
        }

        if (!emailInput.checkValidity()) {
            displayError(errorDiv, "Please enter a valid email address.");
            return;
        }

        if (errorDiv) errorDiv.style.display = "none";
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span> <span>Signing In...</span>`;

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: { email, password },
            });

            if (data && data.access_token) {
                setToken(data.access_token);
                window.location.href = "index.html";
            } else {
                throw new Error(data.error || "Authentication failed: No access token received.");
            }
        } catch (error) {
            let errorMsg = error.message;
            if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
                errorMsg = "Unable to connect to Dron-AI server. Please verify the backend is running.";
            }
            displayError(errorDiv, errorMsg);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Sign In</span>`;
        }
    });
}

/**
 * Handle registration form submission.
 */
function initRegisterForm() {
    const form = document.getElementById("register-form");
    if (!form) return;

    const errorDiv = document.getElementById("register-error");
    const successDiv = document.getElementById("register-success");
    const submitBtn = document.getElementById("register-submit-btn");

    const nameInput = document.getElementById("reg-name");
    const emailInput = document.getElementById("reg-email");
    const passwordInput = document.getElementById("reg-password");
    const cohortInput = document.getElementById("reg-cohort");
    const branchInput = document.getElementById("reg-branch");

    // Clear alert banners when user modifies any input
    [nameInput, emailInput, passwordInput, cohortInput, branchInput].forEach((input) => {
        if (input) {
            input.addEventListener("input", () => {
                if (errorDiv) errorDiv.style.display = "none";
                if (successDiv) successDiv.style.display = "none";
            });
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fullName = nameInput ? nameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";
        const cohortYear = cohortInput && cohortInput.value ? Number(cohortInput.value) : null;
        const branch = branchInput ? branchInput.value : null;

        // Basic front-end validations
        if (!fullName || !email || !password) {
            displayError(errorDiv, "Full Name, Email, and Password are required.");
            return;
        }

        if (!emailInput.checkValidity()) {
            displayError(errorDiv, "Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            displayError(errorDiv, "Password must be at least 6 characters long.");
            return;
        }

        if (cohortYear !== null && (!Number.isInteger(cohortYear) || cohortYear < 2000 || cohortYear > 2099)) {
            displayError(errorDiv, "Cohort year must be between 2000 and 2099.");
            return;
        }

        if (errorDiv) errorDiv.style.display = "none";
        if (successDiv) successDiv.style.display = "none";

        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span> <span>Creating Account...</span>`;

        try {
            const data = await apiRequest("/auth/register", {
                method: "POST",
                body: {
                    full_name: fullName,
                    email: email,
                    password: password,
                    cohort_year: cohortYear,
                    academic_branch: branch,
                },
            });

            displaySuccess(
                successDiv,
                (data && data.message ? data.message : "Account created successfully!") + " Redirecting to login..."
            );

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1400);
        } catch (error) {
            let errorMsg = error.message;
            if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
                errorMsg = "Unable to connect to Dron-AI server. Please verify the backend is running.";
            }
            displayError(errorDiv, errorMsg);
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Create Account</span>`;
        }
    });
}

/**
 * Handle Guest Login flow.
 */
function initGuestLogin() {
    const guestBtn = document.getElementById("guest-login-btn");
    if (!guestBtn) return;

    guestBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const errorDiv = document.getElementById("login-error") || document.getElementById("register-error");
        if (errorDiv) errorDiv.style.display = "none";

        const originalHtml = guestBtn.innerHTML;
        guestBtn.disabled = true;
        guestBtn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:6px;"></span> <span>Entering Guest Mode...</span>`;

        try {
            const data = await apiRequest("/auth/guest", {
                method: "POST",
            });

            if (data && data.access_token) {
                setToken(data.access_token);
                localStorage.setItem("dron_is_guest", "true");
                window.location.href = "index.html";
            } else {
                throw new Error(data.error || "Unable to enter guest session.");
            }
        } catch (error) {
            let errorMsg = error.message;
            if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
                errorMsg = "Unable to connect to Dron-AI server. Please verify the backend is running.";
            }
            if (errorDiv) displayError(errorDiv, errorMsg);
            guestBtn.disabled = false;
            guestBtn.innerHTML = originalHtml;
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
        localStorage.removeItem("dron_is_guest");
        window.location.href = "login.html";
    });
}

// Auto-initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggles();
    initLoginForm();
    initRegisterForm();
    initGuestLogin();
    initLogout();
});

