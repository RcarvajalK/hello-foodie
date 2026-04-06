import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { Users, Zap, MessageSquare, Share2, MapPin, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

export default function Social() {
    const [activeTab, setActiveTab] = useState('activity');
    const fetchSocialActivity = useStore(state => state.fetchSocialActivity);
    const fetchFriends = useStore(state => state.fetchFriends);
    const activity = useStore(state => state.socialActivity);
    const friends = useStore(state => state.friends);
    const loading = useStore(state => state.loading);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSocialActivity();
        fetchFriends();

        // Restore scroll position
        const savedScroll = sessionStorage.getItem('foodie_scroll_social');
        if (savedScroll) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScroll));
            }, 100);
        }

        return () => {
            sessionStorage.setItem('foodie_scroll_social', window.scrollY.toString());
        };
    }, [fetchSocialActivity, fetchFriends]);

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            {/* Header */}
            <div className="pt-16 px-8 pb-8 bg-white rounded-b-[3.5rem] shadow-sm flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tight italic leading-none mb-2">
                        Social <span className="text-brand-orange">Feed</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Connect with your foodie tribe</p>
                </div>
                <button 
                    onClick={() => navigate('/clubs')}
                    className="w-12 h-12 bg-slate-50 text-brand-orange rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                >
                    <Users size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div className="px-6 -mt-6 flex gap-3">
                {[
                    { id: 'activity', label: 'Activity', icon: Zap },
                    { id: 'friends', label: 'Friends', icon: Users }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 flex items-center justify-center gap-2 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all border-2",
                            activeTab === tab.id
                                ? "bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20"
                                : "bg-white text-gray-400 border-white shadow-sm"
                        )}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'activity' ? (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {activity.length > 0 ? (
                                activity.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col gap-4 active:scale-[0.98] transition-transform"
                                        onClick={() => navigate(`/restaurant/${item.restaurant?.id}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                                <Zap size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                    New in <span className="text-brand-dark">{item.club?.name}</span>
                                                </p>
                                                <h4 className="font-black text-brand-dark text-sm uppercase tracking-tight">
                                                    {item.restaurant?.name}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative h-40 rounded-[2rem] overflow-hidden">
                                            <img 
                                                src={item.restaurant?.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'} 
                                                className="w-full h-full object-cover"
                                                alt={item.restaurant?.name}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-white">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={12} className="text-brand-orange" />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[150px]">
                                                        {item.restaurant?.zone || 'Unknown Zone'}
                                                    </span>
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">
                                                    View
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 text-center">
                                    <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-gray-200 mx-auto mb-6 shadow-sm">
                                        <Zap size={40} />
                                    </div>
                                    <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight italic mb-2">No activity yet</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-12 leading-relaxed">
                                        Join some clubs or invite friends to see what's cooking!
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="friends"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {friends.length > 0 ? (
                                friends.map((friend) => (
                                    <div key={friend.id} className="bg-white p-4 rounded-[2.5rem] flex items-center gap-4 shadow-sm border border-gray-50">
                                        <div className="w-14 h-14 rounded-[1.8rem] overflow-hidden border-2 border-brand-light shadow-inner">
                                            <img 
                                                src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`} 
                                                className="w-full h-full object-cover"
                                                alt={friend.full_name}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-brand-dark text-[11px] uppercase tracking-tight">
                                                {friend.full_name || 'Incognito Foodie'}
                                            </h4>
                                            <p className="text-[8px] font-black text-brand-orange uppercase tracking-[0.2em] mt-0.5">
                                                {friend.role || 'Member'}
                                            </p>
                                        </div>
                                        <button className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-300 hover:text-brand-orange transition-colors">
                                            <Share2 size={18} />
                                        </button>
                                        <button className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-300 hover:text-brand-orange transition-colors">
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 text-center">
                                    <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-gray-200 mx-auto mb-6 shadow-sm">
                                        <Users size={40} />
                                    </div>
                                    <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight italic mb-2">Flying solo?</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-12 leading-relaxed">
                                        Join a club to connect with other foodies in your area.
                                    </p>
                                    <button 
                                        onClick={() => navigate('/clubs')}
                                        className="mt-8 bg-brand-orange text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-orange/20 active:scale-95 transition-all"
                                    >
                                        Explore Clubs
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
