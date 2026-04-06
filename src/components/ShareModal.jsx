import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { X, Users, Share2, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function ShareModal({ isVisible, onClose, restaurant }) {
    const clubs = useStore(state => state.clubs);
    const fetchClubs = useStore(state => state.fetchClubs);
    const addRestaurantToClub = useStore(state => state.addRestaurantToClub);
    const [loadingClubId, setLoadingClubId] = useState(null);
    const [successClubId, setSuccessClubId] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (isVisible && clubs.length === 0) {
            fetchClubs();
        }
    }, [isVisible, clubs.length, fetchClubs]);

    const handleShareToClub = async (clubId) => {
        setLoadingClubId(clubId);
        const result = await addRestaurantToClub(clubId, restaurant.id);
        setLoadingClubId(null);
        if (result.success) {
            setSuccessClubId(clubId);
            setTimeout(() => setSuccessClubId(null), 2000);
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const filteredClubs = clubs.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        className="relative bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl p-8 max-h-[80vh] flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight italic">Share <span className="text-brand-orange">Place</span></h3>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Spread the food love</p>
                            </div>
                            <button onClick={onClose} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-400 active:scale-90 transition-transform">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-[2rem] flex items-center gap-4 mb-6 border border-slate-100">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                                {restaurant.image_url && <img src={restaurant.image_url} className="w-full h-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-brand-dark text-xs uppercase truncate leading-none mb-1">{restaurant.name}</h4>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{restaurant.cuisine || 'Restaurant'}</p>
                            </div>
                        </div>

                        <div className="relative mb-6">
                            <input 
                                type="text"
                                placeholder="Search clubs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-slate-50 border-2 border-transparent p-4 pl-12 rounded-[1.5rem] font-bold text-brand-dark focus:bg-white focus:border-brand-orange/20 focus:outline-none transition-all placeholder:text-gray-300"
                            />
                            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar pb-6">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] ml-4 mb-2">My Clubs</p>
                            {filteredClubs.length > 0 ? (
                                filteredClubs.map(club => (
                                    <div key={club.id} className="bg-white border-2 border-slate-50 p-3 rounded-[2rem] flex items-center gap-4 group hover:border-brand-orange/20 transition-all">
                                        <div className="w-12 h-12 rounded-[1.2rem] overflow-hidden bg-slate-100 flex-shrink-0">
                                            {club.image && <img src={club.image} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-brand-dark text-[11px] uppercase truncate">{club.name}</h4>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{club.type}</p>
                                        </div>
                                        <button
                                            onClick={() => handleShareToClub(club.id)}
                                            disabled={loadingClubId === club.id || successClubId === club.id}
                                            className={clsx(
                                                "px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all min-w-[80px] flex items-center justify-center",
                                                successClubId === club.id
                                                    ? "bg-green-500 text-white shadow-lg shadow-green-200"
                                                    : "bg-brand-dark text-white hover:bg-brand-orange active:scale-95"
                                            )}
                                        >
                                            {loadingClubId === club.id ? (
                                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : successClubId === club.id ? (
                                                <Check size={14} />
                                            ) : (
                                                'Share'
                                            )}
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <Users size={32} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No clubs found</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-slate-50">
                            <button
                                onClick={() => {
                                    const userName = useStore.getState().profile?.full_name || 'Alguien';
                                    const listType = restaurant.is_favorite ? 'su lista de favoritos' : 'su lista personal';
                                    const restaurantUrl = `${window.location.origin}/restaurant/${restaurant.id}`;
                                    
                                    const text = `${userName} está compartiendo un restaurante contigo (${restaurant.name}) desde ${listType} en Hello foodie! app. ✨\n\nCrea tu cuenta ahora y mantén organizados esos restaurantes que tienes pendiente ir, comparte grupos con amigos y vive al máximo tu pasión por descubrir lo mejor de la gastronomía. 🍔🌮`;
                                    
                                    if (navigator.share) {
                                        navigator.share({ 
                                            title: `Check out ${restaurant.name} on Hello Foodie!`, 
                                            text: text, 
                                            url: restaurantUrl 
                                        });
                                    } else {
                                        navigator.clipboard.writeText(`${text}\n\nLink: ${restaurantUrl}`);
                                        alert('Link & message copied to clipboard!');
                                    }
                                }}
                                className="w-full bg-slate-50 text-brand-dark font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-3 active:scale-95 transition-all text-[10px] uppercase tracking-widest"
                            >
                                <Share2 size={16} />
                                External Share
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
