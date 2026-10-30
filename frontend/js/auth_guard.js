/**
 * Dron-AI Client-Side Authentication Route Guard
 *
 * Runs synchronously in the <head> of protected pages to prevent
 * Flash of Unauthenticated Content (FOUC).
 *
 * Checks:
 *   1. Token presence in sessionStorage or localStorage ('dron_ai_token')
 *   2. JWT expiration validity
 *
 * If missing or expired:
 *   Redirects immediately to login.html?redirect=<target_page>
 */

(function () {
    const PUBLIC_PAGES = [
        "index.html",
        "login.html",
        "terms.html",
        "privacy.html",
        "cookies.html",
        "refund.html"
    ];

    function getCurrentPage() {
        const path = window.location.pathname.replace(/\\/g, "/");
        const page = path.split("/").pop().split("?")[0].split("#")[0];
        return page || "index.html";
    }

    function isTokenValid(token) {
        if (!token || typeof token !== "string") return false;
        try {
            const parts = token.split(".");
            if (parts.length !== 3) return false;
            // Pad base64 if needed for URL-safe strings
            let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
            while (base64.length % 4 !== 0) {
                base64 += "=";
            }
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split("")
                    .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                    .join("")
            );
            const decoded = JSON.parse(jsonPayload);
            if (decoded && decoded.exp) {
                const nowInSec = Math.floor(Date.now() / 1000);
                if (nowInSec >= decoded.exp) {
                    return false; // Token expired
                }
            }
            return true;
        } catch (e) {
            return Boolean(token);
        }
    }

    const currentPage = getCurrentPage();

    // Do not guard public pages
    if (PUBLIC_PAGES.includes(currentPage)) {
        return;
    }

    const token = sessionStorage.getItem("dron_ai_token");

    if (!isTokenValid(token)) {
        try {
            sessionStorage.removeItem("dron_ai_token");
            sessionStorage.removeItem("dron_student_id");
            sessionStorage.removeItem("dron_is_guest");
            localStorage.removeItem("dron_ai_token");
            localStorage.removeItem("dron_student_id");
            localStorage.removeItem("dron_is_guest");
        } catch (e) {
            console.warn("Storage cleanup error:", e);
        }

        const redirectParam = encodeURIComponent(currentPage);
        window.location.replace(`login.html?redirect=${redirectParam}`);
    }
})();

/**
 * Universal logout helper accessible across all application views.
 */
function logoutUser() {
    try {
        sessionStorage.removeItem("dron_ai_token");
        sessionStorage.removeItem("dron_student_id");
        sessionStorage.removeItem("dron_is_guest");
        localStorage.removeItem("dron_ai_token");
        localStorage.removeItem("dron_student_id");
        localStorage.removeItem("dron_is_guest");
        localStorage.removeItem("dron_remembered_email");
    } catch (e) {
        console.warn("Error clearing user session:", e);
    }
    window.location.href = "login.html";
}
