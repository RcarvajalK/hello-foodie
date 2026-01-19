import { useState, useMemo, useEffect } from 'react';
import { Search, List, LayoutGrid, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { useStore } from '../lib/store';
import RestaurantCard from '../components/RestaurantCard';
import BrandLogo from '../components/BrandLogo';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list-photos');
    const [sortBy, setSortBy] = useState('date');

    const restaurants = useStore(state => state.restaurants);
    const profile = useStore(state => state.profile);
    const loading = useStore(state => state.loading);
    const fetchRestaurants = useStore(state => state.fetchRestaurants);
    const fetchProfile = useStore(state => state.fetchProfile);

    useEffect(() => {
        fetchRestaurants();
        fetchProfile();
    }, []);

    const myRestaurants = useMemo(() => {
        let list = [...restaurants];
        if (searchQuery) {
            list = list.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.zone?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        list.sort((a, b) => {
            if (sortBy === 'date') return new Date(b.date_added) - new Date(a.date_added);
            if (sortBy === 'zone') return (a.zone || '').localeCompare(b.zone || '');
            if (sortBy === 'recommender') return (a.recommended_by || '').localeCompare(b.recommended_by || '');
            if (sortBy === 'club') return (a.club_name || '').localeCompare(b.club_name || '');
            return 0;
        });
        return list;
    }, [restaurants, searchQuery, sortBy]);

    const stats = [
        { label: 'To Visit', count: restaurants.filter(r => !r.is_visited).length, color: 'bg-brand-orange' },
        { label: 'Visited', count: restaurants.filter(r => r.is_visited).length, color: 'bg-brand-green' },
        { label: 'Badges', count: profile?.badges_count || 0, color: 'bg-brand-yellow' },
    ];

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            <header className="bg-white p-6 pt-12 rounded-b-[3rem] shadow-xl shadow-slate-200/50 relative z-10 border-b border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <BrandLogo size={48} animate={false} />
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-brand-dark uppercase leading-none">Hello Foodie!</h1>
                            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-300 mt-1">Culinary Journey Log</p>
                        </div>
                    </div>
                    <div className="relative group">
                        <div className="w-12 h-12 bg-slate-50 border-2 border-brand-orange/20 rounded-[1.2rem] flex items-center justify-center font-black text-brand-orange shadow-inner group-hover:scale-110 transition-transform">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search my restaurants..."
                        className="w-full bg-slate-50 py-5 pl-14 pr-6 rounded-[2rem] text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all text-sm font-bold border border-slate-100 shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Stats Section with subtle style */}
            <div className="px-6 -mt-8 grid grid-cols-3 gap-4 mb-8 relative z-20">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/40 border border-gray-50 flex flex-col items-center text-center">
                        <span className={clsx("w-2 h-2 rounded-full mb-2.5", stat.color)}></span>
                        <span className="text-2xl font-black text-brand-dark tabular-nums">{stat.count}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase mt-1.5 tracking-widest">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="px-6 mb-8 flex justify-between items-center">
                <div className="flex bg-slate-200/40 p-1.5 rounded-[1.5rem] backdrop-blur-sm border border-slate-100">
                    {['list', 'list-photos', 'gallery'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={clsx(
                                "p-2.5 rounded-2xl transition-all",
                                viewMode === mode ? "bg-white text-brand-orange shadow-lg scale-110" : "text-gray-400"
                            )}
                        >
                            {mode === 'list' && <List size={22} />}
                            {mode === 'list-photos' && <LayoutGrid size={22} />}
                            {mode === 'gallery' && <ImageIcon size={22} />}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-100 rounded-2xl px-5 py-3 pr-11 text-[10px] font-black text-brand-dark shadow-sm focus:outline-none ring-4 ring-slate-50 cursor-pointer uppercase tracking-widest"
                    >
                        <option value="date">Added Date</option>
                        <option value="zone">Zone/City</option>
                        <option value="club">By Club</option>
                        <option value="recommender">Rec by</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-orange pointer-events-none" size={16} />
                </div>
            </div>

            <div className={clsx(
                "px-6 pb-32 transition-all duration-300",
                viewMode === 'gallery' ? "grid grid-cols-2 gap-5" : "flex flex-col gap-6"
            )}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {loading ? (
                        <div className="col-span-full py-20 text-center font-black text-gray-300 uppercase tracking-widest animate-pulse">Prepping your kitchen...</div>
                    ) : myRestaurants.length > 0 ? (
                        myRestaurants.map((restaurant) => (
                            <motion.div
                                key={restaurant.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            >
                                <RestaurantCard restaurant={restaurant} variant={viewMode} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-24 text-center">
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-6 transform rotate-6 border border-gray-50">
                                <BrandLogo size={56} className="grayscale opacity-20" animate={false} />
                            </div>
                            <p className="text-brand-dark font-black uppercase tracking-tight text-lg">Your Feed is empty</p>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-[0.2em]">Add places to see them here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
