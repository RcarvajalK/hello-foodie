export const XP_CONSTANTS = {
    VISIT: 100,
    RATING: 50,
    COMMENT: 50,
    PHOTO: 50,
    FAVORITE: 20
};

export const BADGE_LEVELS = [
    {
        level: 1,
        name: "Appetizer",
        xpThreshold: 0,
        icon: "🍴",
        color: "bg-slate-100 text-slate-400",
        description: "Welcome! Your culinary journey begins now."
    },
    {
        level: 2,
        name: "Flavor Seeker",
        xpThreshold: 500,
        icon: "🔍",
        color: "bg-brand-orange-light/10 text-brand-orange-light",
        description: "You're starting to find your favorite flavors."
    },
    {
        level: 3,
        name: "The Connoisseur",
        xpThreshold: 1500,
        icon: "🌟",
        color: "bg-brand-orange/10 text-brand-orange",
        description: "A true expert of the local food scene."
    },
    {
        level: 4,
        name: "Epicurean Master",
        xpThreshold: 3500,
        icon: "👑",
        color: "bg-brand-yellow/20 text-brand-dark",
        description: "Nothing escapes your sophisticated palate."
    },
    {
        level: 5,
        name: "Culinary Legend",
        xpThreshold: 7000,
        icon: "🏆",
        color: "bg-brand-dark text-white",
        description: "You are the ultimate authority on all things delicious."
    }
];

export const SPECIAL_BADGES = [
    {
        id: 'pizzarazzi',
        name: 'Pizzarazzi',
        subtitle: 'Master of Dough',
        description: 'Visit 5 pizzerias',
        iconType: 'pizza',
        color: '#FF6B6B',
        check: (restaurants) => restaurants.filter(r => r.is_visited && r.cuisine?.toLowerCase().includes('pizza')).length >= 5
    },
    {
        id: 'sushi-master',
        name: 'Sushi Master',
        subtitle: 'Raw Fish Expert',
        description: 'Visit 5 sushi spots',
        iconType: 'sushi',
        color: '#4ECDC4',
        check: (restaurants) => restaurants.filter(r => r.is_visited && (r.cuisine?.toLowerCase().includes('sushi') || r.cuisine?.toLowerCase().includes('japanese'))).length >= 5
    },
    {
        id: 'night-owl',
        name: 'Night Owl',
        subtitle: 'Latenight Foodie',
        description: '5 visits after 10 PM',
        iconType: 'moon',
        color: '#111827',
        check: (restaurants) => restaurants.filter(r => {
            if (!r.is_visited || !r.visited_at) return false;
            const hour = new Date(r.visited_at).getHours();
            return hour >= 22 || hour < 5;
        }).length >= 5
    },
    {
        id: 'taco-legend',
        name: 'Taco Legend',
        subtitle: 'Street Food Star',
        description: 'Visit 10 taco places',
        iconType: 'taco',
        color: '#FFE66D',
        check: (restaurants) => restaurants.filter(r => r.is_visited && r.cuisine?.toLowerCase().includes('taco')).length >= 10
    }
];

export const calculateXP = (restaurants) => {
    return restaurants.reduce((acc, r) => {
        let xp = 0;
        if (r.is_visited) {
            xp += XP_CONSTANTS.VISIT;
            if (r.rating > 0) xp += XP_CONSTANTS.RATING;
            if (r.review_comment?.length > 0) xp += XP_CONSTANTS.COMMENT;
            if (r.image_url) xp += XP_CONSTANTS.PHOTO;
        } else if (r.is_favorite) {
            xp += XP_CONSTANTS.FAVORITE;
        }
        return acc + xp;
    }, 0);
};

export const getLevelFromXP = (xp) => {
    return [...BADGE_LEVELS].reverse().find(l => xp >= l.xpThreshold) || BADGE_LEVELS[0];
};

export const getNextLevelFromXP = (xp) => {
    return BADGE_LEVELS.find(l => l.xpThreshold > xp) || null;
};
