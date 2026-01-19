import { useState, useRef } from 'react';
import { Camera, MapPin, Plus, X, Star, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const libraries = ['places'];

export default function AddRestaurant() {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries
    });

    const navigate = useNavigate();
    const addRestaurant = useStore(state => state.addRestaurant);
    const [loading, setLoading] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        zone: '',
        price: '$$',
        rating: 0,
        recommended_by: '',
        image_url: 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?auto=format&fit=crop&q=80&w=1000',
        coordinates: null
    });

    const onLoad = (auto) => {
        setAutocomplete(auto);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            const photoUrl = place.photos?.[0]?.getUrl() || formData.image_url;

            // Extract city/zone from address components
            const zoneComp = place.address_components?.find(c => c.types.includes('sublocality') || c.types.includes('neighborhood'));
            const cityComp = place.address_components?.find(c => c.types.includes('locality'));
            const zoneStr = zoneComp ? zoneComp.long_name : (cityComp ? cityComp.long_name : '');

            setFormData({
                ...formData,
                name: place.name || '',
                cuisine: place.types?.includes('restaurant') ? 'Restaurant' : '',
                zone: zoneStr,
                rating: place.rating || 0,
                price: '$'.repeat(place.price_level || 2),
                image_url: photoUrl,
                coordinates: {
                    x: place.geometry?.location?.lat() || 0,
                    y: place.geometry?.location?.lng() || 0
                }
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return;

        setLoading(true);
        const result = await addRestaurant(formData);
        setLoading(false);

        if (result) {
            navigate('/');
        }
    };

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            <header className="bg-white p-5 border-b border-gray-100 flex items-center justify-between pt-12">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400">
                    <X size={24} />
                </button>
                <h1 className="text-lg font-black text-brand-dark uppercase tracking-tight">Search & Add Place</h1>
                <div className="w-10"></div>
            </header>

            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-8">
                        <div className="relative group">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest block mb-2">Search with Google Places</label>
                            {isLoaded ? (
                                <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Start typing restaurant name..."
                                            className="w-full bg-white border-2 border-brand-orange/10 p-5 pl-14 rounded-[2rem] text-brand-dark font-black shadow-xl shadow-brand-orange/5 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all placeholder:text-gray-300"
                                        />
                                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-orange" />
                                    </div>
                                </Autocomplete>
                            ) : (
                                <div className="w-full h-16 bg-gray-100 animate-pulse rounded-[2rem]"></div>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {formData.name && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col gap-6"
                            >
                                <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-inner">
                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center shadow-lg">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                                        <span className="text-xs font-black text-brand-dark">{formData.rating || '---'}</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase text-gray-400 ml-3 tracking-widest">Cuisine</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold text-brand-dark border-none"
                                                value={formData.cuisine}
                                                onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black uppercase text-gray-400 ml-3 tracking-widest">Zone</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold text-brand-dark border-none"
                                                value={formData.zone}
                                                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-3 tracking-widest">Recommended By</label>
                                        <input
                                            type="text"
                                            placeholder="@friend or 'Me'"
                                            className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold text-brand-dark border-none focus:ring-2 focus:ring-brand-orange/10"
                                            value={formData.recommended_by}
                                            onChange={(e) => setFormData({ ...formData, recommended_by: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-orange text-white font-black py-5 rounded-[1.8rem] shadow-lg shadow-brand-orange/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Adding to your list...' : (
                                        <>
                                            <Plus size={22} />
                                            Add to My List
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </form>
            </div>
        </div>
    );
}
