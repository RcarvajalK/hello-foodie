import { Users, Plus, ChevronRight, Globe, Lock, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Clubs() {
    const myClubs = [
        { id: '1', name: 'Office Foodies', members: 12, restaurants: 45, type: 'private', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400' },
        { id: '2', name: 'Weekend Brunchers', members: 8, restaurants: 12, type: 'private', image: 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42339?auto=format&fit=crop&q=80&w=400' },
    ];

    const discoveryClubs = [
        { id: '3', name: 'Michelin Seekers', members: '1.2k', restaurants: 89, type: 'public', image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=400' },
        { id: '4', name: 'Taco Tuesday Tour', members: 450, restaurants: 34, type: 'public', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=400' },
    ];

    return (
        <div className="pb-20 bg-slate-50 min-h-screen">
            <header className="bg-white p-5 sticky top-0 z-10 border-b border-gray-100 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-brand-dark">Clubs</h1>
                <button className="w-10 h-10 bg-brand-orange text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-orange/20">
                    <Plus size={24} />
                </button>
            </header>

            <div className="p-5 space-y-8">
                {/* My Clubs */}
                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">My Groups</h2>
                    <div className="space-y-4">
                        {myClubs.map(club => (
                            <div key={club.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex items-center p-3 gap-4">
                                <img src={club.image} alt={club.name} className="w-16 h-16 rounded-xl object-cover" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <h3 className="font-bold text-brand-dark truncate">{club.name}</h3>
                                        {club.type === 'private' ? <Lock size={12} className="text-gray-400" /> : <Globe size={12} className="text-gray-400" />}
                                    </div>
                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                        <Users size={12} /> {club.members} members
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                        {club.restaurants} places
                                    </p>
                                </div>
                                <ChevronRight className="text-gray-300" size={20} />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Explore Clubs */}
                <section>
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Discover Clubs</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {discoveryClubs.map(club => (
                            <div key={club.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-3">
                                <div className="relative h-24 mb-3">
                                    <img src={club.image} alt={club.name} className="w-full h-full object-cover rounded-xl" />
                                    <div className="absolute top-2 right-2 bg-brand-yellow px-1.5 py-0.5 rounded-md text-[10px] font-bold text-brand-dark flex items-center gap-1">
                                        <Star size={10} className="fill-brand-dark" /> Featured
                                    </div>
                                </div>
                                <h3 className="font-bold text-brand-dark text-sm mb-1 truncate">{club.name}</h3>
                                <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-3">
                                    <Users size={10} /> {club.members} fans
                                </p>
                                <button className="w-full py-2 bg-brand-orange/10 text-brand-orange text-xs font-bold rounded-lg hover:bg-brand-orange transition-colors hover:text-white">
                                    Join Club
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Celebrity Lists (Sponsored) */}
                <section className="bg-brand-dark rounded-3xl p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-[10px] font-bold text-brand-yellow uppercase tracking-widest mb-2 block">Premium Content</span>
                        <h2 className="text-xl font-bold mb-2">Chef Mario's Favorites</h2>
                        <p className="text-sm text-gray-300 mb-6 max-w-[200px]">Unlock the secret list of restaurants where top chefs actually eat.</p>
                        <button className="bg-white text-brand-dark px-5 py-2 rounded-full text-xs font-bold hover:scale-105 transition-transform">
                            Unlock Access
                        </button>
                    </div>
                    {/* Decorative shapes */}
                    <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-brand-orange/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-40px] left-[50%] w-40 h-40 bg-brand-green/10 rounded-full blur-3xl"></div>
                </section>
            </div>
        </div>
    );
}
