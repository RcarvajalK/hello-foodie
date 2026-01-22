import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trash2, MapPin } from 'lucide-react';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_RESTAURANT_IMAGE } from '../lib/images';

export default function Trash() {
    const navigate = useNavigate();
    const deletedRestaurants = useStore(state => state.deletedRestaurants);
    const fetchDeletedRestaurants = useStore(state => state.fetchDeletedRestaurants);
    const restoreRestaurant = useStore(state => state.restoreRestaurant);
    const permanentlyDeleteRestaurant = useStore(state => state.permanentlyDeleteRestaurant);
    const loading = useStore(state => state.loading);

    useEffect(() => {
        fetchDeletedRestaurants();
    }, [fetchDeletedRestaurants]);

    const handleRestore = async (id) => {
        const result = await restoreRestaurant(id);
        if (result.success) {
            alert('Restaurant restored!');
        } else {
            alert(`Error restoring: ${result.error}`);
        }
    };

    const handlePermanentDelete = async (id) => {
        if (window.confirm('Are you sure? This action is permanent and cannot be undone.')) {
            const result = await permanentlyDeleteRestaurant(id);
            if (!result.success) {
                alert(`Error deleting: ${result.error}`);
            }
        }
    };

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            <header className="bg-white p-6 pt-12 rounded-b-[3rem] shadow-xl shadow-slate-200/50 relative z-10 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-dark hover:bg-slate-100 transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-brand-dark uppercase leading-none">Trash Bin</h1>
                        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-gray-300 mt-1">Recently deleted places</p>
                    </div>
                </div>
            </header>

            <div className="p-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        <div className="py-20 text-center font-black text-gray-300 uppercase tracking-widest animate-pulse">Checking the trash...</div>
                    ) : deletedRestaurants.length > 0 ? (
                        <div className="space-y-4">
                            {deletedRestaurants.map((res) => (
                                <motion.div
                                    key={res.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="bg-white p-4 rounded-[2rem] flex items-center gap-4 shadow-lg border border-gray-50"
                                >
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                        <img
                                            src={res.image_url || res.image || DEFAULT_RESTAURANT_IMAGE}
                                            alt={res.name}
                                            className="w-full h-full object-cover grayscale opacity-60"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-brand-dark text-sm uppercase truncate">{res.name}</h3>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                            <MapPin size={10} /> {res.zone || 'Unknown Zone'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleRestore(res.id)}
                                            className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                                            title="Restore"
                                        >
                                            <RotateCcw size={18} />
                                        </button>
                                        <button
                                            onClick={() => handlePermanentDelete(res.id)}
                                            className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center active:scale-95 transition-all"
                                            title="Delete Forever"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-24 text-center">
                            <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center mx-auto mb-6 border border-gray-50 opacity-20">
                                <Trash2 size={40} className="text-gray-300" />
                            </div>
                            <p className="text-brand-dark font-black uppercase tracking-tight text-lg">Trash is empty</p>
                            <p className="text-[10px] text-gray-400 mt-2 uppercase font-black tracking-[0.2em]">Deleted restaurants will appear here.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
