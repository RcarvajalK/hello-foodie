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

        // Inject Sponsored Items
        const withAds = [];
        const adFrequency = 3; // Every 3 items

        const mockAds = [
            { id: 'ad1', name: 'RESTAURANTE EKILORE', zone: 'POLANCO, CIUDAD DE MÉXICO, MX', cuisine: 'VASCO', rating: 4.7, is_sponsored: true, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop' },
            { id: 'ad2', name: 'RUFUS', zone: 'ROMA NORTE, CIUDAD DE MÉXICO, MX', cuisine: 'RESTAURANT', rating: 4.3, is_sponsored: true, image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000&auto=format&fit=crop' },
        ];

        list.forEach((r, idx) => {
            withAds.push(r);
            if ((idx + 1) % adFrequency === 0) {
                const ad = mockAds[Math.floor(idx / adFrequency) % mockAds.length];
                withAds.push({ ...ad, id: `${ad.id}-${idx}` });
            }
        });

        return withAds;
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
    const favoritesCount = restaurants.filter(r => r.is_favorite).length;

    const stats = [
        { label: 'To Visit', count: restaurants.filter(r => !r.is_visited).length, color: 'bg-brand-orange', link: '/', action: () => setOnlyFavorites(false) },
        { label: 'Visited', count: visitedCount, color: 'bg-brand-green', link: '/visited', action: null },
        { label: 'Badges', count: badgesCount, color: 'bg-brand-yellow', link: '/badges', action: null },
        { label: 'Favorites', count: favoritesCount, color: 'bg-blue-400', link: null, action: () => setOnlyFavorites(true) },
    ];


    const cuisines = ['All', ...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];

    return (
        <div className="pb-24 bg-[#F8FAFC] min-h-screen">
            <header className="bg-white px-6 pt-12 pb-8 rounded-b-[4rem] shadow-sm relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <BrandLogo size={48} animate={false} />
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-brand-dark uppercase leading-none">Hello Foodie!</h1>
                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 mt-1">Your Culinary Journey</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setOnlyFavorites(!onlyFavorites)}
                            className="p-3 rounded-2xl bg-white shadow-xl shadow-red-100/20 border border-gray-50 text-red-500 active:scale-90 transition-all flex items-center justify-center h-12 w-12"
                        >
                            <Heart size={22} fill={onlyFavorites ? "currentColor" : "none"} strokeWidth={onlyFavorites ? 0 : 2.5} />
                        </button>
                        <div
                            className="w-12 h-12 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-xl cursor-pointer"
                            onClick={() => navigate('/profile')}
                        >
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-brand-orange text-lg">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="relative mx-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                        type="text"
                        placeholder="Search my restaurants..."
                        className="w-full bg-white py-5 px-14 rounded-full text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/10 transition-all text-sm font-bold border-2 border-slate-100/50 shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Stats Cards */}
            <div className="px-5 -mt-6 grid grid-cols-4 gap-2 mb-10 relative z-20">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        onClick={() => {
                            if (stat.action) stat.action();
                            if (stat.link) navigate(stat.link);
                        }}
                        className={clsx(
                            "bg-white p-4 rounded-[1.5rem] shadow-xl shadow-slate-200/40 border border-gray-50 flex flex-col items-center text-center cursor-pointer active:scale-95 transition-all",
                            onlyFavorites && stat.label === 'Favorites' ? "ring-2 ring-blue-400/50" : ""
                        )}
                    >
                        <span className={clsx("w-2 h-2 rounded-full mb-2", stat.color)}></span>
                        <span className="text-xl font-black text-brand-dark">{stat.count}</span>
                        <span className="text-[7px] font-black text-gray-400 uppercase mt-1 tracking-widest">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* View Mode Switcher */}
            <div className="px-6 mb-8">
                <div className="bg-[#EFEEF1] p-1.5 rounded-[2rem] flex border border-gray-100 shadow-sm">
                    {[
                        { id: 'list', label: 'List', icon: List },
                        { id: 'list-photos', label: 'Mosaic', icon: LayoutGrid },
                        { id: 'gallery', label: 'Gallery', icon: ImageIcon }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id)}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-3 py-3.5 rounded-[1.5rem] transition-all duration-300",
                                viewMode === mode.id ? "bg-white text-brand-orange shadow-lg scale-[1.02]" : "text-gray-400"
                            )}
                        >
                            <mode.icon size={18} className={clsx(viewMode === mode.id ? "text-brand-orange" : "text-gray-400")} />
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 mb-8 flex gap-3 overflow-x-auto no-scrollbar py-2">
                {[
                    { label: 'Area', icon: ChevronDown },
                    { label: 'Cuisine', icon: ChevronDown },
                    { label: '$', icon: ChevronDown },
                    { label: '***', icon: ChevronDown },
                    { label: 'Recommended By', icon: ChevronDown }
                ].map((filter, i) => (
                    <button
                        key={i}
                        className="px-5 py-3.5 bg-[#F1F3F6] rounded-full whitespace-nowrap border-2 border-white/50 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-dark active:scale-95 transition-all"
                    >
                        {filter.label}
                        <filter.icon size={14} className="text-gray-400" />
                    </button>
                ))}
            </div>

            {/* Feed */}
            <div className={clsx(
                "px-6 pb-32 transition-all duration-300",
                viewMode === 'gallery' ? "grid grid-cols-2 gap-5" : "flex flex-col gap-5"
            )}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {loading ? (
                        <div className="col-span-full py-20 text-center font-black text-gray-300 uppercase tracking-widest animate-pulse">Prepping your kitchen...</div>
                    ) : myRestaurants.length > 0 ? (
                        myRestaurants.map((restaurant) => (
                            <motion.div
                                key={restaurant.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
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
