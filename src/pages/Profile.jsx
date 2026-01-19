import { Settings, Shield, ChevronRight, Award, History, Users } from 'lucide-react';
import { useStore } from '../lib/store';

export default function Profile() {
    const visitedIds = useStore(state => state.visitedIds);
    const userInfo = useStore(state => state.userInfo);

    const badges = [
        { name: 'First Bite', icon: '🍔', unlocked: true },
        { name: 'Local Guide', icon: '📍', unlocked: visitedIds.length >= 3 },
        { name: 'Sushi Lover', icon: '🍣', unlocked: false },
        { name: 'Star Critic', icon: '⭐', unlocked: false },
    ];

    return (
        <div className="pb-20 bg-slate-50 min-h-screen">
            <header className="bg-brand-orange p-6 pt-12 rounded-b-[2rem] shadow-lg text-white mb-6">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-3xl font-bold">
                        JD
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">{userInfo.name}</h1>
                        <p className="text-brand-yellow font-medium">Food Enthusiast</p>
                    </div>
                    <button className="ml-auto w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                        <Settings size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-center py-2 bg-black/10 rounded-2xl">
                    <div>
                        <p className="text-xl font-bold">{visitedIds.length}</p>
                        <p className="text-[10px] uppercase font-bold opacity-70">Visited</p>
                    </div>
                    <div className="border-x border-white/10">
                        <p className="text-xl font-bold">{userInfo.stats.photos}</p>
                        <p className="text-[10px] uppercase font-bold opacity-70">Photos</p>
                    </div>
                    <div>
                        <p className="text-xl font-bold">{badges.filter(b => b.unlocked).length}</p>
                        <p className="text-[10px] uppercase font-bold opacity-70">Badges</p>
                    </div>
                </div>
            </header>

            <div className="px-5 space-y-6">
                {/* Badges */}
                <section>
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-bold text-brand-dark flex items-center gap-2">
                            <Award className="text-brand-orange" size={18} />
                            My Badges
                        </h2>
                        <button className="text-brand-orange text-xs font-bold">See All</button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {badges.map(badge => (
                            <div
                                key={badge.name}
                                className={`flex-shrink-0 w-24 p-3 rounded-2xl border text-center transition-all ${badge.unlocked ? 'bg-white border-brand-orange/20 shadow-sm' : 'bg-gray-100 border-transparent opacity-50 grayscale'
                                    }`}
                            >
                                <div className="text-3xl mb-1">{badge.icon}</div>
                                <p className="text-[10px] font-bold text-brand-dark leading-tight">{badge.name}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Menu Items */}
                <section className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                    {[
                        { label: 'Visit History', icon: History, color: 'text-blue-500' },
                        { label: 'Foodie Groups', icon: Users, color: 'text-brand-green' },
                        { label: 'Premium Membership', icon: Shield, color: 'text-purple-500' },
                    ].map((item, idx) => (
                        <button
                            key={item.label}
                            className={`w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors ${idx !== 2 ? 'border-b border-gray-50' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gray-50 ${item.color}`}>
                                <item.icon size={18} />
                            </div>
                            <span className="font-medium text-brand-dark text-sm">{item.label}</span>
                            <ChevronRight className="ml-auto text-gray-300" size={16} />
                        </button>
                    ))}
                </section>
            </div>
        </div>
    );
}
