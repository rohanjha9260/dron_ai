/**
 * Dron-AI 3D Notebook Authentication Module
 *
 * Implements:
 *   - 3D physical open book spread (45° perspective)
 *   - Page-turn animation: Login page turns 180° around central spine
 *   - Its back face lands on the left wing displaying the Account Creation tagline
 *   - Touch & Mouse horizontal swipe gesture navigation
 *   - Password show/hide eye toggles
 *   - Comprehensive client-side form validation
 *   - Backend authentication API: POST /api/auth/login and POST /api/auth/register
 *   - Open-redirect safe destination routing
 *   - Session-scoped token authentication (per-visit authentication)
 *   - System health monitor
 */

// Global State
let isPageTurning = false;
let currentAuthMode = "login"; // 'login' or 'signup'

/**
 * Safely resolve post-authentication redirection target.
 * Defends against open-redirect vulnerabilities.
 */
function getPostLoginRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    const redirectParam = params.get("redirect");

    const allowedPages = [
        "dashboard.html",
        "academic.html",
        "career.html",
        "placement.html",
        "roadmap.html",
        "mock_interview.html",
        "interview.html",
        "telemetry.html",
        "settings.html",
        "softskills.html",
        "profile.html",
        "predictions.html",
        "input.html"
    ];

    if (redirectParam) {
        const cleanTarget = redirectParam.replace(/\\/g, "/").split("/").pop().split("?")[0].split("#")[0];
        if (allowedPages.includes(cleanTarget)) {
            return cleanTarget;
        }
    }

    return "dashboard.html";
}

/**
 * Escape HTML to prevent XSS in error and success alerts.
 */
function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Display an error message in the specified container.
 */
function displayError(errorElement, message) {
    if (!errorElement) return;

    errorElement.innerHTML = `
        <i class="fa-solid fa-circle-exclamation" style="flex-shrink:0;"></i>
        <span>${escapeHtml(message)}</span>
    `;
    errorElement.style.display = "flex";
}

/**
 * Display a success message in the specified container.
 */
function displaySuccess(successElement, message) {
    if (!successElement) return;

    successElement.innerHTML = `
        <i class="fa-solid fa-circle-check" style="flex-shrink:0;"></i>
        <span>${escapeHtml(message)}</span>
    `;
    successElement.style.display = "flex";
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

            // Swap icon
            const icon = btn.querySelector("i");
            if (icon) {
                if (isPassword) {
                    icon.className = "fa-regular fa-eye-slash";
                    btn.setAttribute("aria-label", "Hide password");
                } else {
                    icon.className = "fa-regular fa-eye eye-icon";
                    btn.setAttribute("aria-label", "Show password");
                }
            }
        });
    });
}

/**
 * Execute realistic 3D physical page-turn animation around the spine.
 *
 * @param {'login'|'signup'} targetMode - The mode to transition to
 * @param {boolean} instant - Skip animation (for initial URL params or reduced motion)
 */
