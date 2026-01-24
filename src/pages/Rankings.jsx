import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Globe, ChevronRight, Medal, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getBadgeForVisitCount } from '../lib/badges';
import BrandLogo from '../components/BrandLogo';
import clsx from 'clsx';

export default function Rankings() {
    const [activeTab, setActiveTab] = useState('global');
    const rankings = useStore(state => state.rankings);
    const fetchRankings = useStore(state => state.fetchRankings);
    const clubs = useStore(state => state.clubs);
    const fetchClubs = useStore(state => state.fetchClubs);
    const profile = useStore(state => state.profile);
    const loading = useStore(state => state.loading);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRankings();
        fetchClubs();
    }, []);

    // Friends = Anyone sharing a club with the current user
    const friendIds = useMemo(() => {
        if (!profile || !clubs.length) return new Set();
        // Since clubs are only the ones the user belongs to (based on fetchClubs logic typically)
        // or we need to ensure we have the member list.
        // Let's look at the club members we have in the state.
        const ids = new Set();
        clubs.forEach(club => {
            // Note: club objects usually don't have full member lists here unless specifically fetched
            // But we can assume people in your club are your "friends" for this v1.
            // If the store's fetchClubs only returns your clubs, we need to know who ELSE is in them.
            // For now, let's treat the global ranking as primary and social one as restricted.
        });
        return ids;
    }, [clubs, profile]);

    const filteredRankings = useMemo(() => {
        if (activeTab === 'global') return rankings;
        // Mock friend filtering if logic is complex - for now show current user and a few top ones
        return rankings; // Logic would filter by friendIds here
    }, [rankings, activeTab]);

    const getRankColor = (index) => {
        if (index === 0) return 'text-yellow-500 bg-yellow-50';
        if (index === 1) return 'text-slate-400 bg-slate-50';
        if (index === 2) return 'text-amber-600 bg-amber-50';
        return 'text-gray-400 bg-gray-50';
    };

    return (
        <div className="pb-32 bg-[#F8FAFC] min-h-screen">
            <header className="bg-white px-6 pt-12 pb-6 rounded-b-[3.5rem] shadow-sm relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-orange/10 p-2.5 rounded-2xl">
                            <Trophy className="text-brand-orange" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-brand-dark uppercase tracking-tight">Leaderboard</h1>
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400">Top Foodies Ranking</p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-1.5 rounded-[2rem] flex border border-gray-100/50">
                    <button
                        onClick={() => setActiveTab('global')}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] transition-all",
                            activeTab === 'global' ? "bg-white text-brand-orange shadow-md" : "text-gray-400"
                        )}
                    >
                        <Globe size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Global</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] transition-all",
                            activeTab === 'friends' ? "bg-white text-brand-orange shadow-md" : "text-gray-400"
                        )}
                    >
                        <Users size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Friends</span>
                    </button>
                </div>
            </header>

            <div className="p-6">
                {loading ? (
                    <div className="py-20 text-center font-black text-gray-300 uppercase tracking-widest animate-pulse">
                        Calculating Ranks...
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {filteredRankings.map((user, index) => {
                                const isCurrentUser = user.id === profile?.id;
                                const badge = getBadgeForVisitCount(user.visit_count);

                                return (
                                    <motion.div
                                        key={user.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={clsx(
                                            "bg-white p-4 rounded-[2rem] border-2 flex items-center gap-4 transition-all",
                                            isCurrentUser ? "border-brand-orange bg-brand-orange/[0.02]" : "border-transparent"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-inner shrink-0",
                                            getRankColor(index)
                                        )}>
                                            {index + 1}
                                        </div>

                                        <div className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-black text-brand-orange uppercase">
                                                    {user.full_name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-black text-brand-dark text-[11px] uppercase tracking-tight truncate">
                                                    {user.full_name || 'Anonymous Foodie'}
                                                </h3>
                                                {isCurrentUser && <span className="bg-brand-orange/10 text-brand-orange text-[7px] font-black px-1.5 py-0.5 rounded-md uppercase">You</span>}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{badge.name}</span>
                                                <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                <span className="text-[8px] font-black text-brand-orange uppercase tabular-nums">{user.visit_count} Visited</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 rounded-full">
                                            <Star size={10} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-[10px] font-black tabular-nums">{user.visit_count * 10}</span>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {!loading && filteredRankings.length === 0 && (
                <div className="py-24 text-center">
                    <Globe size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-brand-dark font-black uppercase tracking-tight">No rankings yet</p>
                    <p className="text-[10px] text-gray-400 mt-2 uppercase font-black">Be the first to explore!</p>
                </div>
            )}
        </div>
    );
}
