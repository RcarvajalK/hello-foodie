import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { ChefHat, Bell, MapPin, Sparkles, ChevronRight, X, Search, Plus } from 'lucide-react';
import clsx from 'clsx';
import BrandLogo from '../components/BrandLogo';
import { Autocomplete } from '@react-google-maps/api';

const CUISINES = ['Italian', 'Japanese', 'Mexican', 'French', 'Seafood', 'Steakhouse', 'Cafe', 'Street Food', 'Bakery', 'Healthy', 'Indian', 'Basque'];

export default function Onboarding() {
    const [step, setStep] = useState(0);
    const profile = useStore(state => state.profile);
    const updateProfile = useStore(state => state.updateProfile);
    const prefs = useStore(state => state.notificationPreferences);
    const setNotificationPreferences = useStore(state => state.setNotificationPreferences);
    const navigate = useNavigate();

    const [data, setData] = useState({
        full_name: profile?.full_name || '',
        favorite_cuisines: profile?.favorite_cuisines || [],
        example_places: profile?.example_places || ''
    });
    const [selectedPlaces, setSelectedPlaces] = useState(
        profile?.example_places ? profile.example_places.split(',').map(s => s.trim()).filter(Boolean) : []
    );
    const [autocomplete, setAutocomplete] = useState(null);
    const autocompleteInputRef = useRef(null);

    const handleNext = () => setStep(s => s + 1);
    const handleSkip = async () => {
        await updateProfile({ has_onboarded: true });
        navigate('/');
    };

    const handleFinish = async () => {
        await updateProfile({
            ...data,
            example_places: selectedPlaces.join(', '),
            has_onboarded: true
        });
        navigate('/');
    };

    const toggleCuisine = (c) => {
        setData(prev => ({
            ...prev,
            favorite_cuisines: prev.favorite_cuisines.includes(c)
                ? prev.favorite_cuisines.filter(item => item !== c)
                : [...prev.favorite_cuisines, c]
        }));
    };

    const steps = [
        {
            title: "Welcome to Hello Foodie!",
            desc: "Let's personalize your culinary journey. It only takes a minute.",
            icon: <Sparkles className="text-brand-orange" size={40} />,
            content: (
                <div className="space-y-6 text-center">
                    <div className="flex justify-center">
                        <BrandLogo size={120} />
                    </div>
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">What should we call you?</label>
                        <input
                            type="text"
                            value={data.full_name}
                            onChange={(e) => setData({ ...data, full_name: e.target.value })}
                            className="w-full bg-slate-50 border-2 border-brand-orange/10 p-5 rounded-[2rem] text-center text-xl font-black text-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all shadow-inner"
                            placeholder="Your Name"
                        />
                    </div>
                </div>
            )
        },
        {
            title: "Your Favorites",
            desc: "Which cuisines make you the happiest?",
            icon: <ChefHat className="text-brand-orange" size={40} />,
            content: (
                <div className="grid grid-cols-2 gap-3 mt-4">
                    {CUISINES.map(c => (
                        <button
                            key={c}
                            onClick={() => toggleCuisine(c)}
                            className={clsx(
                                "p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border-2",
                                data.favorite_cuisines.includes(c)
                                    ? "bg-brand-orange border-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                    : "bg-white border-slate-100 text-gray-400"
                            )}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            )
        },
        {
            title: "Top Places",
            desc: "Any restaurants you already love? We'll use this to recommend similar spots.",
            icon: <MapPin className="text-brand-orange" size={40} />,
            content: (
                <div className="space-y-4">
                    {/* Google Places Autocomplete input */}
                    {typeof google !== 'undefined' ? (
                        <Autocomplete
                            onLoad={(auto) => setAutocomplete(auto)}
                            onPlaceChanged={() => {
                                if (autocomplete) {
                                    const place = autocomplete.getPlace();
                                    const name = place.name || '';
                                    if (name && !selectedPlaces.includes(name)) {
                                        setSelectedPlaces(prev => [...prev, name]);
                                    }
                                    // Clear the input
                                    if (autocompleteInputRef.current) {
                                        autocompleteInputRef.current.value = '';
                                    }
                                }
                            }}
                            options={{ types: ['restaurant', 'food', 'cafe', 'bakery'] }}
                        >
                            <div className="relative">
                                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/50" />
                                <input
                                    ref={autocompleteInputRef}
                                    type="text"
                                    placeholder="Search a restaurant..."
                                    className="w-full bg-slate-50 border-2 border-brand-orange/10 p-4 pl-12 rounded-[1.5rem] text-sm font-bold text-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                />
                            </div>
                        </Autocomplete>
                    ) : (
                        <input
                            type="text"
                            placeholder="Start typing a restaurant name..."
                            className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-[1.5rem] text-sm font-bold text-gray-300 cursor-not-allowed"
                            disabled
                        />
                    )}

                    {/* Selected places chips */}
                    {selectedPlaces.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {selectedPlaces.map((place, i) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md shadow-brand-orange/20"
                                >
                                    {place}
                                    <button
                                        onClick={() => setSelectedPlaces(prev => prev.filter((_, idx) => idx !== i))}
                                        className="text-white/70 hover:text-white transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    {selectedPlaces.length === 0 && (
                        <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest pt-2">
                            Search and select your favorite spots
                        </p>
                    )}
                </div>
            )
        },
        {
            title: "Stay Notified",
            desc: "Never miss a place while you're exploring.",
            icon: <Bell className="text-brand-orange" size={40} />,
            content: (
                <div className="space-y-4">
                    {[
                        { key: 'nearby', label: 'Proximity Alerts', desc: 'Notify when near a saved place' },
                        { key: 'lunch', label: 'Lunch Ideas', desc: 'Inspiration at 1:00 PM' }
                    ].map(pref => (
                        <div key={pref.key} className="bg-slate-50 p-6 rounded-[2rem] flex items-center justify-between">
                            <div>
                                <p className="text-[12px] font-black text-brand-dark uppercase tracking-tight">{pref.label}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{pref.desc}</p>
                            </div>
                            <button
                                onClick={() => setNotificationPreferences({ [pref.key]: !prefs[pref.key] })}
                                className={clsx(
                                    "w-12 h-6 rounded-full relative transition-all",
                                    prefs[pref.key] ? "bg-brand-orange" : "bg-gray-200"
                                )}
                            >
                                <div className={clsx(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                    prefs[pref.key] ? "left-7" : "left-1"
                                )} />
                            </button>
                        </div>
                    ))}
                </div>
            )
        }
    ];

    const currentStep = steps[step];

    return (
        <div className="min-h-screen bg-white p-6 pb-32 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-12 right-6">
                <button onClick={handleSkip} className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] flex items-center gap-2">
                    Skip <X size={14} />
                </button>
            </div>

            <div className="max-w-md mx-auto w-full">
                <div className="mb-12 flex justify-center space-x-1">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={clsx(
                                "h-1 rounded-full transition-all duration-500",
                                i === step ? "w-12 bg-brand-orange" : i < step ? "w-4 bg-brand-orange/30" : "w-4 bg-gray-100"
                            )}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-brand-orange/10 rounded-[1.5rem] flex items-center justify-center">
                                    {currentStep.icon}
                                </div>
                            </div>
                            <h1 className="text-3xl font-black text-brand-dark uppercase tracking-tight leading-tight">
                                {currentStep.title}
                            </h1>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed px-4">
                                {currentStep.desc}
                            </p>
                        </div>

                        <div className="py-4">
                            {currentStep.content}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="fixed bottom-10 left-6 right-6 max-w-md mx-auto flex gap-4">
                {step > 0 && (
                    <button
                        onClick={() => setStep(s => s - 1)}
                        className="p-5 bg-slate-50 text-gray-400 rounded-[1.8rem] transition-all active:scale-90"
                    >
                        <ChevronRight size={24} className="rotate-180" />
                    </button>
                )}
                <button
                    onClick={step === steps.length - 1 ? handleFinish : handleNext}
                    className="flex-1 bg-brand-orange text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-brand-orange/30 flex items-center justify-center gap-3 active:scale-95 transition-all text-[13px] uppercase tracking-widest"
                >
                    {step === steps.length - 1 ? "Let's Explore" : "Next Step"}
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}
