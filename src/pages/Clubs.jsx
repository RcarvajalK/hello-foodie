import { useState, useEffect } from 'react';
import { Users, Plus, ChevronRight, Globe, Lock, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Clubs() {
    const navigate = useNavigate();
    const clubs = useStore(state => state.clubs);
    const fetchClubs = useStore(state => state.fetchClubs);
    const createClub = useStore(state => state.createClub);
    const joinClub = useStore(state => state.joinClub);
    const profile = useStore(state => state.profile);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newClub, setNewClub] = useState({ name: '', description: '', type: 'public', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400' });

    useEffect(() => {
        fetchClubs();
    }, [fetchClubs]);

    const handleCreate = async (e) => {
        e.preventDefault();
        const success = await createClub(newClub);
        if (success) {
            setIsCreateOpen(false);
            setNewClub({ name: '', description: '', type: 'public', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400' });
        }
    };

    const handleJoin = async (id) => {
        const success = await joinClub(id);
        if (success) {
            fetchClubs();
            alert('¡Te has unido al club!');
        }
    };

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            <header className="bg-white p-6 pt-12 rounded-b-[3rem] shadow-xl shadow-slate-200/40 relative z-10 border-b border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Foodie Clubs</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Connect with foodies</p>
                </div>
                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="w-12 h-12 bg-brand-orange text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/30 active:scale-90 transition-transform"
                >
                    <Plus size={24} />
                </button>
            </header>

            <div className="p-6 space-y-10">
                {/* My Clubs (Real Data) */}
                <section>
                    <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-2">Active Clubs</h2>
                    <div className="space-y-4">
                        {clubs.length > 0 ? clubs.map(club => (
                            <motion.div
                                key={club.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/20 border border-gray-50 flex items-center p-4 gap-5"
                            >
                                <img src={club.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'} alt={club.name} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-md" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-brand-dark truncate text-sm uppercase tracking-tight">{club.name}</h3>
                                        {club.type === 'private' ? <Lock size={12} className="text-brand-orange" /> : <Globe size={12} className="text-brand-green" />}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={12} /> {club.club_members?.[0]?.count || 0} Members
                                    </p>
                                    <button
                                        onClick={() => handleJoin(club.id)}
                                        className="mt-3 bg-slate-50 px-4 py-1.5 rounded-full text-[9px] font-black uppercase text-brand-orange border border-slate-100 active:scale-95 transition-all"
                                    >
                                        Join Community
                                    </button>
                                </div>
                                <ChevronRight className="text-slate-200" size={24} />
                            </motion.div>
                        )) : (
                            <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                <Users size={40} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No clubs found. Create the first one!</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Premium Teaser (Mock) */}
                <section className="bg-brand-dark rounded-[3.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-brand-dark/20">
                    <div className="relative z-10">
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] mb-3 block">Premium Experience</span>
                        <h2 className="text-2xl font-black mb-2 uppercase tracking-tight leading-tight">Masterclass Series</h2>
                        <p className="text-xs text-gray-400 font-medium mb-8 max-w-[220px]">Exclusive access to the world's most acclaimed culinary experts.</p>
                        <button className="bg-white text-brand-dark px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                            Join waitlist
                        </button>
                    </div>
                    <div className="absolute top-[-40px] right-[-40px] w-48 h-48 bg-brand-orange/10 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-[-60px] left-[50%] w-60 h-60 bg-brand-green/10 rounded-full blur-[100px]"></div>
                </section>
            </div>

            {/* Create Club Modal */}
            <AnimatePresence>
                {isCreateOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm" onClick={() => setIsCreateOpen(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">New Club</h2>
                                <button onClick={() => setIsCreateOpen(false)} className="p-2 text-gray-300"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Club Name</label>
                                    <input
                                        type="text" required
                                        className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[2rem] text-brand-dark font-black focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                        placeholder="e.g. Sushi Stars"
                                        value={newClub.name}
                                        onChange={e => setNewClub({ ...newClub, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Type</label>
                                    <div className="flex gap-3">
                                        {['public', 'private'].map(t => (
                                            <button
                                                key={t} type="button"
                                                onClick={() => setNewClub({ ...newClub, type: t })}
                                                className={clsx(
                                                    "flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    newClub.type === t ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20" : "bg-slate-50 text-gray-400"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-brand-orange text-white font-black py-5 rounded-[2rem] shadow-xl shadow-brand-orange/30 active:scale-95 transition-all">
                                    Create and Launch
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