function turnPageTo(targetMode, instant = false) {
    if (isPageTurning) return;
    if (currentAuthMode === targetMode && !instant) return;

    const book = document.getElementById("notebook-book");
    const flipperLeaf = document.getElementById("page-flipper-leaf");
    const signupPage = document.getElementById("page-signup-under");
    const loginFront = document.getElementById("leaf-front");

    if (!book || !flipperLeaf) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldBeInstant = instant || prefersReducedMotion;

    // Synchronize Tabs
    const leftLoginTab = document.getElementById("tab-login-btn");
    const leftRegisterTab = document.getElementById("tab-register-btn");
    const rightLoginTab = document.getElementById("tab-login-btn-right");
    const rightRegisterTab = document.getElementById("tab-register-btn-right");

    const isSignUp = targetMode === "signup";

    [leftLoginTab, rightLoginTab].forEach((tab) => {
        if (tab) {
            tab.classList.toggle("active", !isSignUp);
            tab.setAttribute("aria-selected", !isSignUp ? "true" : "false");
        }
    });

    [leftRegisterTab, rightRegisterTab].forEach((tab) => {
        if (tab) {
            tab.classList.toggle("active", isSignUp);
            tab.setAttribute("aria-selected", isSignUp ? "true" : "false");
        }
    });

    if (shouldBeInstant) {
        if (isSignUp) {
            book.classList.add("state-signup");
            book.classList.remove("turning-to-signup", "turning-to-login");
            currentAuthMode = "signup";
            if (loginFront) loginFront.inert = true;
            if (signupPage) signupPage.inert = false;
            const regName = document.getElementById("reg-name");
            if (regName) regName.focus({ preventScroll: true });
        } else {
            book.classList.remove("state-signup", "turning-to-signup", "turning-to-login");
            currentAuthMode = "login";
            if (loginFront) loginFront.inert = false;
            if (signupPage) signupPage.inert = true;
            const loginEmail = document.getElementById("login-email");
            if (loginEmail) loginEmail.focus({ preventScroll: true });
        }
        return;
    }

    // Begin 3D Page-Turn Animation
    isPageTurning = true;

    if (isSignUp) {
        // Turning from Login (0deg) to Sign Up (-180deg):
        book.classList.remove("state-signup", "turning-to-login");
        void flipperLeaf.offsetWidth; // Force reflow

        // Animate turning leaf right-to-left
        book.classList.add("turning-to-signup");

        setTimeout(() => {
            book.classList.add("state-signup");
            book.classList.remove("turning-to-signup");

            currentAuthMode = "signup";
            isPageTurning = false;

            if (loginFront) loginFront.inert = true;
            if (signupPage) signupPage.inert = false;

            const regName = document.getElementById("reg-name");
            if (regName) regName.focus({ preventScroll: true });
        }, 850);

    } else {
        // Turning from Sign Up (-180deg) back to Login (0deg):
        book.classList.remove("state-signup", "turning-to-signup");
        book.classList.add("turning-to-login");
        void flipperLeaf.offsetWidth; // Force reflow

        setTimeout(() => {
            book.classList.remove("turning-to-login");
            currentAuthMode = "login";
            isPageTurning = false;

            if (loginFront) loginFront.inert = false;
            if (signupPage) signupPage.inert = true;

            const loginEmail = document.getElementById("login-email");
            if (loginEmail) loginEmail.focus({ preventScroll: true });
        }, 850);
    }
}

/**
 * Initialize touch and mouse swipe gesture detection for natural physical page turns.
 */
function initSwipeGestures() {
    const book = document.getElementById("notebook-book");
    if (!book) return;

    let startX = 0;
    let startY = 0;
    let isTracking = false;

    // Touch events
    book.addEventListener("touchstart", (e) => {
        // Don't hijack interactive form elements
        if (e.target.closest("input, button, a, label")) return;
        if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isTracking = true;
        }
    }, { passive: true });

    book.addEventListener("touchend", (e) => {
        if (!isTracking) return;
        isTracking = false;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = endX - startX;
        const diffY = endY - startY;

        // Ensure predominantly horizontal swipe
        if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0 && currentAuthMode === "login") {
                // Swiped Left -> Turn to Sign Up
                turnPageTo("signup");
            } else if (diffX > 0 && currentAuthMode === "signup") {
                // Swiped Right -> Turn to Login
                turnPageTo("login");
            }
        }
    }, { passive: true });

    // Mouse drag events
    book.addEventListener("mousedown", (e) => {
        if (e.target.closest("input, button, a, label")) return;
        startX = e.clientX;
        startY = e.clientY;
        isTracking = true;
    });

    book.addEventListener("mouseup", (e) => {
        if (!isTracking) return;
        isTracking = false;
        const diffX = e.clientX - startX;
        const diffY = e.clientY - startY;

        if (Math.abs(diffX) > 55 && Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX < 0 && currentAuthMode === "login") {
                turnPageTo("signup");
            } else if (diffX > 0 && currentAuthMode === "signup") {
                turnPageTo("login");
            }
        }
    });

    // Swipe Hint Pills
    const hintLogin = document.getElementById("swipe-hint-login");
    const hintSignup = document.getElementById("swipe-hint-signup");
    if (hintLogin) hintLogin.addEventListener("click", () => turnPageTo("signup"));
    if (hintSignup) hintSignup.addEventListener("click", () => turnPageTo("login"));
}

/**
 * Initialize tabs and switcher links.
 */
