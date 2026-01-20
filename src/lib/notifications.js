// Notification & Proximity logic for Hello Foodie!

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const sendNotification = (title, body, url = '/') => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg'
        });
    }
};

// Haversine formula to calculate distance between two coordinates in km
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

const deg2rad = (deg) => deg * (Math.PI / 180);

export const checkProximity = (userCoords, restaurants, thresholdKm = 0.5) => {
    if (!userCoords || !restaurants) return null;

    return restaurants.find(restaurant => {
        if (!restaurant.coordinates || restaurant.is_visited) return false;

        // Coordinates from Supabase can be {x: lat, y: lng} or point string
        const lat = restaurant.coordinates.x;
        const lng = restaurant.coordinates.y;

        const distance = calculateDistance(
            userCoords.lat, userCoords.lng,
            lat, lng
        );

        return distance <= thresholdKm;
    });
};

export const checkMealTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Lunch: 13:00 (1:00 PM)
    if (hours === 13 && minutes === 0) return 'lunch';
    // Dinner: 20:00 (8:00 PM)
    if (hours === 20 && minutes === 0) return 'dinner';

    return null;
};
