import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '../lib/store';
import { BADGE_LEVELS, getLevelFromXP, getNextLevelFromXP, calculateXP, SPECIAL_BADGES } from '../lib/badges';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Trophy, MapPin, Star, Settings, Plus, ChevronRight, Heart, Bell, X, Share2, Users, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { requestNotificationPermission } from '../lib/notifications';
import clsx from 'clsx';
import ImageUploader from '../components/ImageUploader';

export default function Profile() {
    const profile = useStore(state => state.profile);
    const rankings = useStore(state => state.rankings);
    const clubs = useStore(state => state.clubs);
    const restaurants = useStore(state => state.restaurants);
    const prefs = useStore(state => state.notificationPreferences);
    const setNotificationPreferences = useStore(state => state.setNotificationPreferences);
    const updateProfile = useStore(state => state.updateProfile);
    const uploadImage = useStore(state => state.uploadImage);
    const fetchRankings = useStore(state => state.fetchRankings);
    const fetchClubs = useStore(state => state.fetchClubs);
    const navigate = useNavigate();

    const fileInputRef = useRef(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [leaderboardTab, setLeaderboardTab] = useState('global');

    const [editData, setEditData] = useState({
        full_name: '',
        instagram: '',
        phone: '',
        favorite_cuisines: []
    });

    useEffect(() => {
        fetchRankings();
        fetchClubs();
    }, []);

    useEffect(() => {
        if (profile) {
            setEditData({
                full_name: profile.full_name || '',
                instagram: profile.instagram || '',
                phone: profile.phone || '',
                favorite_cuisines: profile.favorite_cuisines || []
            });
        }
    }, [profile]);

    const userXP = useMemo(() => calculateXP(restaurants), [restaurants]);
    const currentLevel = useMemo(() => getLevelFromXP(userXP), [userXP]);
    const nextLevel = useMemo(() => getNextLevelFromXP(userXP), [userXP]);

    const xpProgress = useMemo(() => {
        if (!nextLevel) return 100;
        const currentThreshold = currentLevel.xpThreshold;
        const nextThreshold = nextLevel.xpThreshold;
        const progress = ((userXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
        return Math.min(100, Math.max(0, progress));
    }, [userXP, currentLevel, nextLevel]);

    const visitedCount = restaurants.filter(r => r.is_visited).length;
    const toVisitCount = restaurants.filter(r => !r.is_visited).length;
    const badgesCount = BADGE_LEVELS.filter(b => userXP >= b.xpThreshold).length;
    const favoritesCount = restaurants.filter(r => r.is_favorite).length;

    const stats = [
        { label: 'To Visit', count: toVisitCount, color: 'text-red-500' },
        { label: 'Visited', count: visitedCount, color: 'text-cyan-500' },
        { label: 'Badges', count: badgesCount, color: 'text-yellow-500' },
        { label: 'Favs', count: favoritesCount, color: 'text-blue-600' },
    ];

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const handleQuickUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const result = await uploadImage(file);

        if (result.success) {
            const { error } = await updateProfile({ avatar_url: result.url });
            if (error) alert(`Error saving photo: ${error.message}`);
        } else {
            alert(`Upload failed: ${result.error}`);
        }
        setIsUploading(false);
    };

    const handleSave = async () => {
        const { error } = await updateProfile(editData);
        if (error) alert(`Error: ${error.message}`);
        else setIsSettingsOpen(false);
    };

    return (
        <div className="pb-32 bg-white min-h-screen">
            {/* Main Header Area */}
            <div className="pt-16 pb-12 px-8 text-center flex flex-col items-center">
                <div className="absolute top-12 right-8">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 bg-slate-50 text-slate-400 rounded-full active:scale-90 transition-transform"
                    >
                        <Settings size={22} />
                    </button>
                </div>

                {/* Avatar with Ring */}
                <div className="relative mb-6">
                    <div className="w-36 h-36 rounded-full p-1.5 bg-gradient-to-tr from-brand-orange to-brand-orange-light shadow-xl">
                        <div className="w-full h-full rounded-full border-[6px] border-white overflow-hidden bg-slate-100">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-4xl text-brand-orange italic">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Level Label Overlay */}
                    <div className="absolute -bottom-1 -right-1 bg-brand-orange text-white px-3 py-1 rounded-xl font-black text-[10px] border-4 border-white shadow-lg">
                        LVL {currentLevel.level}
                    </div>
                </div>

                <h1 className="text-3xl font-black text-brand-dark mb-1 tracking-tight">{profile?.full_name || 'The Connoisseur'}</h1>
                <p className="text-sm font-bold text-slate-400 tracking-tight">@{profile?.instagram || 'foodie_expert'}</p>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-3 w-full max-w-sm mt-10">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-slate-50/50 p-4 rounded-[2rem] flex flex-col items-center border border-slate-50">
                            <div className={clsx("w-1.5 h-1.5 rounded-full mb-3", stat.color.replace('text', 'bg'))}></div>
                            <span className="text-2xl font-black text-brand-dark leading-none mb-1">{stat.count}</span>
                            <span className="text-[7px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* XP Progress Section */}
                <div className="w-full max-w-sm mt-10 text-left">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {nextLevel ? `Next: ${nextLevel.name}` : 'Max Level'}
                        </p>
                        <p className="text-[10px] font-black text-brand-orange tracking-widest">
                            {userXP} / {nextLevel?.xpThreshold || userXP} XP
                        </p>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${xpProgress}%` }}
                            className="h-full bg-brand-orange rounded-full shadow-lg shadow-brand-orange/20"
                        />
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <div className="px-8 space-y-12">
                {/* Featured Badges */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-brand-dark tracking-tight">Featured Badges</h2>
                        <button
                            onClick={() => navigate('/badges')}
                            className="text-[10px] font-black text-brand-orange uppercase tracking-widest px-4 py-2 bg-brand-orange/5 rounded-full"
                        >
                            View All
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {SPECIAL_BADGES.slice(0, 4).map((badge) => {
                            const isUnlocked = badge.check(restaurants);
                            const iconStyle = {
                                pizza: '🍕', sushi: '🍣', moon: '🌙', taco: '🌮', people: '👥', medal: '🏅'
                            };
                            return (
                                <div key={badge.id} className="flex flex-col items-center">
                                    <div className={clsx(
                                        "w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-all",
                                        isUnlocked ? "bg-white border-white scale-100" : "bg-slate-50 grayscale opacity-40 scale-95 border-2 border-dashed border-slate-200"
                                    )}>
                                        {isUnlocked ? iconStyle[badge.iconType] : <X className="text-slate-200" size={24} />}
                                    </div>
                                    <span className={clsx(
                                        "text-[8px] font-black uppercase text-center mt-3 tracking-widest",
                                        isUnlocked ? "text-slate-400" : "text-slate-300"
                                    )}>
                                        {isUnlocked ? badge.name : 'Locked'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Leaderboard Summary */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-brand-dark tracking-tight">Ranking</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => navigate('/rankings')}
                                className="text-[10px] font-black text-brand-orange uppercase tracking-widest px-4 py-2 bg-brand-orange/5 rounded-full"
                            >
                                View All
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3 mb-6 p-1 bg-slate-50 rounded-2xl">
                        {['global', 'friends'].map(t => (
                            <button
                                key={t}
                                onClick={() => setLeaderboardTab(t)}
                                className={clsx(
                                    "flex-1 py-3 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all",
                                    leaderboardTab === t ? "bg-white text-brand-orange shadow-sm" : "text-slate-400"
                                )}
                            >
                                {t === 'global' ? <div className="flex items-center justify-center gap-2"><Globe size={12} /> Global</div> : <div className="flex items-center justify-center gap-2"><Users size={12} /> Friends</div>}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {(leaderboardTab === 'global' ? rankings : rankings.slice(0, 2)).slice(0, 4).map((user, idx) => (
                            <div key={user.id} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-3xl border border-slate-50">
                                <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden shadow-sm bg-white shrink-0">
                                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-black text-brand-orange uppercase text-lg">{user.full_name?.charAt(0) || 'U'}</div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-xs font-black text-brand-dark uppercase tracking-tight truncate">{user.full_name || 'Incognito Foodie'}</h4>
                                    <p className="text-[9px] font-bold text-brand-orange uppercase tracking-widest mt-0.5">#{idx + 1} Rank • {user.visit_count * 100} XP</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-brand-dark leading-none">{user.visit_count}</p>
                                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Places</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Community Stats */}
                <section className="bg-brand-dark rounded-[3rem] p-8 text-white relative overflow-hidden">
                    <div className="flex gap-12 relative z-10">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">My Tribe</p>
                            <h3 className="text-3xl font-black italic">12 <span className="text-[10px] uppercase align-middle ml-1">Friends</span></h3>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">My Crews</p>
                            <h3 className="text-3xl font-black italic">{clubs.length} <span className="text-[10px] uppercase align-middle ml-1">Clubs</span></h3>
                        </div>
                    </div>
                    <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-brand-orange/20 rounded-full blur-[80px]" />
                </section>
            </div>

            {/* Settings & Profile Edit Modal */}
            <AnimatePresence>
                {isSettingsOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-end justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSettingsOpen(false)}
                            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-sm rounded-t-[3.5rem] p-10 relative z-10 shadow-2xl overflow-y-auto max-h-[90vh] no-scrollbar"
                        >
                            <div className="w-12 h-1 bg-slate-100 rounded-full mx-auto mb-8" />

                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Account Settings</h3>
                                <button onClick={() => setIsSettingsOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Section: Avatar Change */}
                            <div className="flex flex-col items-center mb-10">
                                <div className="relative group">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleQuickUpload}
                                    />
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={clsx(
                                            "w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-3xl font-black text-brand-orange border-4 border-white shadow-xl overflow-hidden cursor-pointer relative transition-all",
                                            isUploading && "animate-pulse"
                                        )}
                                    >
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                                                <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                                            </div>
                                        )}
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                                        ) : (
                                            profile?.full_name?.charAt(0) || 'U'
                                        )}
                                        <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/20 transition-colors flex items-center justify-center">
                                            <Plus className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                                        </div>
                                    </motion.div>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 mt-4">Tap to change photo</p>
                            </div>

                            {/* Section: Personal Info */}
                            <div className="space-y-6 mb-12">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Personal Info</h4>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase text-slate-400 ml-4">Full Name</label>
                                        <input
                                            className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-brand-dark border-none"
                                            value={editData.full_name}
                                            onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase text-slate-400 ml-4">Instagram</label>
                                        <input
                                            className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-brand-dark border-none"
                                            value={editData.instagram}
                                            onChange={(e) => setEditData({ ...editData, instagram: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase text-slate-400 ml-4">Phone</label>
                                        <input
                                            className="w-full bg-slate-50 p-4 rounded-2xl font-bold text-brand-dark border-none"
                                            value={editData.phone}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSave}
                                    className="w-full bg-brand-dark text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl"
                                >
                                    Update Identity
                                </button>
                            </div>

                            {/* Section: Notifications */}
                            <div className="space-y-6 mb-12">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300">Preferences</h4>
                                <div className="space-y-6 bg-slate-50 p-6 rounded-[2.5rem]">
                                    {[
                                        { key: 'nearby', label: 'Nearby Magic', desc: 'When near a saved spot' },
                                        { key: 'lunch', label: 'Lunch Discovery', desc: '1:00 PM Daily' },
                                        { key: 'dinner', label: 'Dinner Inspo', desc: '8:00 PM Daily' }
                                    ].map((pref) => (
                                        <div key={pref.key} className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[11px] font-black text-brand-dark uppercase tracking-tight">{pref.label}</p>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight opacity-60">{pref.desc}</p>
                                            </div>
                                            <button
                                                onClick={() => setNotificationPreferences({ [pref.key]: !prefs[pref.key] })}
                                                className={clsx(
                                                    "w-10 h-5 rounded-full transition-all relative p-1",
                                                    prefs[pref.key] ? 'bg-brand-orange' : 'bg-slate-200'
                                                )}
                                            >
                                                <motion.div
                                                    animate={{ x: prefs[pref.key] ? 20 : 0 }}
                                                    className="w-3 h-3 bg-white rounded-full shadow-sm"
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Section: Danger Zone */}
                            <div className="space-y-4">
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-red-50 text-red-500 font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] mb-4"
                                >
                                    Log Out
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
