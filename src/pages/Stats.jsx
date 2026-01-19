import { BarChart3, TrendingUp, MapPin, Award, PieChart, Sparkles } from 'lucide-react';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import { useEffect } from 'react';

export default function Stats() {
    const restaurants = useStore(state => state.restaurants);
    const profile = useStore(state => state.profile);
    const fetchRestaurants = useStore(state => state.fetchRestaurants);
    const fetchProfile = useStore(state => state.fetchProfile);

    const visitedCount = restaurants.filter(r => r.is_visited).length;
    const explorationPercent = restaurants.length > 0 ? Math.round((visitedCount / restaurants.length) * 100) : 0;

    useEffect(() => {
        fetchRestaurants();
        fetchProfile();
    }, []);

    const stats = [
        { label: 'Exploration %', value: `${explorationPercent}%`, icon: TrendingUp, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
        { label: 'Top Zone', value: restaurants[0]?.zone || '---', icon: MapPin, color: 'text-brand-green', bg: 'bg-brand-green/10' },
        { label: 'Level', value: profile?.ranking?.split(' ')[1] || 'Newbie', icon: Award, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' },
    ];

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            <header className="bg-white p-5 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3 pt-12">
                <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center font-bold">
                    <BarChart3 size={24} />
                </div>
                <h1 className="text-xl font-black text-brand-dark uppercase tracking-tight">Data Insights</h1>
            </header>

            <div className="p-5 space-y-6">
                <section className="grid grid-cols-3 gap-3">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 text-center"
                        >
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-lg font-black text-brand-dark tracking-tight">{stat.value}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        </motion.div>
                    ))}
                </section>

                <section className="bg-brand-dark rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-brand-dark/20 transition-all active:scale-[0.99]">
                    <div className="relative z-10 flex justify-between items-end h-32 mb-8">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
                                className="w-4 bg-white/10 rounded-full relative group"
                            >
                                <div className="absolute inset-x-0 bottom-0 bg-brand-orange rounded-full h-1/2 group-hover:h-full transition-all duration-300"></div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-xs font-black opacity-60 uppercase tracking-widest mb-1">Total Visited</p>
                            <h2 className="text-4xl font-black tracking-tight">{visitedCount} <span className="text-xs font-black text-brand-green ml-2">+12%</span></h2>
                        </div>
                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                            <Sparkles className="text-brand-yellow animate-pulse" size={28} />
                        </div>
                    </div>
                    <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-brand-orange/20 rounded-full blur-3xl pointer-events-none"></div>
                </section>

                <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 mb-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-black text-lg text-brand-dark uppercase tracking-tight">Your Palette</h3>
                        <PieChart size={20} className="text-gray-300" />
                    </div>
                    <div className="space-y-5">
                        {[
                            { label: 'Italian', count: 12, color: 'bg-brand-orange', percent: 45 },
                            { label: 'Japanese', count: 8, color: 'bg-brand-green', percent: 32 },
                            { label: 'Mexican', count: 5, color: 'bg-brand-yellow', percent: 18 },
                            { label: 'Other', count: 2, color: 'bg-slate-200', percent: 5 },
                        ].map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-brand-dark">{item.label}</span>
                                    <span className="text-gray-400">{item.percent}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percent}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className={`h-full ${item.color} rounded-full`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
