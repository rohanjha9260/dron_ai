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
 * Get the stored JWT access token.
 * @returns {string|null} The JWT token or null if not authenticated
 */
function getToken() {
    return localStorage.getItem("dron_ai_token");
}

/**
 * Store the JWT access token.
 * @param {string} token - The JWT access token
 */
function setToken(token) {
    localStorage.setItem("dron_ai_token", token);
}

/**
 * Remove the stored JWT access token.
 */
function clearToken() {
    localStorage.removeItem("dron_ai_token");
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

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error.message);
        throw error;
    }
}
