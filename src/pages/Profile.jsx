import { useStore } from '../lib/store';
import { BADGE_LEVELS, getBadgeForVisitCount } from '../lib/badges';
import { motion } from 'framer-motion';
import { LogOut, Trophy, MapPin, Star, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

export default function Profile() {
    const profile = useStore(state => state.profile);
    const restaurants = useStore(state => state.restaurants);
    const navigate = useNavigate();

    const visitedCount = restaurants.filter(r => r.is_visited).length;
    const currentBadge = getBadgeForVisitCount(visitedCount);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            <header className="bg-white p-6 pt-12 rounded-b-[3rem] shadow-sm border-b border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <BrandLogo size={40} animate={false} />
                    <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-95 transition-all">
                        <LogOut size={20} />
                    </button>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-3xl font-black text-brand-orange border-4 border-white shadow-xl">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-brand-orange text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                            <Trophy size={18} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">{profile?.full_name || 'Foodie Explorer'}</h2>
                    <div className={`mt-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${currentBadge.color}`}>
                        Level {currentBadge.level}: {currentBadge.name}
                    </div>
                </div>
            </header>

            <div className="p-6">
                <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.25em] mb-4 ml-2">My Badge Collection</h3>
                <div className="grid grid-cols-2 gap-4">
                    {BADGE_LEVELS.map((badge) => {
                        const isUnlocked = visitedCount >= badge.minVisits;
                        return (
                            <motion.div
                                key={badge.level}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`p-6 rounded-[2.5rem] border flex flex-col items-center text-center relative overflow-hidden transition-all ${isUnlocked ? 'bg-white shadow-lg border-gray-100' : 'bg-gray-100 border-transparent grayscale opacity-40'
                                    }`}
                            >
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner ${isUnlocked ? 'bg-slate-50' : 'bg-gray-200'
                                    }`}>
                                    {badge.icon}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark">{badge.name}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 leading-tight">{badge.minVisits} Visits</p>

                                {isUnlocked && (
                                    <div className="absolute top-3 right-3 text-brand-green">
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                <div className="mt-8 bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-200/50 border border-gray-50">
                    <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-6 flex items-center gap-3">
                        <Trophy size={18} className="text-brand-orange" />
                        Culinary Statistics
                    </h3>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-brand-dark tabular-nums">{visitedCount}</p>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Total Visits</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-brand-dark tabular-nums">{restaurants.length}</p>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Saved Places</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-brand-dark tabular-nums">{profile?.ranking || '#---'}</p>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Global Rank</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black text-brand-dark tabular-nums">
                                {Math.round((visitedCount / (restaurants.length || 1)) * 100)}%
                            </p>
                            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest px-1">Completion</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
