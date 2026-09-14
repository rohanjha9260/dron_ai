/**
 * Dron-AI Shared Navigation Module
 *
 * Loaded on ALL pages. Handles:
 *   - Sidebar navigation rendering with active state
 *   - Top navbar rendering with page title + theme toggle
 *   - Light/Dark theme toggle (persisted in localStorage)
 *   - Logout handler
 *   - User info display
 */

const NAV_PAGES = [
    { id: "dashboard", label: "Dashboard", href: "index.html", icon: "grid" },
    { id: "profile", label: "Profile & Data", href: "profile.html", icon: "user" },
    { id: "predictions", label: "Placement Prediction", href: "predictions.html", icon: "trending-up" },
    { id: "career", label: "Career Matching", href: "career.html", icon: "compass" },
    { id: "roadmap", label: "Skill Gap & Roadmap", href: "roadmap.html", icon: "map" },
];

const NAV_ICONS = {
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    "trending-up": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
    layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
};

/**
 * Detect current page ID from filename.
 */
function getCurrentPageId() {
    const path = window.location.pathname;
    const file = path.split("/").pop() || "index.html";
    for (const page of NAV_PAGES) {
        if (file === page.href) return page.id;
    }
    return "dashboard";
}

/**
 * Get current page config.
 */
function getCurrentPage() {
    const id = getCurrentPageId();
    return NAV_PAGES.find((p) => p.id === id) || NAV_PAGES[0];
}

/**
 * Build sidebar HTML.
 */
function buildSidebar() {
    const currentId = getCurrentPageId();

    const linksHtml = NAV_PAGES.map((page) => {
        const active = page.id === currentId ? "active" : "";
        const icon = NAV_ICONS[page.icon] || NAV_ICONS.grid;
        return `<a href="${page.href}" class="nav-link ${active}" data-page="${page.id}">${icon}<span>${page.label}</span></a>`;
    }).join("");

    return `
    <aside class="sidebar" id="app-sidebar">
        <div class="sidebar-brand">
            <div class="sidebar-logo">
                ${NAV_ICONS.layers}
            </div>
            <div class="sidebar-brand-text">
                <span class="sidebar-title">Dron-AI</span>
                <span class="sidebar-subtitle">ML Guidance Engine</span>
            </div>
        </div>
        <nav class="sidebar-nav">
            <span class="nav-section-label">Navigation</span>
            ${linksHtml}
        </nav>
        <div class="sidebar-footer">
            <div class="sidebar-user">
                <div class="sidebar-avatar" id="sidebar-avatar">ST</div>
                <div class="sidebar-user-info">
                    <span class="sidebar-user-name" id="sidebar-username">Student</span>
                    <span class="sidebar-user-role" id="sidebar-user-role">Engineering</span>
                </div>
            </div>
            <button class="btn btn-outline btn-small" id="logout-btn" type="button" style="width: 100%;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Logout
            </button>
        </div>
    </aside>`;
}

/**
 * Build top navbar HTML.
 */
function buildTopNavbar() {
    const page = getCurrentPage();
    return `
    <header class="top-navbar" id="top-navbar">
        <div class="navbar-left">
            <button class="sidebar-toggle" id="sidebar-toggle-btn" type="button" aria-label="Toggle sidebar" style="display: none; background: transparent; border: none; color: var(--color-text-muted); cursor: pointer; align-items: center; justify-content: center; margin-right: var(--space-md);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
            <div>
                <div class="page-title">${page.label}</div>
                <div class="page-breadcrumb">Dron-AI / ${page.label}</div>
            </div>
        </div>
        <div class="navbar-right">
            <span class="badge badge-warning" id="nav-guest-badge" style="display: none;"><span class="badge-dot"></span> Guest Mode</span>
            <div class="navbar-stat">
                <span>Target:</span>
                <span class="navbar-stat-val" id="nav-target-role">--</span>
            </div>
            <span class="badge badge-success" id="nav-placement-prob"><span class="badge-dot"></span> --%</span>
            <button class="theme-toggle" id="theme-toggle-btn" type="button" aria-label="Toggle theme">
                <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
                <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
            </button>
        </div>
    </header>`;
}

/**
 * Initialize shared navigation on the current page.
 */
