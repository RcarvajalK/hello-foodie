import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, List, LayoutGrid, Image as ImageIcon, ChevronDown, Heart, Trophy } from 'lucide-react';
import { useStore } from '../lib/store';
import RestaurantCard from '../components/RestaurantCard';
import BrandLogo from '../components/BrandLogo';
import clsx from 'clsx';
import { getRestaurantImage, DEFAULT_RESTAURANT_IMAGE } from '../lib/images';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGE_LEVELS, calculateXP, getLevelFromXP } from '../lib/badges';


export default function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('foodie_view_mode') || 'list');
    const [sortBy, setSortBy] = useState('distance');

    // Advanced Filters
    const [activeArea, setActiveArea] = useState('All');
    const [activeCuisine, setActiveCuisine] = useState('All');
    const [activePrice, setActivePrice] = useState('All');
    const [activeRating, setActiveRating] = useState('All');
    const [activeRecommender, setActiveRecommender] = useState('All');
    const [openFilter, setOpenFilter] = useState(null);

    const [userCoords, setUserCoords] = useState(null);
    const [onlyFavorites, setOnlyFavorites] = useState(false);
    const navigate = useNavigate();

    const restaurants = useStore(state => state.restaurants);
    const profile = useStore(state => state.profile);
    const userRank = useStore(state => state.userRank);
    const loading = useStore(state => state.loading);
    const fetchRestaurants = useStore(state => state.fetchRestaurants);
    const fetchProfile = useStore(state => state.fetchProfile);
    const fetchRankings = useStore(state => state.fetchRankings);
    const deleteRestaurant = useStore(state => state.deleteRestaurant);

    useEffect(() => {
        localStorage.setItem('foodie_view_mode', viewMode);
    }, [viewMode]);

    const handleDelete = async (id) => {
        if (window.confirm('Delete this restaurant from your list?')) {
            await deleteRestaurant(id);
        }
    };

    useEffect(() => {
        fetchRestaurants();
        fetchProfile();
        fetchRankings();

        navigator.geolocation.getCurrentPosition(
            (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.log('Geolocation error', err)
        );
    }, []);

    // Automatic Background Healing
    const refreshRestaurantImages = useStore(state => state.refreshRestaurantImages);
    useEffect(() => {
        if (!loading && restaurants.length > 0 && window.google) {
            // Only heal a few per session to save API quota
            const healedInSession = JSON.parse(sessionStorage.getItem('foodie_healed') || '[]');

            // Priority: 1. Missing Place ID, 2. Google-hosted volatile URLs
            const candidate = restaurants.find(r =>
                !healedInSession.includes(r.id) &&
                (!r.google_place_id || (r.image_url && r.image_url.includes('lh3.google')))
            );

            if (candidate && healedInSession.length < 5) { // Limit to 5 per session
                const timer = setTimeout(() => {
                    console.log(`[Auto-Heal] Refreshing: ${candidate.name}`);
                    refreshRestaurantImages(candidate.id, candidate.google_place_id);
                    sessionStorage.setItem('foodie_healed', JSON.stringify([...healedInSession, candidate.id]));
                }, 5000); // Wait 5s after load
                return () => clearTimeout(timer);
            }
        }
    }, [loading, restaurants.length, !!window.google]);

    const calculateDistance = (r) => {
        if (!userCoords || !r.coordinates || typeof r.coordinates.lat !== 'number') return Infinity;
        const dx = r.coordinates.lat - userCoords.lat;
        const dy = r.coordinates.lng - userCoords.lng;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const myRestaurants = useMemo(() => {
        let list = [...restaurants];
        list = list.filter(r => !r.is_visited);

        // Apply Search
        if (searchQuery) {
            list = list.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.zone?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply Advanced Filters
        if (activeCuisine !== 'All') {
            list = list.filter(r => r.cuisine?.toLowerCase().includes(activeCuisine.toLowerCase()));
        }
        if (activeArea !== 'All') {
            list = list.filter(r => r.zone?.toLowerCase().includes(activeArea.toLowerCase()));
        }
        if (activePrice !== 'All') {
            list = list.filter(r => r.price === activePrice);
        }
        if (activeRating !== 'All') {
            const minRating = parseFloat(activeRating);
            list = list.filter(r => (r.rating || 0) >= minRating);
        }
        if (activeRecommender !== 'All') {
            list = list.filter(r => (r.recommended_by || 'Me').toLowerCase() === activeRecommender.toLowerCase());
        }

        if (onlyFavorites) {
            list = list.filter(r => r.is_favorite);
        }

        // Sorting
        list.sort((a, b) => {
            if (sortBy === 'date') return new Date(b.date_added) - new Date(a.date_added);
            if (sortBy === 'distance') {
                const distA = calculateDistance(a);
                const distB = calculateDistance(b);
                if (distA === distB) return 0;
                return distA - distB;
            }
            if (sortBy === 'zone') return (a.zone || '').localeCompare(b.zone || '');
            if (sortBy === 'recommender') return (a.recommended_by || '').localeCompare(b.recommended_by || '');
            if (sortBy === 'club') return (a.club_name || '').localeCompare(b.club_name || '');
            return 0;
        });

        // Inject Sponsored Items
        const withAds = [];
        const adFrequency = 3;

        const mockAds = [
            { id: 'ad1', name: 'EKILORE RESTAURANT', zone: 'POLANCO, MEXICO CITY, MX', cuisine: 'BASQUE', rating: 4.7, is_sponsored: true, image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000&auto=format&fit=crop' },
            { id: 'ad2', name: 'RUFUS', zone: 'ROMA NORTE, MEXICO CITY, MX', cuisine: 'CONTEMPORARY', rating: 4.3, is_sponsored: true, image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000&auto=format&fit=crop' },
        ];

        list.forEach((r, idx) => {
            withAds.push(r);
            if ((idx + 1) % adFrequency === 0) {
                const ad = mockAds[Math.floor(idx / adFrequency) % mockAds.length];
                withAds.push({ ...ad, id: `${ad.id}-${idx}` });
            }
        });

        return withAds;
    }, [restaurants, searchQuery, sortBy, activeArea, activeCuisine, activePrice, activeRating, activeRecommender, userCoords, onlyFavorites]);

    const userXP = useMemo(() => calculateXP(restaurants), [restaurants]);
    const currentLevel = useMemo(() => getLevelFromXP(userXP), [userXP]);

    const visitedCount = restaurants.filter(r => r.is_visited).length;
    const toVisitCount = restaurants.filter(r => !r.is_visited).length;
    const badgesCount = BADGE_LEVELS.filter(b => userXP >= b.xpThreshold).length;
    const favoritesCount = restaurants.filter(r => r.is_favorite).length;

    const stats = [
        { label: 'To Visit', count: toVisitCount, color: 'bg-brand-orange', link: '/', action: () => setOnlyFavorites(false) },
        { label: 'Visited', count: visitedCount, color: 'bg-brand-green', link: '/visited', action: null },
        { label: 'Badges', count: badgesCount, color: 'bg-brand-yellow', link: '/badges', action: null },
        { label: 'Favs', count: favoritesCount, color: 'bg-blue-400', link: null, action: () => setOnlyFavorites(true) },
    ];

    // Filter Options
    const areas = useMemo(() => {
        const set = new Set(restaurants.map(r => r.zone).filter(Boolean).map(z => z.trim()));
        return ['All', ...[...set].sort()];
    }, [restaurants]);

    const cuisines = useMemo(() => {
        const all = [];
        restaurants.forEach(r => {
            if (r.cuisine) {
                r.cuisine.split(',').forEach(c => all.push(c.trim()));
            }
        });
        return ['All', ...[...new Set(all)].sort()];
    }, [restaurants]);

    const recommenders = useMemo(() => {
        const set = new Set(restaurants.map(r => r.recommended_by || 'Me').filter(Boolean).map(rec => rec.trim()));
        return ['All', ...[...set].sort()];
    }, [restaurants]);

    const FilterDropdown = ({ label, current, options, onSelect, isOpen, onToggle }) => {
        const buttonRef = useRef(null);
        const [menuStyle, setMenuStyle] = useState({});

        useEffect(() => {
            if (isOpen && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const left = Math.min(rect.left, window.innerWidth - 220);
                setMenuStyle({
                    position: 'fixed',
                    top: rect.bottom + 12,
                    left: Math.max(16, left),
                    zIndex: 1000
                });
            }
        }, [isOpen]);

        useEffect(() => {
            if (isOpen) {
                const handleScroll = () => onToggle();
                window.addEventListener('scroll', handleScroll, true);
                return () => window.removeEventListener('scroll', handleScroll, true);
            }
        }, [isOpen, onToggle]);

        return (
            <div className="relative">
                <button
                    ref={buttonRef}
                    onClick={onToggle}
                    className={clsx(
                        "px-5 py-3.5 rounded-full whitespace-nowrap border-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all outline-none",
                        current !== 'All' ? "bg-brand-orange text-white border-brand-orange shadow-lg shadow-brand-orange/20" : "bg-[#F1F3F6] text-brand-dark border-white/50"
                    )}
                >
                    {current === 'All' ? label : current}
                    <ChevronDown size={14} className={clsx("transition-transform", isOpen && "rotate-180", current !== 'All' ? "text-white" : "text-gray-400")} />
                </button>
                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-[999]" onClick={onToggle} />
                            <motion.div
                                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                style={menuStyle}
                                className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 p-2 min-w-[200px] max-h-[350px] overflow-y-auto no-scrollbar pointer-events-auto"
                            >
                                {options.map(opt => (
                                    <button
                                        key={opt}
                                        onClick={() => { onSelect(opt); onToggle(); }}
                                        className={clsx(
                                            "w-full text-left px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 last:mb-0",
                                            current === opt ? "bg-brand-orange text-white shadow-md" : "text-brand-dark hover:bg-slate-50"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="pb-24 bg-[#F8FAFC] min-h-screen">
            <header className="bg-white px-6 pt-10 pb-8 rounded-b-[3.5rem] shadow-xl shadow-slate-200/20 relative z-10 transition-all border-b border-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <BrandLogo size={40} animate={false} />
                        <div>
                            <h1 className="text-lg font-black tracking-tight text-brand-dark uppercase leading-none">Hello Foodie!</h1>
                            <p className="text-[7px] font-black uppercase tracking-[0.3em] text-gray-400 mt-0.5 whitespace-nowrap">Your Culinary Journey</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setOnlyFavorites(!onlyFavorites)}
                            className={clsx(
                                "p-2.5 rounded-2xl shadow-xl border transition-all flex items-center justify-center h-10 w-10",
                                onlyFavorites ? "bg-red-500 text-white border-red-500 shadow-red-200/50" : "bg-white text-red-500 border-gray-50 shadow-red-100/30"
                            )}
                        >
                            <Heart size={18} fill={onlyFavorites ? "currentColor" : "none"} strokeWidth={onlyFavorites ? 0 : 2.5} />
                        </button>
                        <div
                            className="w-10 h-10 bg-slate-100 rounded-2xl overflow-hidden border-2 border-white shadow-2xl cursor-pointer relative"
                            onClick={() => navigate('/profile')}
                        >
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-brand-orange text-lg">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </div>
                            )}
                            <div
                                className="absolute -bottom-1 -right-1 bg-brand-orange text-white text-[7px] font-black w-5 h-5 rounded-lg flex items-center justify-center border-2 border-white shadow-lg"
                            >
                                {currentLevel.level}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative mx-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input
                        type="text"
                        placeholder="Search my restaurants..."
                        className="w-full bg-[#FAFAFA] py-4 px-14 rounded-full text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/10 transition-all text-xs font-bold border border-slate-100 shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Stats Cards */}
            <div className="px-5 -mt-6 grid grid-cols-4 gap-2.5 mb-8 relative z-20">
                {stats.map((stat) => (
                    <motion.div
                        key={stat.label}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            if (stat.action) stat.action();
                            if (stat.link) navigate(stat.link);
                        }}
                        className={clsx(
                            "bg-white p-3 rounded-[2rem] shadow-2xl shadow-slate-200/60 border border-white/50 flex flex-col items-center text-center cursor-pointer transition-all",
                            onlyFavorites && stat.label === 'Favs' ? "ring-2 ring-blue-400" : ""
                        )}
                    >
                        <span className={clsx("w-2 h-2 rounded-full mb-2", stat.color)}></span>
                        <span className="text-lg font-black text-brand-dark leading-none">{stat.count}</span>
                        <span className="text-[7px] font-black text-gray-400 uppercase mt-1 tracking-widest leading-none">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* View Mode Switcher */}
            <div className="px-6 mb-6">
                <div className="bg-[#EFEEF1] p-1.5 rounded-[2.5rem] flex border border-gray-100/50 shadow-inner">
                    {[
                        { id: 'list', label: 'List', icon: List },
                        { id: 'list-photos', label: 'Mosaic', icon: LayoutGrid },
                        { id: 'gallery', label: 'Gallery', icon: ImageIcon }
                    ].map(mode => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id)}
                            className={clsx(
                                "flex-1 flex items-center justify-center gap-2 py-3 rounded-[2rem] transition-all duration-300",
                                viewMode === mode.id ? "bg-white text-brand-orange shadow-md scale-[1.02]" : "text-gray-400 hover:text-gray-50"
                            )}
                        >
                            <mode.icon size={16} className={clsx(viewMode === mode.id ? "text-brand-orange" : "text-gray-400")} />
                            <span className="text-[9px] font-black uppercase tracking-widest leading-none">{mode.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 mb-6 relative z-50 flex gap-2.5 overflow-x-auto no-scrollbar py-1">
                <FilterDropdown
                    label="Area"
                    current={activeArea}
                    options={areas}
                    onSelect={setActiveArea}
                    isOpen={openFilter === 'area'}
                    onToggle={() => setOpenFilter(openFilter === 'area' ? null : 'area')}
                />
                <FilterDropdown
                    label="Cuisine"
                    current={activeCuisine}
                    options={cuisines}
                    onSelect={setActiveCuisine}
                    isOpen={openFilter === 'cuisine'}
                    onToggle={() => setOpenFilter(openFilter === 'cuisine' ? null : 'cuisine')}
                />
                <FilterDropdown
                    label="Price"
                    current={activePrice}
                    options={['All', '$', '$$', '$$$', '$$$$']}
                    onSelect={setActivePrice}
                    isOpen={openFilter === 'price'}
                    onToggle={() => setOpenFilter(openFilter === 'price' ? null : 'price')}
                />
                <FilterDropdown
                    label="Rating"
                    current={activeRating}
                    options={['All', '5.0', '4.0', '3.0', '2.0']}
                    onSelect={setActiveRating}
                    isOpen={openFilter === 'rating'}
                    onToggle={() => setOpenFilter(openFilter === 'rating' ? null : 'rating')}
                />
                <FilterDropdown
                    label="Source"
                    current={activeRecommender}
                    options={recommenders}
                    onSelect={setActiveRecommender}
                    isOpen={openFilter === 'recommender'}
                    onToggle={() => setOpenFilter(openFilter === 'recommender' ? null : 'recommender')}
                />
            </div>

            {/* Feed */}
            <div className={clsx(
                "px-6 pb-32 transition-all duration-300",
                viewMode === 'gallery' ? "grid grid-cols-2 gap-5" : "flex flex-col gap-4"
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
                            <p className="text-brand-dark font-black uppercase tracking-tight text-lg">No results found</p>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-[0.2em]">Try adjusting your filters.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
