import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { BADGE_LEVELS, getBadgeForVisitCount } from '../lib/badges';
import { motion } from 'framer-motion';
import { LogOut, Trophy, MapPin, Star, Settings, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { requestNotificationPermission } from '../lib/notifications';
import clsx from 'clsx';
import ImageUploader from '../components/ImageUploader';

export default function Profile() {
    const profile = useStore(state => state.profile);
    const restaurants = useStore(state => state.restaurants);
    const prefs = useStore(state => state.notificationPreferences);
    const setNotificationPreferences = useStore(state => state.setNotificationPreferences);
    const updateProfile = useStore(state => state.updateProfile);
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        full_name: '',
        avatar_url: '',
        phone: '',
        instagram: '',
        favorite_cuisines: [],
        example_places: ''
    });

    useEffect(() => {
        if (profile) {
            setEditData({
                full_name: profile.full_name || '',
                avatar_url: profile.avatar_url || '',
                phone: profile.phone || '',
                instagram: profile.instagram || '',
                favorite_cuisines: profile.favorite_cuisines || [],
                example_places: profile.example_places || ''
            });
        }
    }, [profile]);

    const handleSave = async () => {
        const { error } = await updateProfile(editData);
        if (error) {
            alert(`Error saving profile: ${error.message}`);
        } else {
            setIsEditing(false);
        }
    };

    const visitedCount = restaurants.filter(r => r.is_visited).length;
    const currentBadge = getBadgeForVisitCount(visitedCount);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const toggleCuisine = (cuisine) => {
        setEditData(prev => ({
            ...prev,
            favorite_cuisines: prev.favorite_cuisines.includes(cuisine)
                ? prev.favorite_cuisines.filter(c => c !== cuisine)
                : [...prev.favorite_cuisines, cuisine]
        }));
    };

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            <header className="bg-white p-6 pt-12 rounded-b-[3rem] shadow-sm border-b border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <BrandLogo size={40} animate={false} />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="p-3 bg-slate-50 text-brand-dark rounded-2xl active:scale-95 transition-all"
                        >
                            <Settings size={20} />
                        </button>
                        <button onClick={handleLogout} className="p-3 bg-red-50 text-red-500 rounded-2xl active:scale-95 transition-all">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        {isEditing ? (
                            <ImageUploader
                                currentImage={editData.avatar_url}
                                onUploadComplete={(url) => setEditData(prev => ({ ...prev, avatar_url: url }))}
                                label="Photo"
                                className="w-24 h-24"
                                aspectRatio="aspect-square"
                            />
                        ) : (
                            <>
                                <div className="w-24 h-24 bg-slate-100 rounded-[2rem] flex items-center justify-center text-3xl font-black text-brand-orange border-4 border-white shadow-xl overflow-hidden">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        profile?.full_name?.charAt(0) || 'U'
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-brand-orange text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg border-4 border-white">
                                    <Trophy size={18} />
                                </div>
                            </>
                        )}
                    </div>

                    {isEditing ? (
                        <div className="w-full max-w-xs space-y-4">
                            <input
                                className="w-full bg-slate-50 p-3 rounded-xl text-center font-black uppercase text-brand-dark border-2 border-brand-orange/20"
                                value={editData.full_name}
                                onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                placeholder="Full Name"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold text-brand-dark border-none"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    placeholder="Phone"
                                />
                                <input
                                    className="w-full bg-slate-50 p-3 rounded-xl text-xs font-bold text-brand-dark border-none"
                                    value={editData.instagram}
                                    onChange={(e) => setEditData({ ...editData, instagram: e.target.value })}
                                    placeholder="@Instagram"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">{profile?.full_name || 'Foodie Explorer'}</h2>
                            <div className={`mt-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${currentBadge.color}`}>
                                Level {currentBadge.level}: {currentBadge.name}
                            </div>
                        </>
                    )}
                </div>
            </header>

            <div className="p-6">
                {isEditing ? (
                    <div className="space-y-6">
                        <section className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
                            <h3 className="text-[10px] font-black text-brand-dark uppercase tracking-widest mb-4">My Taste Profile</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-4 tracking-tight leading-none">Favorite types of food</p>
                            <div className="flex flex-wrap gap-2">
                                {['Italian', 'Japanese', 'Mexican', 'French', 'Local', 'Seafood', 'Steakhouse', 'Cafe', 'Street Food'].map(c => (
                                    <button
                                        key={c}
                                        onClick={() => toggleCuisine(c)}
                                        className={clsx(
                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            editData.favorite_cuisines.includes(c) ? "bg-brand-orange text-white" : "bg-slate-50 text-gray-400"
                                        )}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-6">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 tracking-tight">Example restaurants you love</p>
                                <textarea
                                    className="w-full bg-slate-50 p-4 rounded-2xl text-xs font-bold text-brand-dark border-none min-h-[80px]"
                                    placeholder="e.g. Grano de Oro, Tandoor..."
                                    value={editData.example_places}
                                    onChange={(e) => setEditData({ ...editData, example_places: e.target.value })}
                                />
                            </div>
                        </section>

                        <button
                            onClick={handleSave}
                            className="w-full bg-brand-orange text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-brand-orange/30"
                        >
                            Save Profile Settings
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 bg-white p-6 rounded-[2.5rem] shadow-xl border border-gray-100">
                            <h3 className="text-sm font-black text-brand-dark uppercase tracking-widest mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Settings size={18} className="text-brand-orange" />
                                    Notifications
                                </div>
                                <button
                                    onClick={async () => {
                                        const granted = await requestNotificationPermission();
                                        if (granted) alert('Notifications Enabled!');
                                    }}
                                    className="text-[9px] bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full"
                                >
                                    Enable
                                </button>
                            </h3>
                            <div className="space-y-4">
                                {[
                                    { key: 'nearby', label: 'Nearby Alerts', desc: 'Notify when near a saved place' },
                                    { key: 'lunch', label: 'Lunch Reminder', desc: '1:00 PM Daily' },
                                    { key: 'dinner', label: 'Dinner Reminder', desc: '8:00 PM Daily' }
                                ].map((pref) => (
                                    <div key={pref.key} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-black text-brand-dark uppercase tracking-tight">{pref.label}</p>
                                            <p className="text-[9px] text-gray-400 font-bold uppercase">{pref.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => setNotificationPreferences({ [pref.key]: !prefs[pref.key] })}
                                            className={`w-12 h-6 rounded-full transition-all relative ${prefs[pref.key] ? 'bg-brand-orange' : 'bg-gray-200'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${prefs[pref.key] ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.25em] mb-4 ml-2">My Badge Collection</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {BADGE_LEVELS.map((badge) => {
                                const isUnlocked = visitedCount >= badge.minVisits;
                                return (
                                    <motion.div
                                        key={badge.level}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        onClick={() => navigate('/badges')}
                                        className={`p-6 rounded-[2.5rem] border flex flex-col items-center text-center relative overflow-hidden transition-all cursor-pointer active:scale-95 ${isUnlocked ? 'bg-white shadow-lg border-gray-100' : 'bg-gray-100 border-transparent grayscale opacity-40'
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-inner ${isUnlocked ? 'bg-slate-50' : 'bg-gray-200'
                                            }`}>
                                            {badge.icon}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-dark">{badge.name}</p>
                                        <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 leading-tight">{badge.minVisits} Visits</p>

                                        {isUnlocked && (
                                            <div className="absolute top-3 right-3 text-brand-green">
                                                <Star size={12} fill="currentColor" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
