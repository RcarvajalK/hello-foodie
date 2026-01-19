import { BarChart3, TrendingUp, MapPin, Award, PieChart, Sparkles } from 'lucide-react';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';

export default function Stats() {
    const visitedIds = useStore(state => state.visitedIds);
    const savedIds = useStore(state => state.savedIds);
    const userInfo = useStore(state => state.userInfo);

    const stats = [
        { label: 'Exploration %', value: '64%', icon: TrendingUp, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
        { label: 'Top Zone', value: 'Roma Norte', icon: MapPin, color: 'text-brand-green', bg: 'bg-brand-green/10' },
        { label: 'Level', value: 'Epicurean', icon: Award, color: 'text-brand-yellow', bg: 'bg-brand-yellow/10' },
    ];

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            <header className="bg-white p-5 sticky top-0 z-10 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-orange/10 text-brand-orange rounded-xl flex items-center justify-center font-bold">
                    <BarChart3 size={24} />
                </div>
                <h1 className="text-xl font-black text-brand-dark">Data Insights</h1>
            </header>

            <div className="p-5 space-y-6">
                {/* Main Stats Grid */}
                <section className="grid grid-cols-3 gap-3">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center"
                        >
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                                <stat.icon size={20} />
                            </div>
                            <p className="text-lg font-black text-brand-dark">{stat.value}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        </motion.div>
                    ))}
                </section>

                {/* Activity Summary */}
                <section className="bg-brand-dark rounded-3xl p-6 text-white relative overflow-hidden shadow-xl shadow-brand-dark/20">
                    <div className="relative z-10 flex justify-between items-end h-32 mb-6">
                        {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className="w-4 bg-brand-orange/50 rounded-full relative group"
                            >
                                <div className="absolute inset-x-0 bottom-0 bg-brand-orange rounded-full h-1/2 group-hover:h-full transition-all"></div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold opacity-60">Visits this week</p>
                            <h2 className="text-3xl font-black">{visitedIds.length} <span className="text-xs font-bold text-brand-green">+12% vs last week</span></h2>
                        </div>
                        <Sparkles className="text-brand-yellow animate-pulse" size={32} />
                    </div>
                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl"></div>
                </section>

                {/* Categories Breakdown */}
                <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-brand-dark">Favorites by Cuisine</h3>
                        <PieChart size={20} className="text-gray-300" />
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Italian', count: 12, color: 'bg-brand-orange', percent: 45 },
                            { label: 'Japanese', count: 8, color: 'bg-brand-green', percent: 30 },
                            { label: 'Mexican', count: 5, color: 'bg-brand-yellow', percent: 18 },
                            { label: 'Other', count: 2, color: 'bg-gray-200', percent: 7 },
                        ].map((item) => (
                            <div key={item.label} className="space-y-1.5">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-brand-dark">{item.label}</span>
                                    <span className="text-gray-400">{item.percent}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.percent}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full ${item.color}`}
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
