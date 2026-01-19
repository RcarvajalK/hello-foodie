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
        <div className="pb-24 bg-slate-50 min-h-screen">
            <header className="bg-brand-orange p-5 pt-12 rounded-b-[2.5rem] shadow-lg text-white relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-2xl shadow-inner">
                            <BrandLogo size={32} />
                        </div>
                        <h1 className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">Hello Foodie!</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/30">
                        <div className="w-8 h-8 bg-white text-brand-orange rounded-full flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-brand-orange/20">
                            {profile?.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[10px] font-bold opacity-80 leading-none">RANKING</p>
                            <p className="text-xs font-black">{profile?.ranking || '#---'}</p>
                        </div>
                    </div>
                </div>

                <div className="relative mb-4 relative z-10">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search in my list..."
                        className="w-full bg-white/95 backdrop-blur-sm py-4 pl-12 pr-4 rounded-2xl text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-yellow/30 transition-all shadow-lg text-sm font-bold"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <div className="px-5 -mt-8 grid grid-cols-3 gap-3 mb-8 relative z-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-2xl shadow-md border border-gray-50 flex flex-col items-center text-center active:scale-95 transition-transform">
                        <span className={clsx("w-2.5 h-2.5 rounded-full mb-2", stat.color, "ring-4 ring-slate-50")}></span>
                        <span className="text-2xl font-black text-brand-dark leading-none">{stat.count}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase mt-1.5 tracking-widest">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="px-5 mb-6 flex justify-between items-center">
                <div className="flex bg-slate-200/50 p-1 rounded-2xl">
                    {['list', 'list-photos', 'gallery'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={clsx(
                                "p-2.5 rounded-xl transition-all",
                                viewMode === mode ? "bg-white text-brand-orange shadow-md scale-105" : "text-gray-400 hover:text-brand-orange/50"
                            )}
                        >
                            {mode === 'list' && <List size={20} />}
                            {mode === 'list-photos' && <LayoutGrid size={20} />}
                            {mode === 'gallery' && <ImageIcon size={20} />}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-100 rounded-2xl px-4 py-2.5 pr-10 text-xs font-black text-brand-dark shadow-sm focus:outline-none ring-1 ring-gray-100 cursor-pointer uppercase tracking-wider"
                    >
                        <option value="nearby">Nearby</option>
                        <option value="zone">Zone/City</option>
                        <option value="date">Added Date</option>
                        <option value="club">By Club</option>
                        <option value="recommender">Recommended</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
            </div>

            <div className={clsx(
                "px-5 pb-10 transition-all duration-300",
                viewMode === 'gallery' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"
            )}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-gray-400 font-black uppercase tracking-widest animate-pulse">Loading your feed...</div>
                    ) : myRestaurants.length > 0 ? (
                        myRestaurants.map((restaurant) => (
                            <motion.div
                                key={restaurant.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <RestaurantCard restaurant={restaurant} variant={viewMode} />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <BrandLogo size={40} className="grayscale opacity-30" />
                            </div>
                            <p className="text-gray-500 font-bold uppercase tracking-tight">Your table is ready!</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-black tracking-widest">Add your first restaurant to start.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
