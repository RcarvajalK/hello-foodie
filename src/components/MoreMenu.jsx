import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, HelpCircle, LogOut, Info, Shield, Bell, Heart, CreditCard, Users, Share2, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';

export default function MoreMenu({ isOpen, onClose }) {
    const navigate = useNavigate();
    const profile = useStore(state => state.profile);

    const menuItems = [
        { label: 'My Profile', icon: Settings, path: '/profile', color: 'text-blue-500' },
        { label: 'Clubs', icon: Users, path: '/clubs', color: 'text-purple-500' },
        { label: 'Favorites', icon: Heart, path: '/badges', color: 'text-red-500' },
        { label: 'Stats', icon: Star, path: '/stats', color: 'text-yellow-500' },
        { label: 'Notifications', icon: Bell, path: '/profile', color: 'text-orange-500' },
        { label: 'Subscription', icon: CreditCard, path: '/profile', color: 'text-green-500' },
        { label: 'Privacy', icon: Shield, path: '/profile', color: 'text-gray-500' },
        { label: 'About Hello Foodie!', icon: Info, path: '/profile', color: 'text-indigo-500' },
        { label: 'Help & Support', icon: HelpCircle, path: '/profile', color: 'text-cyan-500' },
        { label: 'Log Out', icon: LogOut, path: '/profile', color: 'text-red-600', special: true },
    ];

    const handleNavigate = (path) => {
        onClose();
        navigate(path);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm z-[200]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 bg-white rounded-t-[3rem] z-[201] p-8 pb-12 shadow-2xl border-t border-gray-100"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">More Sections</h2>
                            <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {menuItems.map((item, i) => (
                                <motion.button
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => handleNavigate(item.path)}
                                    className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors text-left"
                                >
                                    <div className={`p-2 bg-white rounded-xl shadow-sm ${item.color}`}>
                                        <item.icon size={20} />
                                    </div>
                                    <span className="text-xs font-black text-brand-dark uppercase tracking-wide">{item.label}</span>
                                </motion.button>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-4 p-6 bg-brand-orange/5 rounded-[2rem] border border-brand-orange/10">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-brand-orange shadow-sm border border-brand-orange/5">
                                    {profile?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-black text-brand-dark uppercase tracking-tight">{profile?.full_name || 'Foodie Explorer'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{profile?.favorite_cuisines?.length || 0} Saved Cuisines</p>
                                </div>
                                <button className="p-3 bg-white rounded-xl shadow-sm text-brand-orange active:scale-90 transition-transform">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
