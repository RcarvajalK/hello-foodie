import { Star, Award, History, Users, CreditCard, ChevronRight, LogOut } from 'lucide-react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function Profile() {
    const profile = useStore(state => state.profile);
    const restaurants = useStore(state => state.restaurants);
    const visitedCount = restaurants.filter(r => r.is_visited).length;

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const badges = [
        { title: 'Local Guide', icon: Star, color: 'bg-brand-orange', unlocked: visitedCount >= 3 },
        { title: 'Early Adopter', icon: Award, color: 'bg-brand-green', unlocked: true },
        { title: 'Social Foodie', icon: Users, color: 'bg-brand-yellow', unlocked: false },
    ];

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            <header className="bg-brand-orange p-10 pt-20 rounded-b-[3.5rem] text-white text-center shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <div className="w-24 h-24 bg-white rounded-[2rem] mx-auto mb-4 flex items-center justify-center text-5xl font-black text-brand-orange shadow-inner">
                        {profile?.full_name?.charAt(0) || 'U'}
                    </div>
                    <h1 className="text-2xl font-black tracking-tight uppercase">{profile?.full_name || 'Foodie Traveler'}</h1>
                    <p className="text-sm font-bold opacity-80 uppercase tracking-widest mt-1">{profile?.ranking || '#--- Ranking'}</p>
                </div>
                <div className="absolute top-[-20px] left-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </header>

            <div className="px-5 -mt-10 mb-8 relative z-20">
                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-50 flex justify-around">
                    <div className="text-center">
                        <p className="text-2xl font-black text-brand-dark">{visitedCount}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visited</p>
                    </div>
                    <p className="w-px h-10 bg-gray-100 self-center"></p>
                    <div className="text-center">
                        <p className="text-2xl font-black text-brand-dark">{profile?.badges_count || 0}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Badges</p>
                    </div>
                    <p className="w-px h-10 bg-gray-100 self-center"></p>
                    <div className="text-center">
                        <p className="text-2xl font-black text-brand-dark">#42</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global</p>
                    </div>
                </div>
            </div>

            <div className="px-5 mb-8">
                <h3 className="font-black text-lg mb-4 text-brand-dark uppercase tracking-tight ml-2">My Achievement Badges</h3>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                    {badges.map((badge) => (
                        <motion.div
                            key={badge.title}
                            whileTap={{ scale: 0.95 }}
                            className={`flex-shrink-0 w-32 p-5 rounded-[2rem] text-center shadow-md border border-gray-50 ${badge.unlocked ? 'bg-white' : 'bg-gray-100 grayscale opacity-50'}`}
                        >
                            <div className={`w-12 h-12 ${badge.color} rounded-2xl flex items-center justify-center mx-auto mb-3 text-white shadow-lg`}>
                                <badge.icon size={24} />
                            </div>
                            <p className="text-[10px] font-black text-brand-dark uppercase leading-tight">{badge.title}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="px-5 space-y-3">
                {[
                    { icon: History, label: 'Visit History', color: 'text-brand-orange' },
                    { icon: Users, label: 'Foodie Groups', color: 'text-brand-green' },
                    { icon: CreditCard, label: 'Premium Membership', color: 'text-brand-yellow' },
                ].map((item) => (
                    <button key={item.label} className="w-full bg-white p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-gray-50 active:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 bg-slate-50 ${item.color} rounded-xl flex items-center justify-center`}>
                                <item.icon size={20} />
                            </div>
                            <span className="font-black text-sm text-brand-dark uppercase tracking-tight">{item.label}</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </button>
                ))}

                <button
                    onClick={handleLogout}
                    className="w-full bg-white p-5 rounded-[1.5rem] flex items-center justify-between shadow-sm border border-red-50 text-red-500 mt-6 active:bg-red-50 transition-colors group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                            <LogOut size={20} />
                        </div>
                        <span className="font-black text-sm uppercase tracking-tight group-hover:translate-x-1 transition-transform">Logout Session</span>
                    </div>
                    <ChevronRight size={18} className="text-red-200" />
                </button>
            </div>

            <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mt-10 pb-10">Hello Foodie! v2.0</p>
        </div>
    );
}
