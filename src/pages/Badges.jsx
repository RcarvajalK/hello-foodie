import { useStore } from '../lib/store';
import { BADGE_LEVELS, getBadgeForVisitCount } from '../lib/badges';
import { motion } from 'framer-motion';
import { Trophy, Star, ChevronRight, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

export default function Badges() {
    const restaurants = useStore(state => state.restaurants);
    const navigate = useNavigate();
    const visitedCount = restaurants.filter(r => r.is_visited).length;
    const currentBadge = getBadgeForVisitCount(visitedCount);

    const nextBadge = BADGE_LEVELS.find(b => b.minVisits > visitedCount);
    const progressToNext = nextBadge
        ? Math.min(100, (visitedCount / nextBadge.minVisits) * 100)
        : 100;

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            <header className="bg-white p-6 pt-12 rounded-b-[3rem] shadow-xl shadow-slate-200/50 relative z-10 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-dark"
                    >
                        <ChevronRight className="rotate-180" size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-brand-dark uppercase leading-none">Your Achievements</h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-300 mt-1">Culinary Milestones</p>
                    </div>
                </div>

                <div className="bg-brand-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-md border border-white/20">
                                {currentBadge.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Current Rank</p>
                                <h2 className="text-xl font-black uppercase tracking-tight">{currentBadge.name}</h2>
                            </div>
                        </div>

                        {nextBadge ? (
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange-light">Next: {nextBadge.name}</p>
                                    <p className="text-xs font-black">{nextBadge.minVisits - visitedCount} visits left</p>
                                </div>
                                <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressToNext}%` }}
                                        className="h-full bg-brand-orange rounded-full"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-brand-yellow">
                                <Star fill="currentColor" size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Max Level Achieved!</span>
                            </div>
                        )}
                    </div>
                    <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none"></div>
                </div>
            </header>

            <div className="p-6 space-y-6">
                <h3 className="text-sm font-black text-brand-dark uppercase tracking-[0.2em] ml-2">Badge Collection</h3>
                <div className="space-y-4">
                    {BADGE_LEVELS.map((badge) => {
                        const isUnlocked = visitedCount >= badge.minVisits;
                        return (
                            <motion.div
                                key={badge.level}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-center gap-5 p-5 rounded-[2.2rem] border transition-all ${isUnlocked
                                        ? 'bg-white shadow-xl shadow-slate-200/40 border-gray-50'
                                        : 'bg-slate-100/50 border-transparent opacity-60 grayscale'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${isUnlocked ? 'bg-slate-50' : 'bg-slate-200'
                                    }`}>
                                    {badge.icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-brand-dark uppercase tracking-tight text-sm">{badge.name}</h4>
                                        {isUnlocked ? (
                                            <CheckCircle2 size={14} className="text-brand-green" />
                                        ) : (
                                            <Lock size={12} className="text-gray-400" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium leading-tight">{badge.description}</p>
                                </div>
                                <div className="text-center flex-shrink-0 min-w-[60px]">
                                    <p className="text-lg font-black text-brand-dark leading-none">{badge.minVisits}</p>
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-1">Visits</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/40 border border-gray-50 mt-8">
                    <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-6 flex items-center gap-3">
                        <Trophy size={18} className="text-brand-orange" />
                        Next Challenges
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-brand-orange"></div>
                            <p>Visit 5 new restaurants this month</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-brand-green"></div>
                            <p>Review 3 places you've visited</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                            <p>Try 3 different types of cuisines</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
