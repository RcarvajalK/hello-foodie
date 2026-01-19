export const BADGE_LEVELS = [
    {
        level: 1,
        name: "Small Bite",
        minVisits: 0,
        icon: "🍴",
        color: "bg-slate-100 text-slate-400",
        description: "Welcome to the foodie community! Start your journey."
    },
    {
        level: 2,
        name: "Flavor Hunter",
        minVisits: 5,
        icon: "🔍",
        color: "bg-brand-orange/10 text-brand-orange",
        description: "You've successfully explored 5 delicious spots!"
    },
    {
        level: 3,
        name: "Gourmet Scout",
        minVisits: 15,
        icon: "🌟",
        color: "bg-brand-yellow/20 text-brand-dark",
        description: "15 restaurants? You're a local culinary authority."
    },
    {
        level: 4,
        name: "Culinary Legend",
        minVisits: 30,
        icon: "👑",
        color: "bg-brand-dark text-white",
        description: "The ultimate foodie. Nothing escapes your palate."
    }
];

export const getBadgeForVisitCount = (count) => {
    return [...BADGE_LEVELS].reverse().find(b => count >= b.minVisits) || BADGE_LEVELS[0];
};