function initAuthTabs() {
    // Mode Switcher Buttons
    const leftLoginTab = document.getElementById("tab-login-btn");
    const leftRegisterTab = document.getElementById("tab-register-btn");
    const rightLoginTab = document.getElementById("tab-login-btn-right");
    const rightRegisterTab = document.getElementById("tab-register-btn-right");

    // Text Link Switchers
    const switchToSignupLink = document.getElementById("switch-to-signup-link");
    const switchToLoginLink = document.getElementById("switch-to-login-link");

    if (leftLoginTab) leftLoginTab.addEventListener("click", () => turnPageTo("login"));
    if (leftRegisterTab) leftRegisterTab.addEventListener("click", () => turnPageTo("signup"));
    if (rightLoginTab) rightLoginTab.addEventListener("click", () => turnPageTo("login"));
    if (rightRegisterTab) rightRegisterTab.addEventListener("click", () => turnPageTo("signup"));

    if (switchToSignupLink) switchToSignupLink.addEventListener("click", () => turnPageTo("signup"));
    if (switchToLoginLink) switchToLoginLink.addEventListener("click", () => turnPageTo("login"));

    // Check URL query parameters (?tab=signup or ?tab=register)
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get("tab");
    if (tabParam === "register" || tabParam === "signup") {
        turnPageTo("signup", true);
    } else {
        turnPageTo("login", true);
    }
}

/**
 * Handle Login Form submission and session authentication.
 */
