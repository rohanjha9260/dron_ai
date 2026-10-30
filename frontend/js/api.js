/**
 * Dron-AI API Client
 *
 * Centralized Fetch API wrapper that handles:
 *   - Base URL configuration
 *   - JWT token injection into headers
 *   - Standardized error handling
 *   - JSON parsing
 *
 * All other JS modules use this for API communication.
 */

const API_BASE_URL = "http://localhost:5000/api";

/**
 * Get the stored JWT access token for the active session.
 * @returns {string|null} The JWT token or null if not authenticated
 */
function getToken() {
    return sessionStorage.getItem("dron_ai_token");
}

/**
 * Store the JWT access token across session and local storage.
 * @param {string} token - The JWT access token
 */
function setToken(token) {
    if (!token) return;
    try {
        sessionStorage.setItem("dron_ai_token", token);
    } catch (_) {}
    try {
        localStorage.removeItem("dron_ai_token");
    } catch (_) {}
}

/**
 * Remove any stored JWT access token and session state.
 */
function clearToken() {
    try {
        sessionStorage.removeItem("dron_ai_token");
        sessionStorage.removeItem("dron_student_id");
        sessionStorage.removeItem("dron_is_guest");
    } catch (_) {}
    try {
        localStorage.removeItem("dron_ai_token");
        localStorage.removeItem("dron_student_id");
        localStorage.removeItem("dron_is_guest");
        localStorage.removeItem("dron_remembered_email");
    } catch (_) {}
}

/**
 * Make an authenticated API request.
 *
 * @param {string} endpoint - API endpoint path (e.g., "/users/profile")
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed JSON response
 * @throws {Error} If the request fails or returns a non-OK status
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    // Inject JWT token if available
    const token = getToken();
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        let data = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { error: text || `HTTP ${response.status}: ${response.statusText}` };
        }

        if (!response.ok) {
            const errorMessage = data.error || data.msg || data.message || `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
}
