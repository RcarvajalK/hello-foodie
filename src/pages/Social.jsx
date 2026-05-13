import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { Users, Zap, MessageSquare, Share2, MapPin, Clock, ChevronRight, Globe, Lock, Star, Trash2, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';

export default function Social() {
    const [activeTab, setActiveTab] = useState('activity');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [createdClubId, setCreatedClubId] = useState(null);
    const [newClub, setNewClub] = useState({
        name: '',
        description: '',
        type: 'private',
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'
    });
    const [isCreating, setIsCreating] = useState(false);

    const fetchSocialActivity = useStore(state => state.fetchSocialActivity);
    const fetchClubs = useStore(state => state.fetchClubs);
    const createClub = useStore(state => state.createClub);
    const joinClub = useStore(state => state.joinClub);
    const deleteClub = useStore(state => state.deleteClub);
    const profile = useStore(state => state.profile);
    const activity = useStore(state => state.socialActivity);
    const clubs = useStore(state => state.clubs);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSocialActivity();
        fetchClubs();

        // Restore scroll position
        const savedScroll = sessionStorage.getItem('foodie_scroll_social');
        if (savedScroll) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedScroll));
            }, 100);
        }

        return () => {
            sessionStorage.setItem('foodie_scroll_social', window.scrollY.toString());
        };
    }, [fetchSocialActivity, fetchClubs]);

    const handleJoin = async (id) => {
        const result = await joinClub(id);
        if (result?.success) {
            fetchClubs();
            alert('Successfully joined the club!');
        } else {
            alert(`Failed to join club: ${result?.error || 'Unknown error'}`);
        }
    };

    const handleDelete = async (clubId) => {
        if (window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
            const result = await deleteClub(clubId);
            if (result.success) {
                // Local state is already updated
            } else {
                alert(`Error: ${result.error}`);
            }
        }
    };

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
            alert(`Failed to create club: ${result?.error || 'Unknown error'}`);
        }
    };

    const handleShare = () => {
        const url = `${window.location.origin}/join/${createdClubId}`;
        const text = `Join my foodie club "${newClub.name}" on Hello Foodie! 🍔✨\n${url}`;

        if (navigator.share) {
            navigator.share({ title: newClub.name, text, url });
        } else {
            navigator.clipboard.writeText(text);
            alert('Link copied to clipboard!');
        }
    };

    const privateClubs = clubs.filter(c => c.type === 'private');
    const publicClubs = clubs.filter(c => c.type === 'public');

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            {/* Header */}
            <div className="pt-16 px-8 pb-8 bg-white rounded-b-[3.5rem] shadow-sm flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tight italic leading-none mb-2">
                        Social <span className="text-brand-orange">Feed</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Connect with your foodie tribe</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                    <button 
                        onClick={() => navigate('/friends')}
                        className="w-12 h-12 bg-slate-50 text-brand-orange rounded-2xl flex items-center justify-center active:scale-90 transition-transform"
                    >
                        <Users size={20} />
                    </button>
                    <span className="text-[9px] font-black uppercase text-brand-orange tracking-widest">Friends</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-6 -mt-6 flex gap-2">
                {[
                    { id: 'activity', label: 'Activity', icon: Zap },
                    { id: 'circles', label: 'Circles', icon: Lock },
                    { id: 'communities', label: 'Communities', icon: Globe }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-[2rem] text-[9px] font-black uppercase tracking-widest transition-all border-2",
                            activeTab === tab.id
                                ? "bg-brand-dark text-white border-brand-dark shadow-xl shadow-brand-dark/20"
                                : "bg-white text-gray-400 border-white shadow-sm"
                        )}
                    >
                        <tab.icon size={14} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'activity' && (
                        <motion.div
                            key="activity"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {activity.length > 0 ? (
                                activity.map((item) => (
                                    <div 
                                        key={item.id} 
                                        className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col gap-4 active:scale-[0.98] transition-transform"
                                        onClick={() => navigate(`/restaurant/${item.restaurant?.id}`)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                                                <Zap size={18} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                                                    New in <span className="text-brand-dark">{item.club?.name}</span>
                                                </p>
                                                <h4 className="font-black text-brand-dark text-sm uppercase tracking-tight">
                                                    {item.restaurant?.name}
                                                </h4>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative h-40 rounded-[2rem] overflow-hidden">
                                            <img 
                                                src={item.restaurant?.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'} 
                                                className="w-full h-full object-cover"
                                                alt={item.restaurant?.name}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                            <div className="absolute bottom-4 left-6 right-6 flex justify-between items-center text-white">
                                                <div className="flex items-center gap-2">
                                                    <MapPin size={12} className="text-brand-orange" />
                                                    <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[150px]">
                                                        {item.restaurant?.zone || 'Unknown Zone'}
                                                    </span>
                                                </div>
                                                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">
                                                    View
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 text-center">
                                    <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-gray-200 mx-auto mb-6 shadow-sm">
                                        <Zap size={40} />
                                    </div>
                                    <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight italic mb-2">No activity yet</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-12 leading-relaxed">
                                        Join some clubs or invite friends to see what's cooking!
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'circles' && (
                        <motion.div
                            key="circles"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <h2 className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] mb-2 ml-2">Circles (Private)</h2>
                            <p className="text-xs text-gray-400 font-medium mb-6 ml-2 max-w-[280px]">Your intimate spaces. Friday plans, shared lists, and cravings with your inner circle.</p>
                            
                            {privateClubs.length > 0 ? privateClubs.map(club => {
                                const isAdmin = club.created_by === profile?.id;
                                return (
                                    <div
                                        key={club.id}
                                        onClick={() => navigate(`/clubs/${club.id}`)}
                                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-50 flex items-center p-4 gap-5 cursor-pointer"
                                    >
                                        <img src={club.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'} alt={club.name} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-sm bg-slate-100" />
                                        <div className="flex-1 min-w-0 pointer-events-none">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-brand-dark truncate text-sm uppercase tracking-tight">{club.name}</h3>
                                                <Lock size={12} className="text-brand-orange" />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Users size={12} /> {club.club_members?.[0]?.count || 0} Members
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(club.id);
                                                    }}
                                                    className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform pointer-events-auto"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <ChevronRight className="text-slate-300" size={20} />
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-12 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 mt-4">
                                    <Lock size={32} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">You don't have any circles yet.</p>
                                    <button 
                                        onClick={() => setIsCreateOpen(true)}
                                        className="mt-6 bg-brand-orange text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] shadow-xl shadow-brand-orange/20 active:scale-95 transition-all"
                                    >
                                        Create Circle
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'communities' && (
                        <motion.div
                            key="communities"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <h2 className="text-[10px] font-black text-brand-green uppercase tracking-[0.3em] mb-2 ml-2">Communities (Public)</h2>
                            <p className="text-xs text-gray-400 font-medium mb-6 ml-2 max-w-[280px]">The authority in gastronomy. Expert-curated rankings with the Triple Rating System.</p>
                            
                            {publicClubs.length > 0 ? publicClubs.map(club => {
                                const isAdmin = club.created_by === profile?.id;
                                return (
                                    <div
                                        key={club.id}
                                        onClick={() => navigate(`/clubs/${club.id}`)}
                                        className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-brand-green/10 flex items-center p-4 gap-5 cursor-pointer"
                                    >
                                        <img src={club.image || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'} alt={club.name} className="w-16 h-16 rounded-[1.5rem] object-cover shadow-sm bg-slate-100" />
                                        <div className="flex-1 min-w-0 pointer-events-none">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-black text-brand-dark truncate text-sm uppercase tracking-tight">{club.name}</h3>
                                                <Globe size={12} className="text-brand-green" />
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Users size={12} /> {club.club_members?.[0]?.count || 0} Members
                                            </p>
                                            {club.is_member ? (
                                                <div className="mt-2 inline-flex items-center gap-1.5 bg-brand-green/10 px-3 py-1 rounded-full text-[8px] font-black uppercase text-brand-green border border-brand-green/20">
                                                    <Star size={10} fill="currentColor" />
                                                    Member
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleJoin(club.id);
                                                    }}
                                                    className="mt-2 bg-slate-50 px-3 py-1 rounded-full text-[8px] font-black uppercase text-brand-green border border-slate-100 pointer-events-auto"
                                                >
                                                    Join
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isAdmin && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(club.id);
                                                    }}
                                                    className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform pointer-events-auto"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                            <ChevronRight className="text-slate-300" size={20} />
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="py-12 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 mt-4">
                                    <Globe size={32} className="mx-auto text-slate-200 mb-3" />
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No public communities yet.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Create FAB */}
            {activeTab !== 'activity' && (
                <button
                    onClick={() => {
                        setNewClub({ ...newClub, type: activeTab === 'communities' ? 'public' : 'private' });
                        setCreateStep(1);
                        setIsCreateOpen(true);
                    }}
                    className="fixed bottom-28 right-6 w-14 h-14 bg-brand-orange text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-brand-orange/40 active:scale-90 transition-transform z-40 border-4 border-brand-light"
                >
                    <Plus size={28} />
                </button>
            )}

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
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Cover Photo</label>
                                        <ImageUploader
                                            currentImage={newClub.image}
                                            onUploadComplete={(url) => setNewClub({ ...newClub, image: url })}
                                            label="Upload photo"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold text-brand-dark border-none focus:ring-2 focus:ring-brand-orange/10"
                                            placeholder="e.g., Pizza Lovers..."
                                            value={newClub.name}
                                            onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Description</label>
                                        <textarea
                                            className="w-full bg-slate-50 p-4 rounded-2xl text-sm font-bold text-brand-dark border-none focus:ring-2 focus:ring-brand-orange/10 min-h-[80px] resize-none"
                                            placeholder="What is this about? (Optional)"
                                            value={newClub.description}
                                            onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Type</label>
                                        <div className="flex gap-2">
                                            <button
                                                key="private" type="button"
                                                onClick={() => setNewClub({ ...newClub, type: 'private' })}
                                                className={clsx(
                                                    "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    newClub.type === 'private' ? "bg-brand-orange text-white shadow-lg" : "bg-slate-50 text-gray-400"
                                                )}
                                            >
                                                Circle (Private)
                                            </button>
                                            <button
                                                key="public" type="button"
                                                onClick={() => setNewClub({ ...newClub, type: 'public' })}
                                                className={clsx(
                                                    "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                    newClub.type === 'public' ? "bg-brand-green text-white shadow-lg" : "bg-slate-50 text-gray-400"
                                                )}
                                            >
                                                Community
                                            </button>
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
