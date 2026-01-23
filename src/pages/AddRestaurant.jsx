import { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, MapPin, Plus, X, Star, Search, Heart, Globe, Phone } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { Autocomplete } from '@react-google-maps/api';
import clsx from 'clsx';
import { DEFAULT_RESTAURANT_IMAGE, getRestaurantImage } from '../lib/images';

export default function AddRestaurant() {
    const navigate = useNavigate();
    const addRestaurant = useStore(state => state.addRestaurant);
    const addRestaurantToClub = useStore(state => state.addRestaurantToClub);
    const clubs = useStore(state => state.clubs);
    const restaurants = useStore(state => state.restaurants);
    const [userLoc, setUserLoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.log('Loc error', err)
        );
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        zone: '',
        price: '$$',
        rating: 0,
        recommended_by: '',
        meal_type: [], // array for multi-select
        is_favorite: false,
        notes: '',

        group_ids: [],
        image_url: DEFAULT_RESTAURANT_IMAGE,
        additional_images: [],
        coordinates: null,
        phone: '',
        website: '',
        address: '',
        opening_hours: [],
        google_place_id: ''
    });

    const previousRecommenders = useMemo(() => {
        const set = new Set(restaurants.map(r => r.recommended_by).filter(Boolean));
        return Array.from(set);
    }, [restaurants]);

    const onLoad = (auto) => {
        setAutocomplete(auto);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;

            const photoUrl = place.photos?.[0]?.getUrl() || formData.image_url;
            const extraPhotos = place.photos?.slice(1, 5).map(p => p.getUrl()) || [];

            // Extract city/zone from address components
            const zoneComp = place.address_components?.find(c => c.types.includes('sublocality') || c.types.includes('neighborhood'));
            const cityComp = place.address_components?.find(c => c.types.includes('locality'));
            const countryComp = place.address_components?.find(c => c.types.includes('country'));
            const zoneStr = [zoneComp?.long_name, cityComp?.long_name, countryComp?.short_name].filter(Boolean).join(', ');

            setFormData({
                ...formData,
                name: place.name || '',
                cuisine: place.types?.includes('restaurant') ? 'Restaurant' : (place.types?.[0] || ''),
                zone: zoneStr,
                rating: place.rating || 0,
                price: '$'.repeat(place.price_level || 2),
                image_url: photoUrl,
                additional_images: extraPhotos,
                coordinates: {
                    lat: place.geometry?.location?.lat() || 0,
                    lng: place.geometry?.location?.lng() || 0
                },
                phone: place.formatted_phone_number || '',
                website: place.website || '',
                address: place.formatted_address || '',
                opening_hours: place.opening_hours?.weekday_text || [],
                google_place_id: place.place_id || ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            alert("Please enter a restaurant name.");
            return;
        }
        if (!formData.coordinates) {
            alert("Please select a restaurant from the Google suggestions to get its location.");
            return;
        }

        setLoading(true);
        // Convert meal_type array to comma-separated string for DB
        const { group_ids, ...rest } = formData;
        const result = await addRestaurant({
            ...rest,
            meal_type: formData.meal_type.join(', ')
        });

        setLoading(false);

        if (result.success) {
            // Add to selected clubs
            if (formData.group_ids.length > 0) {
                await Promise.all(formData.group_ids.map(clubId =>
                    addRestaurantToClub(clubId, result.data.id)
                ));
            }
            navigate('/');
        } else {
            alert(result.error);
        }
    };

    const toggleGroup = (clubId) => {
        setFormData(prev => ({
            ...prev,
            group_ids: prev.group_ids.includes(clubId)
                ? prev.group_ids.filter(id => id !== clubId)
                : [...prev.group_ids, clubId]
        }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !formData.coordinates) {
            e.preventDefault();
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse uppercase font-black text-brand-orange">Adding...</div>;

    if (typeof google === 'undefined') {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
                <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Initializing Places...</p>
            </div>
        );
    }

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
                            <Autocomplete
                                onLoad={onLoad}
                                onPlaceChanged={onPlaceChanged}
                                options={{
                                    locationBias: userLoc ? { lat: userLoc.lat, lng: userLoc.lng } : undefined,
                                    types: ['restaurant', 'food', 'cafe', 'bakery']
                                }}
                            >
                                <div className="relative">
                                    <input
                                        type="text"
                                        onKeyDown={handleKeyDown}
                                        placeholder="Start typing restaurant name..."
                                        className="w-full bg-white border-2 border-brand-orange/10 p-5 pl-14 rounded-[2rem] text-brand-dark font-black shadow-xl shadow-brand-orange/5 focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all placeholder:text-gray-300"
                                    />
                                    <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-orange" />
                                </div>
                            </Autocomplete>
                        </div>
                    </div>

                    <AnimatePresence>
                        {formData.name && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100 flex flex-col gap-6"
                            >
                                <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-inner flex gap-1 overflow-x-auto no-scrollbar">
                                    <img
                                        src={getRestaurantImage(formData.image_url)}
                                        alt="Preview"
                                        className="w-full h-full object-cover flex-shrink-0"
                                        onError={(e) => e.target.src = DEFAULT_RESTAURANT_IMAGE}
                                    />
                                    {formData.additional_images?.map((img, i) => (
                                        <img
                                            key={i}
                                            src={getRestaurantImage(img)}
                                            className="w-full h-full object-cover flex-shrink-0"
                                            onError={(e) => e.target.src = DEFAULT_RESTAURANT_IMAGE}
                                        />
                                    ))}
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
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-3 tracking-widest">Meal Type (Select one or more)</label>
                                        <div className="flex gap-2">
                                            {['Breakfast', 'Lunch', 'Dinner'].map(meal => {
                                                const isActive = formData.meal_type.includes(meal);
                                                return (
                                                    <button
                                                        key={meal}
                                                        type="button"
                                                        onClick={() => {
                                                            const newMeals = isActive
                                                                ? formData.meal_type.filter(m => m !== meal)
                                                                : [...formData.meal_type, meal];
                                                            setFormData({ ...formData, meal_type: newMeals });
                                                        }}
                                                        className={clsx(
                                                            "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                            isActive ? "bg-brand-orange text-white shadow-lg" : "bg-slate-50 text-gray-400"
                                                        )}
                                                    >
                                                        {meal}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black uppercase text-gray-400 ml-3 tracking-widest">Recommended By</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                list="recommenders"
                                                placeholder="@friend or 'Me'"
                                                className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold text-brand-dark border-none focus:ring-2 focus:ring-brand-orange/10"
                                                value={formData.recommended_by}
                                                onChange={(e) => setFormData({ ...formData, recommended_by: e.target.value })}
                                            />
                                            <datalist id="recommenders">
                                                {previousRecommenders.map(rec => <option key={rec} value={rec} />)}
                                            </datalist>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 block mb-2">Save Options</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, is_favorite: !formData.is_favorite })}
                                                className={clsx(
                                                    "flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                                    formData.is_favorite
                                                        ? "bg-red-500 border-red-500 text-white shadow-lg shadow-red-100"
                                                        : "bg-white border-slate-100 text-gray-400"
                                                )}
                                            >
                                                <Heart size={16} fill={formData.is_favorite ? "currentColor" : "none"} />
                                                Favorite
                                            </button>
                                            <div
                                                className="flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-brand-orange border-2 border-brand-orange text-white shadow-lg shadow-brand-orange/20 opacity-50 cursor-not-allowed"
                                            >
                                                My List
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 block mb-2">Add to Groups / Clubs</label>
                                        <div className="flex flex-wrap gap-2 px-1">
                                            {clubs.length > 0 ? (
                                                clubs.map(club => (
                                                    <button
                                                        key={club.id}
                                                        type="button"
                                                        onClick={() => toggleGroup(club.id)}
                                                        className={clsx(
                                                            "px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                                            formData.group_ids.includes(club.id)
                                                                ? "bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                                                : "bg-white border-slate-100 text-gray-400"
                                                        )}
                                                    >
                                                        {club.name}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="text-[10px] text-gray-400 font-bold italic ml-3">You haven't joined any clubs yet.</p>
                                            )}
                                        </div>
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
