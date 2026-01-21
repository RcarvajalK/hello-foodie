import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import {
    Users,
    ChevronLeft,
    Share2,
    Trophy,
    ScrollText,
    Plus,
    ExternalLink,
    MapPin,
    CheckCircle2,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function ClubDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fetchClubDetails = useStore(state => state.fetchClubDetails);
    const club = useStore(state => state.clubDetails);
    const loading = useStore(state => state.loading);
    const addRestaurantToClub = useStore(state => state.addRestaurantToClub);
    const myRestaurants = useStore(state => state.restaurants);

    const [activeTab, setActiveTab] = useState('list'); // 'list', 'members', 'rules'
    const [isSharing, setIsSharing] = useState(false);

    useEffect(() => {
        fetchClubDetails(id);
    }, [id, fetchClubDetails]);

    if (loading || !club) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const handleShare = () => {
        const url = `${window.location.origin}/join/${club.id}`; // Simple join link
        const text = `Join my foodie club "${club.name}" on Hello Foodie! 🍔✨\n${url}`;

        if (navigator.share) {
            navigator.share({ title: club.name, text, url });
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(text);
            alert('Enlace copiado al portapapeles');
        }
    };

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            {/* Header / Hero */}
            <div className="relative h-72 w-full overflow-hidden">
                <img
                    src={club.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'}
                    className="w-full h-full object-cover transform scale-110 blur-[2px] opacity-60"
                    alt={club.name}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-brand-light" />

                <div className="absolute top-12 left-6 right-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/clubs')}
                        className="w-12 h-12 bg-white/90 backdrop-blur rounded-2xl flex items-center justify-center shadow-lg text-brand-dark active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="w-12 h-12 bg-brand-orange text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/30 active:scale-90 transition-transform"
                    >
                        <Share2 size={20} />
                    </button>
                </div>

                <div className="absolute bottom-6 left-8 right-8">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-brand-orange/10 text-brand-orange text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm border border-brand-orange/20">
                            {club.type}
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tight leading-none mb-2 italic">
                        {club.name}
                    </h1>
                    <p className="text-xs font-medium text-gray-500 line-clamp-2 max-w-[280px]">
                        {club.description || 'Welcome to our foodie community. Let us discover the best flavors together.'}
                    </p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 -mt-2 relative z-10 flex gap-2 overflow-x-auto no-scrollbar py-4">
                {[
                    { id: 'list', label: 'Restaurants', icon: MapPin },
                    { id: 'members', label: 'Leaderboard', icon: Trophy },
                    { id: 'rules', label: 'Rules', icon: ScrollText }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-2 px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2",
                            activeTab === tab.id
                                ? "bg-brand-dark text-white border-brand-dark shadow-xl"
                                : "bg-white text-gray-400 border-transparent shadow-sm"
                        )}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'list' && (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Collaborative List</h2>
                                <button className="flex items-center gap-2 text-brand-orange text-[10px] font-black uppercase tracking-widest">
                                    <Plus size={14} /> Add New
                                </button>
                            </div>

                            {(club.restaurants || []).length > 0 ? (
                                club.restaurants.map((res) => (
                                    <div key={res.id} className="bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/20 border border-gray-50 flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 flex items-center justify-center overflow-hidden">
                                            {res.image_url ? (
                                                <img src={res.image_url} className="w-full h-full object-cover" alt={res.name} />
                                            ) : (
                                                <MapPin className="text-slate-300" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-black text-brand-dark uppercase text-xs truncate">{res.name}</h3>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{res.category}</p>
                                        </div>
                                        {res.is_visited && <CheckCircle2 className="text-brand-green" size={20} />}
                                        <ChevronLeft className="text-slate-100 rotate-180" size={20} />
                                    </div>
                                ))
                            ) : (
                                <div className="py-16 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <MapPin size={40} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest px-12">
                                        Our shared list is empty. Start suggesting places!
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'members' && (
                        <motion.div
                            key="members"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <div className="bg-brand-dark rounded-[3rem] p-8 text-white mb-8 relative overflow-hidden">
                                <Trophy className="absolute right-[-20px] top-[-20px] text-white/5" size={160} />
                                <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] mb-3 block">Leaderboard</span>
                                <h3 className="text-2xl font-black uppercase italic leading-none">Who's the Top<br />Foodie?</h3>
                            </div>

                            <div className="space-y-4">
                                {(club.members || []).map((member, index) => (
                                    <div key={member.user_id} className="bg-white p-5 rounded-[2.5rem] flex items-center gap-5 shadow-xl shadow-slate-200/20 border border-gray-50">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm",
                                            index === 0 ? "bg-brand-orange text-white" : "bg-slate-100 text-slate-400"
                                        )}>
                                            {index + 1}
                                        </div>
                                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                                            <img
                                                src={member.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`}
                                                className="w-full h-full object-cover"
                                                alt={member.profile?.full_name}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-brand-dark text-xs uppercase">{member.profile?.full_name || 'Incognito Foodie'}</h4>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{member.role}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-black text-brand-dark leading-none">0</p>
                                            <p className="text-[8px] font-black text-gray-400 uppercase">Visits</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'rules' && (
                        <motion.div
                            key="rules"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-8 space-y-8 shadow-xl shadow-slate-200/20 border border-gray-50"
                        >
                            <div>
                                <h3 className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] mb-4">The Club's DNA</h3>
                                <p className="text-sm font-medium text-gray-600 leading-relaxed">
                                    {club.description || 'No description provided yet.'}
                                </p>
                            </div>

                            <div className="h-[1px] bg-slate-100 w-full" />

                            <div>
                                <h3 className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] mb-6">Rules of the Table</h3>
                                <div className="space-y-6">
                                    {(club.rules || 'Respect other foodies.;Always share the best spots.;Keep information accurate.').split(';').map((rule, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-300">
                                                {i + 1}
                                            </div>
                                            <p className="text-xs font-bold text-brand-dark uppercase tracking-tight">
                                                {rule.trim()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4">
                                <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                    <Calendar size={12} /> Established {new Date(club.created_at).getFullYear()}
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
