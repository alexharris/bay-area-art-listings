/**
 * Shared utility functions used across the application
 */

/**
 * Days of the week array (Sunday-first for JavaScript Date.getDay())
 */
export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Days of the week array (Monday-first for display)
 */
export const DAYS_OF_WEEK_DISPLAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Month names array
 */
export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format a date string (YYYY-MM-DD) to a readable format
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date (e.g., "January 15, 2025")
 */
export function formatDate(dateString) {
    if (!dateString) return '';

    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (isNaN(date.getTime())) {
        return '';
    }

    return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Generate a URL-friendly slug from a title
 * @param {string} title - The title to convert to a slug
 * @returns {string} URL-friendly slug
 */
export function generateSlug(title) {
    if (!title) return '';
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Get today's day name
 * @returns {string} The current day name (e.g., "Monday")
 */
export function getTodayName() {
    return DAYS_OF_WEEK[new Date().getDay()];
}

/**
 * Best-effort city extraction from a formatted address, used as a fallback
 * for locations whose City field hasn't been synced from Google yet.
 * @param {string} address - Formatted address (e.g. "123 Main St, Oakland, CA 94612")
 * @returns {string} Extracted city, or empty string if unavailable
 */
export function cityFromAddress(address) {
    if (!address) return '';
    const parts = address.split(',').map(part => part.trim()).filter(Boolean);
    return parts[1] || parts[0] || '';
}
