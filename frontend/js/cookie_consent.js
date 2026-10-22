/**
 * Dron-AI Cookie & Client Storage Consent Manager
 *
 * Implements accessible, lightweight privacy & storage consent
 * compliant with India DPDP Act 2023 and modern web privacy standards.
 */

(function () {
    const STORAGE_KEY = "dron_cookie_consent";

    function hasUserConsented() {
        return !!localStorage.getItem(STORAGE_KEY);
    }

    function recordConsent(level) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            level: level, // 'all' or 'essential'
            timestamp: new Date().toISOString(),
            version: "1.0"
        }));
        removeBanner();
    }

    function removeBanner() {
        const banner = document.getElementById("dron-cookie-consent-banner");
        if (banner) {
            banner.style.opacity = "0";
            banner.style.transform = "translateY(20px)";
            banner.style.transition = "all 0.25s ease";
            setTimeout(() => banner.remove(), 250);
        }
    }

    function renderBanner() {
        if (hasUserConsented()) return;
        if (document.getElementById("dron-cookie-consent-banner")) return;

        const banner = document.createElement("aside");
        banner.id = "dron-cookie-consent-banner";
        banner.className = "cookie-consent-banner";
        banner.setAttribute("role", "region");
        banner.setAttribute("aria-label", "Cookie and Data Storage Preferences");

        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-icon" aria-hidden="true">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div class="cookie-consent-text">
                    <h4>Privacy &amp; Data Storage Notice</h4>
                    <p>
                        Dron-AI uses necessary local storage for authenticated sessions and algorithmic career analysis in compliance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>. We do not use third-party tracking pixels or cross-site advertising cookies. Read our <a href="cookies.html">Cookie Policy</a> and <a href="privacy.html">Privacy Policy</a>.
                    </p>
                </div>
            </div>
            <div class="cookie-consent-actions">
                <button type="button" class="btn-cookie-essential" id="cookie-btn-essential">
                    Essential Only
                </button>
                <button type="button" class="btn-cookie-accept" id="cookie-btn-accept">
                    Accept All
                </button>
            </div>
        `;

        document.body.appendChild(banner);

        const acceptBtn = document.getElementById("cookie-btn-accept");
        const essentialBtn = document.getElementById("cookie-btn-essential");

        if (acceptBtn) {
            acceptBtn.addEventListener("click", () => recordConsent("all"));
        }
        if (essentialBtn) {
            essentialBtn.addEventListener("click", () => recordConsent("essential"));
        }
    }

    // Auto-run on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderBanner);
    } else {
        renderBanner();
    }
})();
