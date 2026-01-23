export const DEFAULT_RESTAURANT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';

const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80', // Elegant interior
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80', // Modern dining
    'https://images.unsplash.com/photo-1502301103665-0b95cc738def?auto=format&fit=crop&w=800&q=80', // Bistro
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80', // Fine dining
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80', // Chef plating
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80', // Cocktails/Bar
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80', // Cozy cafe
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', // Food variety
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80', // Platter
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=800&q=80', // Outdoor seating
];

/**
 * Deterministically picks a fallback image based on a seed string.
 */
function getDiverseFallback(seed) {
    if (!seed) return DEFAULT_RESTAURANT_IMAGE;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % FALLBACK_IMAGES.length;
    return FALLBACK_IMAGES[index];
}

/**
 * Validates and returns a restaurant image URL.
 * Filters out known broken domains and returns a fallback if the URL is invalid.
 */
export function getRestaurantImage(url, fallback = null) {
    const defaultFallback = fallback || getDiverseFallback(url || 'default');

    if (!url || typeof url !== 'string') return defaultFallback;

    // Filter out known STATIC Google Maps placeholders (these are always "missing photo" icons)
    const brokenPatterns = [
        'maps.gstatic.com',
        'default_geocode'
    ];

    if (brokenPatterns.some(pattern => url.includes(pattern))) {
        return getDiverseFallback(url);
    }

    return url;
}

/**
 * Filters a list of images, keeping only the ones that appear to be valid.
 */
export function filterRestaurantImages(images = [], mainImage = null) {
    const safeImages = Array.isArray(images) ? images : [];
    const all = [mainImage, ...safeImages].filter(Boolean);
    const valid = all.map(img => getRestaurantImage(img)).filter(img => !FALLBACK_IMAGES.includes(img));

    if (valid.length === 0) return [getDiverseFallback(mainImage || 'main')];
    return valid;
}

/**
 * Public accessor for a diverse fallback image.
 */
export function getDiverseFallbackImage(seed) {
    return getDiverseFallback(seed);
}
