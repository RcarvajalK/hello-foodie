import { useState, useMemo } from 'react';
import { Search, List, LayoutGrid, Image as ImageIcon, ChevronDown, Star } from 'lucide-react';
import { mockRestaurants } from '../lib/data';
import { useStore } from '../lib/store';
import RestaurantCard from '../components/RestaurantCard';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('list-photos'); // 'list', 'list-photos', 'gallery'
    const [sortBy, setSortBy] = useState('date'); // 'nearby', 'zone', 'date', 'club', 'recommender'

    const savedIds = useStore(state => state.savedIds);
    const visitedIds = useStore(state => state.visitedIds);
    const userInfo = useStore(state => state.userInfo);

    // Filter restaurants that are in the user's list (saved or visited)
    const myRestaurants = useMemo(() => {
        // For this prototype hub, we show ALL restaurants but highlight they are in the "list"
        // However, the prompt says "hub principal, punto central de MI lista", so I will filter
        const allIds = Array.from(new Set([...savedIds, ...visitedIds]));

        // If list is empty in prototype, we show everything as "Suggestions" but let's stick to the prompt
        // and show the user's list. I'll include all mock data if list is empty for better demo, 
        // but the logic should be based on existence in list.
        let list = mockRestaurants.filter(r => allIds.length === 0 || allIds.includes(r.id));

        // Search filter
        if (searchQuery) {
            list = list.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.zone?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Sorting logic
        list.sort((a, b) => {
            if (sortBy === 'date') return new Date(b.dateAdded) - new Date(a.dateAdded);
            if (sortBy === 'zone') return (a.zone || '').localeCompare(b.zone || '');
            if (sortBy === 'recommender') return (a.recommendedBy || '').localeCompare(b.recommendedBy || '');
            if (sortBy === 'club') return (a.club || '').localeCompare(b.club || '');
            return 0;
        });

        return list;
    }, [savedIds, visitedIds, searchQuery, sortBy]);

    const stats = [
        { label: 'To Visit', count: savedIds.length, color: 'bg-brand-orange' },
        { label: 'Visited', count: visitedIds.length, color: 'bg-brand-green' },
        { label: 'Badges', count: userInfo.stats.badges, color: 'bg-brand-yellow' },
    ];

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            {/* Header Section */}
            <header className="bg-brand-orange p-5 pt-12 rounded-b-[2.5rem] shadow-lg text-white">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand-orange shadow-inner">
                            <Star size={24} fill="currentColor" />
                        </div>
                        <h1 className="text-xl font-black tracking-tight uppercase">Hello Foodie!</h1>
                    </div>
                    <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md p-1.5 pr-4 rounded-full border border-white/30">
                        <div className="w-8 h-8 bg-white text-brand-orange rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                            {userInfo.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-[10px] font-bold opacity-80 leading-none">RANKING</p>
                            <p className="text-xs font-black">#42 Foodie</p>
                        </div>
                    </div>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search in my list..."
                        className="w-full bg-white/95 backdrop-blur-sm py-4 pl-12 pr-4 rounded-2xl text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow transition-all shadow-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Stats Cards */}
            <div className="px-5 -mt-8 grid grid-cols-3 gap-3 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-4 rounded-2xl shadow-md border border-gray-50 flex flex-col items-center text-center">
                        <span className={clsx("w-2 h-2 rounded-full mb-2", stat.color)}></span>
                        <span className="text-2xl font-black text-brand-dark leading-none">{stat.count}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-wider">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Controls: View Modes & Sorting */}
            <div className="px-5 mb-6 flex justify-between items-center">
                <div className="flex bg-gray-200/50 p-1 rounded-2xl">
                    <button
                        onClick={() => setViewMode('list')}
                        className={clsx("p-2.5 rounded-xl transition-all", viewMode === 'list' ? "bg-white text-brand-orange shadow-sm scale-105" : "text-gray-400")}
                    >
                        <List size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('list-photos')}
                        className={clsx("p-2.5 rounded-xl transition-all", viewMode === 'list-photos' ? "bg-white text-brand-orange shadow-sm scale-105" : "text-gray-400")}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => setViewMode('gallery')}
                        className={clsx("p-2.5 rounded-xl transition-all", viewMode === 'gallery' ? "bg-white text-brand-orange shadow-sm scale-105" : "text-gray-400")}
                    >
                        <ImageIcon size={20} />
                    </button>
                </div>

                <div className="relative">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-100 rounded-2xl px-4 py-2.5 pr-10 text-xs font-bold text-brand-dark shadow-sm focus:outline-none ring-1 ring-gray-100 cursor-pointer"
                    >
                        <option value="nearby">Nearby</option>
                        <option value="zone">By Zone/City</option>
                        <option value="date">By Date Added</option>
                        <option value="club">By Club</option>
                        <option value="recommender">By Recommended</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                </div>
            </div>

            {/* Restaurant List */}
            <div className={clsx(
                "px-5 pb-10 transition-all duration-300",
                viewMode === 'gallery' ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"
            )}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {myRestaurants.length > 0 ? (
                        myRestaurants.map((restaurant) => (
                            <motion.div
                                key={restaurant.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <RestaurantCard
                                    restaurant={restaurant}
                                    variant={viewMode}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <List size={40} />
                            </div>
                            <p className="text-gray-500 font-bold">Your list is waiting!</p>
                            <p className="text-xs text-gray-400 mt-1">Start saving places to see them here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
