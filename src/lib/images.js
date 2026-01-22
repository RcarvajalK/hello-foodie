export const DEFAULT_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

/**
 * Validates and returns a restaurant image URL.
 * Filters out known broken domains and returns a fallback if the URL is invalid.
 * @param {string} url - The image URL to validate.
 * @param {string} fallback - Optional fallback image URL.
 * @returns {string} - The validated image URL or fallback.
 */
export function getRestaurantImage(url, fallback = DEFAULT_RESTAURANT_IMAGE) {
    if (!url || typeof url !== 'string') return fallback;

    // Filter out known broken Google Maps placeholders/expired URLs
    const brokenPatterns = [
        'maps.gstatic.com',
        'lh3.googleusercontent.com', // Sometimes these work, but often expire
    ];

    if (brokenPatterns.some(pattern => url.includes(pattern))) {
        return fallback;
    }

    return url;
}

/**
 * Filters a list of images, keeping only the ones that appear to be valid.
 * @param {string[]} images - Array of image URLs.
 * @param {string} mainImage - The main image URL.
 * @returns {string[]} - Filtered array of images.
 */
export function filterRestaurantImages(images = [], mainImage = null) {
    const all = [mainImage, ...images].filter(Boolean);
    const valid = all.map(img => getRestaurantImage(img)).filter(img => img !== DEFAULT_RESTAURANT_IMAGE);

    if (valid.length === 0) return [DEFAULT_RESTAURANT_IMAGE];
    return valid;
}
