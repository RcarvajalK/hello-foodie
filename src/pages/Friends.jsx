import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { Users, Share2, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function Friends() {
    const fetchFriends = useStore(state => state.fetchFriends);
    const friends = useStore(state => state.friends);
    const navigate = useNavigate();

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            {/* Header */}
            <div className="pt-16 px-8 pb-8 bg-white rounded-b-[3.5rem] shadow-sm flex items-end gap-4 relative">
                <button 
                    onClick={() => navigate('/social')}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl active:scale-90 transition-all absolute top-12 left-6"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="mt-8">
                    <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tight italic leading-none mb-2">
                        My <span className="text-brand-orange">Friends</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Your Foodie Network</p>
                </div>
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
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
                                    Connect with other foodies to start sharing recommendations.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
