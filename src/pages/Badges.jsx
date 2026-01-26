import { useStore } from '../lib/store';
import { BADGE_LEVELS, getLevelFromXP, getNextLevelFromXP, calculateXP, SPECIAL_BADGES } from '../lib/badges';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ChevronRight, Lock, CheckCircle2, Share2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandingIcon from '../components/BrandLogo'; // Reusing BrandingIcon for consistent look
import { useState, useMemo } from 'react';
import clsx from 'clsx';

export default function Badges() {
    const restaurants = useStore(state => state.restaurants);
    const navigate = useNavigate();
    const [selectedBadge, setSelectedBadge] = useState(null);

    const userXP = useMemo(() => calculateXP(restaurants), [restaurants]);
    const currentLevel = useMemo(() => getLevelFromXP(userXP), [userXP]);
    const nextLevel = useMemo(() => getNextLevelFromXP(userXP), [userXP]);

    const xpProgress = useMemo(() => {
        if (!nextLevel) return 100;
        const currentThreshold = currentLevel.xpThreshold;
        const nextThreshold = nextLevel.xpThreshold;
        const progress = ((userXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
        return Math.min(100, Math.max(0, progress));
    }, [userXP, currentLevel, nextLevel]);

    const BadgeIcon = ({ type, color, isUnlocked }) => {
        const iconStyles = "w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shadow-sm";
        const unlockedStyles = `bg-white text-white`;
        const lockedStyles = "bg-slate-100 text-slate-300";

        const renderIcon = () => {
            switch (type) {
                case 'pizza': return '🍕';
                case 'sushi': return '🍣';
                case 'moon': return '🌙';
                case 'taco': return '🌮';
                case 'people': return '👥';
                default: return '🏅';
            }
        };

        return (
            <div
                className={clsx(iconStyles, isUnlocked ? unlockedStyles : lockedStyles)}
                style={isUnlocked ? { backgroundColor: color } : {}}
            >
                {renderIcon()}
            </div>
        );
    };

    return (
        <div className="pb-32 bg-[#F8FAFC] min-h-screen">
            <header className="bg-white p-6 pt-12 rounded-b-[3.5rem] shadow-xl shadow-slate-200/40 relative z-10 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-brand-dark active:scale-90 transition-all"
                    >
                        <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-brand-dark uppercase leading-none">Milestones</h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-300 mt-1">Culinary Journey</p>
                    </div>
                </div>

                <div className="bg-brand-dark rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-4xl backdrop-blur-xl border border-white/20 shadow-inner">
                                {currentLevel.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange-light opacity-80 mb-1">Current Rank</p>
                                <h2 className="text-2xl font-black uppercase tracking-tight">{currentLevel.name}</h2>
                                <p className="text-[10px] font-bold text-white/40 uppercase mt-1">Level {currentLevel.level}</p>
                            </div>
                        </div>

                        {nextLevel ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end px-1">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-white/60">
                                        Next: <span className="text-brand-orange-light">{nextLevel.name}</span>
                                    </p>
                                    <p className="text-xs font-black">{nextLevel.xpThreshold - userXP} XP left</p>
                                </div>
                                <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden p-1 border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${xpProgress}%` }}
                                        className="h-full bg-brand-orange rounded-full shadow-[0_0_15px_rgba(255,107,107,0.5)]"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 animate-pulse">
                                <Star fill="#FFE66D" className="text-brand-yellow" size={20} />
                                <span className="text-sm font-black uppercase tracking-widest">Master of All Flavors Achieved!</span>
                            </div>
                        )}
                    </div>
                    <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-brand-orange/20 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>
                </div>
            </header>

            <div className="p-6 space-y-10">
                {/* Special Badges Section */}
                <section>
                    <div className="flex justify-between items-center mb-6 px-2">
                        <h3 className="text-sm font-black text-brand-dark uppercase tracking-[0.2em]">Culinary Mastery</h3>
                        <div className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                            {SPECIAL_BADGES.filter(b => b.check(restaurants)).length} Unlocked
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5">
                        {SPECIAL_BADGES.map((badge) => {
                            const isUnlocked = badge.check(restaurants);
                            return (
                                <motion.div
                                    key={badge.id}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => isUnlocked && setSelectedBadge(badge)}
                                    className={clsx(
                                        "p-6 rounded-[3rem] border-2 flex flex-col items-center text-center relative overflow-hidden transition-all duration-500",
                                        isUnlocked
                                            ? "bg-white shadow-xl shadow-slate-200/40 border-white"
                                            : "bg-slate-100/50 border-transparent opacity-40 grayscale pointer-events-none"
                                    )}
                                >
                                    <BadgeIcon
                                        type={badge.iconType}
                                        color={badge.color}
                                        isUnlocked={isUnlocked}
                                    />
                                    <h4 className="mt-4 font-black text-brand-dark uppercase tracking-tight text-xs">{badge.name}</h4>
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-60">
                                        {isUnlocked ? badge.subtitle : 'Locked'}
                                    </p>

                                    {isUnlocked && (
                                        <div className="absolute top-4 right-4 text-brand-green">
                                            <CheckCircle2 size={14} />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </section>

                {/* Milestone Progression Section */}
                <section>
                    <h3 className="text-sm font-black text-brand-dark uppercase tracking-[0.2em] mb-6 px-2">Road to Legend</h3>
                    <div className="space-y-4">
                        {BADGE_LEVELS.map((badge) => {
                            const isUnlocked = userXP >= badge.xpThreshold;
                            const isCurrent = currentLevel.level === badge.level;

                            return (
                                <motion.div
                                    key={badge.level}
                                    className={clsx(
                                        "flex items-center gap-5 p-5 rounded-[2.5rem] border transition-all",
                                        isCurrent ? "bg-white shadow-2xl border-brand-orange/20 scale-[1.02] z-20 relative" :
                                            isUnlocked ? "bg-white shadow-lg border-gray-50 opacity-80" : "bg-slate-100/50 border-transparent opacity-40 grayscale"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-14 h-14 rounded-[1.5rem] flex items-center justify-center text-2xl flex-shrink-0 shadow-sm transition-colors",
                                        isUnlocked ? "bg-slate-50" : "bg-slate-200"
                                    )}>
                                        {badge.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-black text-brand-dark uppercase tracking-tight text-xs">Level {badge.level}: {badge.name}</h4>
                                            {isUnlocked ? (
                                                <CheckCircle2 size={14} className="text-brand-green" />
                                            ) : (
                                                <Lock size={12} className="text-gray-400" />
                                            )}
                                        </div>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-tight tracking-tight">{badge.description}</p>
                                    </div>
                                    <div className="text-center flex-shrink-0 min-w-[70px]">
                                        <p className="text-sm font-black text-brand-dark leading-none">{badge.xpThreshold}</p>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">XP</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </section>
            </div>

            {/* Badge Detail Dialog */}
            <AnimatePresence>
                {selectedBadge && (
                    <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedBadge(null)}
                            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-sm rounded-t-[3.5rem] p-10 flex flex-col items-center text-center shadow-2xl relative z-[110]"
                        >
                            <div className="w-16 h-1.5 bg-gray-100 rounded-full mb-8 absolute top-4 left-1/2 -translate-x-1/2" />

                            <div className="mb-8 p-1 relative">
                                <BadgeIcon
                                    type={selectedBadge.iconType}
                                    color={selectedBadge.color}
                                    isUnlocked={true}
                                />
                                <div className="absolute inset-0 bg-current opacity-20 blur-2xl rounded-full" style={{ color: selectedBadge.color }} />
                            </div>

                            <h2 className="text-3xl font-black text-brand-dark uppercase mb-1">{selectedBadge.name}</h2>
                            <p className="text-brand-orange font-black uppercase tracking-widest text-xs mb-4">"{selectedBadge.subtitle}"</p>

                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-8">
                                {selectedBadge.description}. You've earned this for your incredible foodie passion!
                            </p>

                            <div className="w-full space-y-3">
                                <button
                                    className="w-full bg-brand-orange text-white font-black py-5 rounded-[2rem] shadow-xl shadow-brand-orange/30 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3"
                                >
                                    <Share2 size={18} />
                                    Share to Stories
                                </button>
                                <button
                                    onClick={() => setSelectedBadge(null)}
                                    className="w-full py-4 text-gray-400 font-black uppercase text-[10px] tracking-[0.2em] outline-none"
                                >
                                    Close Detail
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