function initLoginForm() {
    const form = document.getElementById("login-form");
    if (!form) return;

    const errorDiv = document.getElementById("login-error");
    const submitBtn = document.getElementById("login-submit-btn");
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const forgotLink = document.getElementById("forgot-password-link");

    // Clear any lingering localStorage tokens or remembered credentials
    try {
        localStorage.removeItem("dron_remembered_email");
        localStorage.removeItem("dron_ai_token");
        localStorage.removeItem("dron_student_id");
        localStorage.removeItem("dron_is_guest");
    } catch (e) {
        console.warn("Storage cleanup error:", e);
    }

    // Auto-clear error when user types
    [emailInput, passwordInput].forEach((input) => {
        if (input) {
            input.addEventListener("input", () => {
                if (errorDiv) errorDiv.style.display = "none";
            });
        }
    });

    // Forgot password info handler
    if (forgotLink) {
        forgotLink.addEventListener("click", (e) => {
            e.preventDefault();
            displayError(
                errorDiv,
                "Password reset is managed by your College Placement Cell. Please contact support@dron.ai or your campus administrator."
            );
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Lock during page-turn animation
        if (isPageTurning) return;

        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";

        if (!email || !password) {
            displayError(errorDiv, "Please enter both Email / College ID and Password.");
            return;
        }

        if (!emailInput.checkValidity()) {
            displayError(errorDiv, "Please enter a valid email address.");
            return;
        }

        if (errorDiv) errorDiv.style.display = "none";

        submitBtn.disabled = true;
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span class="spinner"></span> <span>Logging in...</span>`;

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: { email, password },
            });

            if (data && data.access_token) {
                setToken(data.access_token);
                if (data.student_id) {
                    try { sessionStorage.setItem("dron_student_id", data.student_id); } catch (_) {}
                    try { localStorage.removeItem("dron_student_id"); } catch (_) {}
                }
                try { sessionStorage.removeItem("dron_is_guest"); } catch (_) {}
                try { localStorage.removeItem("dron_is_guest"); } catch (_) {}
                try { localStorage.removeItem("dron_remembered_email"); } catch (_) {}

                const targetUrl = getPostLoginRedirectUrl();
                window.location.href = targetUrl;
            } else {
                throw new Error(data.error || "Authentication failed: No access token received.");
            }
        } catch (error) {
            let errorMsg = error.message;
            if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
                errorMsg = "Unable to connect to Dron-AI server. Please verify backend is running on port 5000.";
            } else if (errorMsg.toLowerCase().includes("invalid credentials")) {
                errorMsg = "Invalid email or password. Please check your credentials.";
            }
            displayError(errorDiv, errorMsg);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });
}

/**
 * Handle Registration Form submission with client-side validation.
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
    const confirmInput = document.getElementById("reg-confirm-password");
    const consentCheckbox = document.getElementById("reg-consent");

    [nameInput, emailInput, passwordInput, confirmInput, consentCheckbox].forEach((input) => {
        if (input) {
            input.addEventListener("input", () => {
                if (errorDiv) errorDiv.style.display = "none";
                if (successDiv) successDiv.style.display = "none";
            });
            input.addEventListener("change", () => {
                if (errorDiv) errorDiv.style.display = "none";
                if (successDiv) successDiv.style.display = "none";
            });
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Lock during page-turn animation
        if (isPageTurning) return;

        const fullName = nameInput ? nameInput.value.trim() : "";
        const email = emailInput ? emailInput.value.trim() : "";
        const password = passwordInput ? passwordInput.value : "";
        const confirmPassword = confirmInput ? confirmInput.value : "";

        // Required-field validation
        if (!fullName || !email || !password || !confirmPassword) {
            displayError(errorDiv, "Please fill in all required fields.");
            return;
        }

        // Email format validation
        if (!emailInput.checkValidity()) {
            displayError(errorDiv, "Please enter a valid email address.");
            return;
        }

        // Minimum password length
        if (password.length < 6) {
            displayError(errorDiv, "Password must be at least 6 characters long.");
            return;
        }

        // Password confirmation matching
        if (password !== confirmPassword) {
            displayError(errorDiv, "Passwords do not match. Please verify.");
            return;
        }

        // Terms & Conditions checkbox
        if (consentCheckbox && !consentCheckbox.checked) {
            displayError(errorDiv, "Please accept the Terms & Conditions to proceed.");
            return;
        }

        if (errorDiv) errorDiv.style.display = "none";
        if (successDiv) successDiv.style.display = "none";

        submitBtn.disabled = true;
        const originalBtnHtml = submitBtn.innerHTML;
        submitBtn.innerHTML = `<span class="spinner"></span> <span>Creating Account...</span>`;

        try {
            const data = await apiRequest("/auth/register", {
                method: "POST",
                body: {
                    full_name: fullName,
                    email: email,
                    password: password,
                },
            });

            displaySuccess(
                successDiv,
                "Account created successfully! Turning to login page..."
            );

            // Pre-fill email in login form and clear register inputs
            const loginEmail = document.getElementById("login-email");
            if (loginEmail) loginEmail.value = email;
            if (passwordInput) passwordInput.value = "";
            if (confirmInput) confirmInput.value = "";

            setTimeout(() => {
                turnPageTo("login");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
                if (successDiv) successDiv.style.display = "none";
            }, 1200);
        } catch (error) {
            let errorMsg = error.message;
            if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError")) {
                errorMsg = "Unable to connect to Dron-AI server. Please verify backend is running.";
            } else if (errorMsg.toLowerCase().includes("already registered")) {
                errorMsg = "This email is already registered. Please sign in or use another email.";
            }
            displayError(errorDiv, errorMsg);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnHtml;
        }
    });
}

/**
 * Check backend system health status and update the topbar status pill.
 */
async function checkBackendHealth() {
    const dot = document.getElementById("system-status-dot");
    const text = document.getElementById("system-status-text");
    if (!dot || !text) return;

    try {
        const response = await fetch("http://localhost:5000/api/users/profile", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        // Any response (including 401 Unauthorized) verifies backend process is active
        if (response.status === 200 || response.status === 401) {
            dot.style.background = "#22C55E";
            dot.style.boxShadow = "0 0 8px #22C55E";
            text.textContent = "SYSTEM ONLINE";
        } else {
            dot.style.background = "#EAB308";
            dot.style.boxShadow = "0 0 8px #EAB308";
            text.textContent = "MAINTENANCE";
        }
    } catch (e) {
        dot.style.background = "#EF4444";
        dot.style.boxShadow = "0 0 8px #EF4444";
        text.textContent = "BACKEND OFFLINE";
    }
}

/**
 * Handle logout helper if present on page.
 */
function initLogout() {
    const logoutBtn = document.getElementById("logout-btn");
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
        clearToken();
        window.location.href = "login.html";
    });
}

// Auto-initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    initPasswordToggles();
    initAuthTabs();
    initSwipeGestures();
    initLoginForm();
    initRegisterForm();
    initLogout();
    checkBackendHealth();
});