function initNavigation() {
    // 1. Apply saved theme
    const savedTheme = localStorage.getItem("dron_theme") || "dark";
    if (savedTheme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
    }

    // 2. Inject sidebar + wrap content
    const body = document.body;
    const existingContent = body.innerHTML;

    body.innerHTML = `
        <div class="app-layout">
            ${buildSidebar()}
            <div class="main-content">
                ${buildTopNavbar()}
                <div class="page-content">
                    ${existingContent}
                </div>
            </div>
        </div>
    `;

    // Sidebar toggle
    const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
    const sidebar = document.getElementById("app-sidebar");
    if (sidebarToggleBtn && sidebar) {
        sidebarToggleBtn.addEventListener("click", () => {
            sidebar.classList.toggle("open");
        });
    }

    // 3. Theme toggle
    const toggleBtn = document.getElementById("theme-toggle-btn");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const current = document.documentElement.getAttribute("data-theme");
            const next = current === "light" ? "dark" : "light";
            if (next === "light") {
                document.documentElement.setAttribute("data-theme", "light");
            } else {
                document.documentElement.removeAttribute("data-theme");
            }
            localStorage.setItem("dron_theme", next);
        });
    }

    // 4. Logout
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            if (typeof clearToken === "function") clearToken();
            localStorage.removeItem("dron_is_guest");
            window.location.href = "login.html";
        });
    }

    // 5. Auth guard
    if (typeof checkAuth === "function") {
        checkAuth();
    }

    // 6. Load user info into sidebar
    loadSidebarUserInfo();
}

/**
 * Load basic user info into sidebar from API and apply Guest Mode indicators if applicable.
 */
async function loadSidebarUserInfo() {
    const isGuestSession = localStorage.getItem("dron_is_guest") === "true";

    try {
        if (typeof apiRequest !== "function") return;

        const data = await apiRequest("/users/profile", { method: "GET" });
        const user = data.user || {};
        const isGuest = isGuestSession || user.email === "guest@dron.ai";

        const nameEl = document.getElementById("sidebar-username");
        const avatarEl = document.getElementById("sidebar-avatar");
        const roleEl = document.getElementById("sidebar-user-role");
        const logoutBtn = document.getElementById("logout-btn");
        const guestBadge = document.getElementById("nav-guest-badge");

        if (nameEl) {
            nameEl.textContent = isGuest ? "Guest Student" : (user.full_name || "Student");
        }
        if (avatarEl) {
            if (isGuest) {
                avatarEl.textContent = "GS";
                avatarEl.style.borderColor = "var(--color-primary)";
                avatarEl.style.color = "var(--color-primary-light)";
            } else if (user.full_name) {
                avatarEl.textContent = user.full_name
                    .trim().split(/\s+/).map((n) => n[0]).join("").substring(0, 2).toUpperCase();
            }
        }
        if (roleEl) {
            if (isGuest) {
                roleEl.innerHTML = `<span class="badge badge-warning" style="font-size:0.65rem;padding:2px 6px;text-transform:uppercase;letter-spacing:0.04em;">Guest Mode</span>`;
            } else {
                const branch = user.academic_branch || "Engineering";
                const cohort = user.cohort_year ? ` \u2022 ${user.cohort_year}` : "";
                roleEl.textContent = `${branch}${cohort}`;
            }
        }

        if (isGuest) {
            if (guestBadge) {
                guestBadge.style.display = "inline-flex";
            }
            if (logoutBtn) {
                logoutBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Exit Guest Mode
                `;
            }

            // Provide "Create Account" prompt in sidebar footer for guests
            const sidebarFooter = document.querySelector(".sidebar-footer");
            if (sidebarFooter && !document.getElementById("guest-register-prompt")) {
                const prompt = document.createElement("a");
                prompt.id = "guest-register-prompt";
                prompt.href = "register.html";
                prompt.className = "btn btn-primary btn-small";
                prompt.style.cssText = "width: 100%; margin-bottom: 8px; font-size: 0.75rem; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;";
                prompt.innerHTML = `
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    Create Account
                `;
                sidebarFooter.insertBefore(prompt, logoutBtn);
            }
        }
    } catch (e) {
        console.warn("Could not load user info for sidebar:", e.message);
    }
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initNavigation);
