import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, List, LayoutGrid, Image as ImageIcon, ChevronDown, Heart } from 'lucide-react';
import { useStore } from '../lib/store';
import RestaurantCard from '../components/RestaurantCard';
import BrandLogo from '../components/BrandLogo';
import clsx from 'clsx';
import { getRestaurantImage, DEFAULT_RESTAURANT_IMAGE } from '../lib/images';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGE_LEVELS } from '../lib/badges';


export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('foodie_view_mode') || 'list');
    const [sortBy, setSortBy] = useState('distance');
    const [filterCuisine, setFilterCuisine] = useState('All');
    const [userCoords, setUserCoords] = useState(null);
    const [onlyFavorites, setOnlyFavorites] = useState(false);
    const navigate = useNavigate();

    const restaurants = useStore(state => state.restaurants);
    const profile = useStore(state => state.profile);
    const loading = useStore(state => state.loading);
    const fetchRestaurants = useStore(state => state.fetchRestaurants);
    const fetchProfile = useStore(state => state.fetchProfile);
    const deleteRestaurant = useStore(state => state.deleteRestaurant);

    useEffect(() => {
        localStorage.setItem('foodie_view_mode', viewMode);
    }, [viewMode]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Borrar este restaurante de tu lista?')) {
            await deleteRestaurant(id);
        }
    };

    useEffect(() => {
        fetchRestaurants();
        fetchProfile();

        navigator.geolocation.getCurrentPosition(
            (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.log('Geolocation error', err)
        );
    }, []);

    const calculateDistance = (r) => {
        if (!userCoords || !r.coordinates) return Infinity;
        // Simple distance calculation (not accounting for curvature but fine for local)
        const dx = (r.coordinates.x || 0) - userCoords.lat;
        const dy = (r.coordinates.y || 0) - userCoords.lng;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const myRestaurants = useMemo(() => {
        let list = [...restaurants];
        list = list.filter(r => !r.is_visited);

        if (filterCuisine !== 'All') {
            list = list.filter(r => r.cuisine?.toLowerCase().includes(filterCuisine.toLowerCase()));
        }

        if (searchQuery) {
            list = list.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.zone?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        list.sort((a, b) => {
            if (sortBy === 'date') return new Date(b.date_added) - new Date(a.date_added);
            if (sortBy === 'distance') return calculateDistance(a) - calculateDistance(b);
            if (sortBy === 'zone') return (a.zone || '').localeCompare(b.zone || '');
            if (sortBy === 'recommender') return (a.recommended_by || '').localeCompare(b.recommended_by || '');
            if (sortBy === 'club') return (a.club_name || '').localeCompare(b.club_name || '');
            return 0;
        });

        if (onlyFavorites) {
            list = list.filter(r => r.is_favorite);
        }

        return list;
    }, [restaurants, searchQuery, sortBy, filterCuisine, userCoords, onlyFavorites]);

    const recommended = useMemo(() => {
        if (!profile?.favorite_cuisines?.length) return null;
        // Find saved restaurants that match user's favorite cuisines
        return restaurants
            .filter(r => !r.is_visited && profile.favorite_cuisines.some(c => r.cuisine?.toLowerCase().includes(c.toLowerCase())))
            .slice(0, 3);
    }, [restaurants, profile]);

    const visitedCount = restaurants.filter(r => r.is_visited).length;
    const badgesCount = BADGE_LEVELS.filter(b => visitedCount >= b.minVisits).length;

    const stats = [
        { label: 'To Visit', count: restaurants.filter(r => !r.is_visited).length, color: 'bg-brand-orange', link: '/' },
        { label: 'Visited', count: visitedCount, color: 'bg-brand-green', link: '/visited' },
        { label: 'Badges', count: badgesCount, color: 'bg-brand-yellow', link: '/badges' },
    ];


    const cuisines = ['All', ...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            <header className="bg-white p-6 pt-12 rounded-b-[3rem] shadow-xl shadow-slate-200/50 relative z-10 border-b border-gray-100">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <BrandLogo size={48} animate={false} />
                        <div>
                            <h1 className="text-2xl font-black tracking-tighter text-brand-dark uppercase leading-none">Hello Foodie!</h1>
                            <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-300 mt-1">Your Culinary Journey</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setOnlyFavorites(!onlyFavorites)}
                            className={clsx(
                                "w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all shadow-inner active:scale-95",
                                onlyFavorites ? "bg-red-500 text-white shadow-red-200" : "bg-slate-50 text-red-400 border-2 border-red-50/50"
                            )}
                        >
                            <Heart size={22} fill={onlyFavorites ? "currentColor" : "none"} strokeWidth={onlyFavorites ? 0 : 2.5} />
                        </button>
                        <div className="relative group" onClick={() => navigate('/profile')}>
                            <div className="w-12 h-12 bg-slate-50 border-2 border-brand-orange/20 rounded-[1.2rem] flex items-center justify-center font-black text-brand-orange shadow-inner group-hover:scale-110 transition-transform cursor-pointer overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    profile?.full_name?.charAt(0) || 'U'
                                )}
                            </div>
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

            {/* Stats Section */}
            <div className="px-6 -mt-8 grid grid-cols-3 gap-4 mb-8 relative z-20">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        onClick={() => stat.link && navigate(stat.link)}
                        className="bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/40 border border-gray-50 flex flex-col items-center text-center cursor-pointer active:scale-95 transition-transform"
                    >
                        <span className={clsx("w-2 h-2 rounded-full mb-2.5", stat.color)}></span>
                        <span className="text-2xl font-black text-brand-dark tabular-nums">{stat.count}</span>
                        <span className="text-[9px] font-black text-gray-400 uppercase mt-1.5 tracking-widest">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Recommendations Section */}
            {recommended?.length > 0 && (
                <div className="px-6 mb-10">
                    <div className="flex items-center justify-between mb-5 px-1">
                        <h3 className="text-[10px] font-black uppercase text-brand-dark tracking-[0.25em]">Recommended for you</h3>
                        <div className="flex gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand-orange"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                        </div>
                    </div>
                    <div className="flex gap-5 overflow-x-auto pb-6 no-scrollbar snap-x snap-mandatory">
                        {recommended.map(r => (
                            <div
                                key={r.id}
                                onClick={() => navigate(`/restaurant/${r.id}`)}
                                className="flex-shrink-0 w-[80vw] bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-gray-50 active:scale-95 transition-all snap-center relative overflow-hidden"
                            >
                                <div className="h-48 rounded-[2rem] overflow-hidden mb-4 relative">
                                    <img
                                        src={getRestaurantImage(r.image_url || r.image)}
                                        className="w-full h-full object-cover"
                                        onError={(e) => e.target.src = DEFAULT_RESTAURANT_IMAGE}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center shadow-lg">
                                        <Star size={12} className="text-brand-orange fill-brand-orange mr-1" />
                                        <span className="text-[10px] font-black text-brand-dark">{r.rating || '---'}</span>
                                    </div>
                                </div>
                                <div className="px-2">
                                    <h4 className="font-black text-sm text-brand-dark uppercase truncate mb-1 tracking-tight">{r.name}</h4>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{r.cuisine}</p>
                                        <span className="text-xs font-black text-brand-orange">{r.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-6 mb-8 flex flex-col gap-4">
                <div className="flex overflow-x-auto gap-2 no-scrollbar py-1">
                    {cuisines.map(c => (
                        <button
                            key={c}
                            onClick={() => setFilterCuisine(c)}
                            className={clsx(
                                "px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all shadow-sm",
                                filterCuisine === c ? "bg-brand-orange text-white" : "bg-white text-gray-400 border border-gray-100"
                            )}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex bg-slate-200/40 p-1.5 rounded-[1.5rem] backdrop-blur-sm border border-slate-100">
                        {[
                            { id: 'list', icon: List },
                            { id: 'list-photos', icon: LayoutGrid },
                            { id: 'gallery', icon: ImageIcon }
                        ].map(modeItem => {
                            const Icon = modeItem.icon;
                            return (
                                <button
                                    key={modeItem.id}
                                    onClick={() => setViewMode(modeItem.id)}
                                    className={clsx(
                                        "p-2.5 rounded-2xl transition-all",
                                        viewMode === modeItem.id ? "bg-white text-brand-orange shadow-lg scale-110" : "text-gray-400"
                                    )}
                                >
                                    <Icon size={22} />
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none bg-white border border-gray-100 rounded-2xl px-5 py-3 pr-11 text-[10px] font-black text-brand-dark shadow-sm focus:outline-none ring-4 ring-slate-50 cursor-pointer uppercase tracking-widest"
                        >
                            <option value="date">Added Date</option>
                            <option value="distance">Nearest</option>
                            <option value="zone">Zone/City</option>
                            <option value="club">By Club</option>
                            <option value="recommender">Rec by</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-orange pointer-events-none" size={16} />
                    </div>
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
                                <RestaurantCard
                                    restaurant={restaurant}
                                    variant={viewMode}
                                    onDelete={handleDelete}
                                />
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
