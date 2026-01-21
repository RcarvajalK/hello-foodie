import { useState, useEffect } from 'react';
import { Users, Plus, ChevronRight, Globe, Lock, Star, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Clubs() {
    const navigate = useNavigate();
    const { token } = useParams();
    const clubs = useStore(state => state.clubs);
    const fetchClubs = useStore(state => state.fetchClubs);
    const createClub = useStore(state => state.createClub);
    const joinClub = useStore(state => state.joinClub);
    const profile = useStore(state => state.profile);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createStep, setCreateStep] = useState(1); // 1: Form, 2: Shared Link
    const [createdClubId, setCreatedClubId] = useState(null);
    const [newClub, setNewClub] = useState({
        name: '',
        description: '',
        type: 'public',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'
    });

    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchClubs();
    }, [fetchClubs]);

    useEffect(() => {
        if (token) {
            const autoJoin = async () => {
                const result = await joinClub(token);
                if (result.success) {
                    alert('¡Bienvenido al club!');
                    navigate(`/clubs/${token}`);
                } else {
                    alert(`No se pudo unir al club: ${result.error}`);
                    navigate('/clubs');
                }
            };
            autoJoin();
        }
    }, [token, joinClub, navigate]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        const result = await createClub(newClub);
        setIsCreating(false);

        if (result?.success) {
            setCreatedClubId(result.data.id);
            setCreateStep(2);
            fetchClubs();
        } else {
            alert(`Error al crear el club: ${result?.error || 'Unknown error'}`);
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/join/${createdClubId}`;
        const text = `Join my foodie club "${newClub.name}" on Hello Foodie! 🍔✨\n${url}`;

        if (navigator.share) {
            navigator.share({ title: newClub.name, text, url });
        } else {
            navigator.clipboard.writeText(text);
            alert('¡Enlace copiado al portapapeles!');
        }
    };

    const handleJoin = async (id) => {
        const result = await joinClub(id);
        if (result?.success) {
            fetchClubs();
            alert('¡Te has unido al club!');
        } else {
            alert(`Error al unirse al club: ${result?.error || 'Unknown error'}`);
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
                    onClick={() => {
                        setCreateStep(1);
                        setIsCreateOpen(true);
                    }}
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
                                onClick={() => navigate(`/clubs/${club.id}`)}
                                className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-slate-200/20 border border-gray-50 flex items-center p-4 gap-5 cursor-pointer active:scale-[0.98] transition-all"
                            >
                                <img src={club.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'} alt={club.name} className="w-20 h-20 rounded-[1.5rem] object-cover shadow-md bg-slate-100" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-black text-brand-dark truncate text-sm uppercase tracking-tight">{club.name}</h3>
                                        {club.type === 'private' ? <Lock size={12} className="text-brand-orange" /> : <Globe size={12} className="text-brand-green" />}
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Users size={12} /> {club.club_members?.[0]?.count || 0} Members
                                    </p>
                                    {club.is_member ? (
                                        <div className="mt-3 inline-flex items-center gap-1.5 bg-brand-green/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase text-brand-green border border-brand-green/20">
                                            <Star size={10} fill="currentColor" />
                                            Member
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleJoin(club.id);
                                            }}
                                            className="mt-3 bg-slate-50 px-4 py-1.5 rounded-full text-[9px] font-black uppercase text-brand-orange border border-slate-100 active:scale-95 transition-all"
                                        >
                                            Join Community
                                        </button>
                                    )}
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
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">
                                    {createStep === 1 ? 'New Club' : 'Invite Friends'}
                                </h2>
                                <button onClick={() => setIsCreateOpen(false)} className="p-2 text-gray-300"><X size={20} /></button>
                            </div>

                            {createStep === 1 ? (
                                <form onSubmit={handleCreate} className="space-y-5">
                                    <div className="flex justify-center mb-4">
                                        <div className="relative group w-24 h-24">
                                            <img
                                                src={newClub.image}
                                                className="w-24 h-24 rounded-[2rem] object-cover shadow-lg border-2 border-white"
                                                alt="Preview"
                                                onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'}
                                            />
                                            <div className="absolute inset-0 bg-black/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <Star size={20} className="text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Club Name</label>
                                        <input
                                            type="text" required
                                            className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-[1.5rem] text-brand-dark font-black focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all text-sm"
                                            placeholder="e.g. Sushi Stars"
                                            value={newClub.name}
                                            onChange={e => setNewClub({ ...newClub, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Image URL</label>
                                        <input
                                            type="url"
                                            className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-[1.5rem] text-brand-dark font-black focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all text-[10px]"
                                            placeholder="Paste image link here"
                                            value={newClub.image}
                                            onChange={e => setNewClub({ ...newClub, image: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Type</label>
                                        <div className="flex gap-2">
                                            {['public', 'private'].map(t => (
                                                <button
                                                    key={t} type="button"
                                                    onClick={() => setNewClub({ ...newClub, type: t })}
                                                    className={clsx(
                                                        "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                        newClub.type === t ? "bg-brand-dark text-white shadow-lg" : "bg-slate-50 text-gray-400"
                                                    )}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className={clsx(
                                            "w-full text-white font-black py-4 rounded-[1.5rem] shadow-xl transition-all mt-4",
                                            isCreating ? "bg-gray-400 cursor-not-allowed" : "bg-brand-orange shadow-brand-orange/30 active:scale-95"
                                        )}
                                    >
                                        {isCreating ? 'Creating...' : 'Create and Launch'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center space-y-8 py-4">
                                    <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto text-brand-green mb-4">
                                        <Star size={40} fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-brand-dark uppercase tracking-tight text-xl mb-2 italic">Ready to go!</h3>
                                        <p className="text-xs text-gray-400 font-medium px-4">Your club is active. Share this link to start building your community.</p>
                                    </div>

                                    <button
                                        onClick={handleShare}
                                        className="w-full bg-brand-dark text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        Share Invite Link
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsCreateOpen(false);
                                            navigate(`/clubs/${createdClubId}`);
                                        }}
                                        className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-brand-orange transition-colors"
                                    >
                                        Skip for now
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
