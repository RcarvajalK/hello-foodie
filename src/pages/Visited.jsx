import { useState, useMemo, useEffect } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
import { useStore } from '../lib/store';
import RestaurantCard from '../components/RestaurantCard';
import BrandLogo from '../components/BrandLogo';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

import { List, LayoutGrid, Image as ImageIcon } from 'lucide-react';

export default function Visited() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(() => localStorage.getItem('foodie_view_mode') || 'list');
    const [userCoords, setUserCoords] = useState(null);

    const restaurants = useStore(state => state.restaurants);
    const fetchRestaurants = useStore(state => state.fetchRestaurants);
    const deleteRestaurant = useStore(state => state.deleteRestaurant);

    const handleDelete = async (id) => {
        if (window.confirm('¿Borrar este restaurante de tu historial?')) {
            await deleteRestaurant(id);
        }
    };

    useEffect(() => {
        fetchRestaurants();
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.log('Geolocation error', err)
        );
    }, []);

    useEffect(() => {
        localStorage.setItem('foodie_view_mode', viewMode);
    }, [viewMode]);

    const calculateDistance = (r) => {
        if (!userCoords || !r.coordinates) return Infinity;
        const dx = (r.coordinates.x || 0) - userCoords.lat;
        const dy = (r.coordinates.y || 0) - userCoords.lng;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const visitedRestaurants = useMemo(() => {
        let list = restaurants.filter(r => r.is_visited);

        if (searchQuery) {
            list = list.filter(r =>
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.zone?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Default sort by proximity
        list.sort((a, b) => calculateDistance(a) - calculateDistance(b));

        return list;
    }, [restaurants, searchQuery, userCoords]);

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            <header className="bg-white p-6 pt-12 rounded-b-[3rem] shadow-xl shadow-slate-200/50 relative z-10 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-dark hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-brand-dark uppercase leading-none">Visited Places</h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-300 mt-1">Your Culinary History</p>
                    </div>
                </div>

                <div className="relative mb-6">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" size={18} />
                    <input
                        type="text"
                        placeholder="Search visited..."
                        className="w-full bg-slate-50 py-5 pl-14 pr-6 rounded-[2rem] text-brand-dark placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-brand-green/10 transition-all text-sm font-bold border border-slate-100 shadow-inner"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex bg-slate-200/40 p-1.5 rounded-[1.5rem] backdrop-blur-sm border border-slate-100 w-fit mx-auto">
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
                                    viewMode === modeItem.id ? "bg-white text-brand-green shadow-lg scale-110" : "text-gray-400"
                                )}
                            >
                                <Icon size={22} />
                            </button>
                        );
                    })}
                </div>
            </header>

            <div className={clsx(
                "px-6 py-8 transition-all duration-300",
                viewMode === 'gallery' ? "grid grid-cols-2 gap-5" : "flex flex-col gap-6"
            )}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {visitedRestaurants.length > 0 ? (
                        visitedRestaurants.map((restaurant) => (
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
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-6 border border-gray-50">
                                <BrandLogo size={56} className="grayscale opacity-20" animate={false} />
                            </div>
                            <p className="text-brand-dark font-black uppercase tracking-tight text-lg">No visited places yet</p>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-[0.2em]">Mark restaurants as visited to see them here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
