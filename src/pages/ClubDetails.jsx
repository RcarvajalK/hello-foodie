import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
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
    Calendar,
    X,
    Search,
    Edit3,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Autocomplete } from '@react-google-maps/api';
import RestaurantCard from '../components/RestaurantCard';
import clsx from 'clsx';
import ImageUploader from '../components/ImageUploader';

export default function ClubDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fetchClubDetails = useStore(state => state.fetchClubDetails);
    const club = useStore(state => state.clubDetails);
    const loading = useStore(state => state.loading);
    const addRestaurantToClub = useStore(state => state.addRestaurantToClub);
    const removeRestaurantFromClub = useStore(state => state.removeRestaurantFromClub);
    const myRestaurants = useStore(state => state.restaurants);
    const updateClub = useStore(state => state.updateClub);
    const deleteClub = useStore(state => state.deleteClub);

    const [activeTab, setActiveTab] = useState('list'); // 'list', 'members', 'rules'
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [addSource, setAddSource] = useState('personal'); // 'personal' or 'google'
    const [error, setError] = useState(null);
    const [autocomplete, setAutocomplete] = useState(null);
    const [isLoadingPlace, setIsLoadingPlace] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [userCoords, setUserCoords] = useState(null);

    const fetchRestaurants = useStore(state => state.fetchRestaurants);
    const addGooglePlaceToClub = useStore(state => state.addGooglePlaceToClub);

    useEffect(() => {
        const load = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const result = await fetchClubDetails(id);
            if (!result.success) {
                setError(result.error);
            } else {
                const clubData = result.data;
                const userMember = clubData.members?.find(m => m.user_id === session?.user?.id);
                setIsAdmin(userMember?.role === 'admin' || clubData.created_by === session?.user?.id);
                setEditForm({
                    name: clubData.name,
                    description: clubData.description,
                    image: clubData.image,
                    type: clubData.type,
                    rules: clubData.rules
                });
            }
        };
        load();
        if (myRestaurants.length === 0) fetchRestaurants();

        navigator.geolocation.getCurrentPosition(
            (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            (err) => console.log('Geolocation error', err)
        );
    }, [id, fetchClubDetails, fetchRestaurants, myRestaurants.length]);

    const calculateDistance = (r) => {
        if (!userCoords || !r.coordinates) return Infinity;
        const dx = (r.coordinates.x || 0) - userCoords.lat;
        const dy = (r.coordinates.y || 0) - userCoords.lng;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const sortedClubRestaurants = useMemo(() => {
        if (!club?.restaurants) return [];
        return [...club.restaurants].sort((a, b) => calculateDistance(a) - calculateDistance(b));
    }, [club?.restaurants, userCoords]);

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !club) {
        return (
            <div className="min-h-screen bg-brand-light flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mb-6">
                    <X size={40} />
                </div>
                <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-2">Club not found</h2>
                <p className="text-gray-400 text-sm mb-8">{error || "The club you're looking for doesn't exist or you don't have access."}</p>
                <button
                    onClick={() => navigate('/clubs')}
                    className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-orange/30 active:scale-95 transition-all"
                >
                    Back to Clubs
                </button>
            </div>
        );
    }

    const handleAddRestaurant = async (resId) => {
        const result = await addRestaurantToClub(id, resId);
        if (result.success) {
            setIsAddOpen(false);
            alert('Restaurante añadido al club');
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const onPlaceChanged = async () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;

            setIsLoadingPlace(true);
            const result = await addGooglePlaceToClub(id, place);
            setIsLoadingPlace(false);

            if (result.success) {
                setIsAddOpen(false);
                alert('¡Lugar añadido exitosamente!');
            } else {
                alert(`Error: ${result.error}`);
            }
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const result = await updateClub(id, editForm);
        if (result.success) {
            setIsEditOpen(false);
            alert('¡Club actualizado exitosamente!');
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este club? Esta acción no se puede deshacer.')) {
            const result = await deleteClub(id);
            if (result.success) {
                navigate('/clubs');
            } else {
                alert(`Error: ${result.error}`);
            }
        }
    };

    const handleRemoveRestaurant = async (resId) => {
        if (window.confirm('¿Quitar este restaurante del club?')) {
            const result = await removeRestaurantFromClub(id, resId);
            if (!result.success) alert(`Error: ${result.error}`);
        }
    };

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

                <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent z-20">
                    <button
                        onClick={() => navigate('/clubs')}
                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex gap-3">
                        {isAdmin && (
                            <>
                                <button
                                    onClick={handleDelete}
                                    className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                                >
                                    <Trash2 size={20} />
                                </button>
                                <button
                                    onClick={() => setIsEditOpen(true)}
                                    className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                                >
                                    <Edit3 size={20} />
                                </button>
                            </>
                        )}
                        <button
                            onClick={handleShare}
                            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-transform"
                        >
                            <Share2 size={20} />
                        </button>
                    </div>
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
            <div className="px-5 -mt-2 relative z-10 flex gap-2 justify-between py-4">
                {[
                    { id: 'list', label: 'Restaurants', icon: MapPin },
                    { id: 'members', label: 'Leaderboard', icon: Trophy },
                    { id: 'rules', label: 'Rules', icon: ScrollText }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={clsx(
                            "flex items-center gap-1.5 px-3.5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 flex-1 justify-center",
                            activeTab === tab.id
                                ? "bg-brand-dark text-white border-brand-dark shadow-xl"
                                : "bg-white text-gray-400 border-transparent shadow-sm"
                        )}
                    >
                        <tab.icon size={13} />
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
                                <button
                                    onClick={() => setIsAddOpen(true)}
                                    className="flex items-center gap-2 text-brand-orange text-[10px] font-black uppercase tracking-widest py-2 px-4 bg-brand-orange/5 rounded-full border border-brand-orange/10 active:scale-95 transition-all"
                                >
                                    <Plus size={14} /> Add New
                                </button>
                            </div>

                            {(sortedClubRestaurants || []).length > 0 ? (
                                sortedClubRestaurants.map((res) => (
                                    <RestaurantCard
                                        key={res.id}
                                        restaurant={res}
                                        variant="list"
                                        onDelete={isAdmin ? handleRemoveRestaurant : undefined}
                                    />
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

            {/* Add Restaurant Modal */}
            <AnimatePresence>
                {isAddOpen && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
                            onClick={() => setIsAddOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl max-h-[85vh] flex flex-col"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight italic">Suggest a Spot</h2>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Enhance the club list</p>
                                </div>
                                <button onClick={() => setIsAddOpen(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-400 active:scale-90 transition-transform">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Source Selection Tabs */}
                            <div className="flex gap-2 mb-6 bg-slate-50 p-1.5 rounded-2xl">
                                {[
                                    { id: 'personal', label: 'From My List', icon: MapPin },
                                    { id: 'google', label: 'Find on Google', icon: Search }
                                ].map(source => (
                                    <button
                                        key={source.id}
                                        onClick={() => setAddSource(source.id)}
                                        className={clsx(
                                            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                            addSource === source.id ? "bg-white text-brand-orange shadow-sm" : "text-gray-400 hover:text-gray-500"
                                        )}
                                    >
                                        <source.icon size={12} />
                                        {source.label}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar min-h-[300px]">
                                {addSource === 'personal' ? (
                                    myRestaurants.filter(r => !club.restaurants.some(cr => cr.id === r.id)).length > 0 ? (
                                        myRestaurants
                                            .filter(r => !club.restaurants.some(cr => cr.id === r.id))
                                            .map(res => (
                                                <div key={res.id} className="bg-slate-50 p-4 rounded-[2rem] flex items-center gap-4 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                                                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200">
                                                        {res.image_url && <img src={res.image_url} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-black text-brand-dark text-xs uppercase truncate">{res.name}</h4>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{res.cuisine || 'Restaurant'}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddRestaurant(res.id)}
                                                        className="bg-brand-orange text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-orange/20 active:scale-95 transition-all outline-none"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="py-20 text-center flex flex-col items-center">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4">
                                                <MapPin size={32} />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest max-w-[180px]">No more restaurants from your list to add!</p>
                                        </div>
                                    )
                                ) : (
                                    <div className="space-y-6">
                                        <div className="relative">
                                            {typeof google !== 'undefined' ? (
                                                <Autocomplete
                                                    onLoad={auto => setAutocomplete(auto)}
                                                    onPlaceChanged={onPlaceChanged}
                                                    options={{ types: ['restaurant', 'food', 'cafe'] }}
                                                >
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Search for a place..."
                                                            className="w-full bg-slate-100 border-2 border-transparent p-5 pl-14 rounded-[2rem] text-brand-dark font-black focus:outline-none focus:ring-4 focus:ring-brand-orange/10 focus:bg-white focus:border-brand-orange/20 transition-all placeholder:text-gray-300"
                                                        />
                                                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-orange" />
                                                    </div>
                                                </Autocomplete>
                                            ) : (
                                                <div className="p-10 text-center animate-pulse text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                                    Initializing Google Places...
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-brand-orange/5 border border-brand-orange/10 rounded-[2rem] p-6 text-center">
                                            <p className="text-[10px] font-black text-brand-orange uppercase tracking-widest leading-relaxed">
                                                Search for any restaurant on Google. If it's not in your list yet, we'll add it for you!
                                            </p>
                                        </div>

                                        {isLoadingPlace && (
                                            <div className="flex items-center justify-center gap-3 text-brand-orange">
                                                <div className="w-5 h-5 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Processing...</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Club Modal */}
            <AnimatePresence>
                {isEditOpen && editForm && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
                            onClick={() => setIsEditOpen(false)}
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            className="relative bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight italic">Manage Club</h2>
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Admin Settings</p>
                                </div>
                                <button onClick={() => setIsEditOpen(false)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-gray-400 active:scale-90 transition-transform">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto pr-2 space-y-6 no-scrollbar pb-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Club Name</label>
                                    <input
                                        required
                                        className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-bold text-brand-dark border-2 border-transparent focus:border-brand-orange/20 focus:bg-white focus:outline-none transition-all"
                                        placeholder="Epic Foodies..."
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Vibe/Description</label>
                                    <textarea
                                        className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-bold text-brand-dark border-2 border-transparent focus:border-brand-orange/20 focus:bg-white focus:outline-none transition-all min-h-[100px]"
                                        placeholder="What's this club about?"
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Club Cover Photo</label>
                                    <ImageUploader
                                        currentImage={editForm.image}
                                        onUploadComplete={(url) => setEditForm({ ...editForm, image: url })}
                                        label="Click to upload club photo"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Privacy</label>
                                    <div className="flex gap-2">
                                        {['public', 'private'].map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => setEditForm({ ...editForm, type: t })}
                                                className={clsx(
                                                    "flex-1 py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all",
                                                    editForm.type === t ? "bg-brand-dark text-white shadow-lg" : "bg-slate-50 text-gray-400"
                                                )}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-4">Rules (separated by ;)</label>
                                    <textarea
                                        className="w-full bg-slate-50 p-5 rounded-[1.5rem] font-bold text-brand-dark border-2 border-transparent focus:border-brand-orange/20 focus:bg-white focus:outline-none transition-all min-h-[80px]"
                                        placeholder="Rule 1; Rule 2; ..."
                                        value={editForm.rules}
                                        onChange={(e) => setEditForm({ ...editForm, rules: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 space-y-4">
                                    <button
                                        type="submit"
                                        className="w-full bg-brand-orange text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-brand-orange/20 active:scale-95 transition-all uppercase text-xs tracking-widest"
                                    >
                                        Save Changes
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="w-full bg-red-50 text-red-500 font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-2 active:scale-95 transition-all uppercase text-[10px] tracking-widest"
                                    >
                                        <Trash2 size={16} />
                                        Delete Club (Danger Zone)
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
