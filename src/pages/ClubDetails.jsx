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
    Trash2,
    Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Autocomplete } from '@react-google-maps/api';
import RestaurantCard from '../components/RestaurantCard';
import RecommendationModal from '../components/RecommendationModal';
import clsx from 'clsx';
import ImageUploader from '../components/ImageUploader';

function CommunityRestaurantCard({ restaurant, club, isAdmin, onDelete, onMatizar }) {
    const validateRecommendation = useStore(state => state.validateRecommendation);
    const profile = useStore(state => state.profile);
    const [isUpdating, setIsUpdating] = useState(false);

    const googleScore = restaurant.rating || 0;
    const recommenderScore = restaurant.recommender_rating || 0;
    
    // Calculate consensus from validations
    const validations = restaurant.validations || [];
    let consensusScore = recommenderScore;
    if (validations.length > 0) {
        // simple average
        const sum = validations.reduce((acc, val) => {
            if (val.new_rating) return acc + val.new_rating;
            if (val.validation_type === 'confirm') return acc + recommenderScore; // implicitly agrees
            if (val.validation_type === 'report') return acc + 1; // penalties
            return acc;
        }, 0);
        consensusScore = (sum + recommenderScore) / (validations.length + 1);
    }
    
    // Check if current user has already validated
    const hasValidated = validations.some(v => v.user_id === profile?.id);

    const navigate = useNavigate();

    const handleValidate = async (e, type) => {
        e.stopPropagation();
        if (hasValidated) return alert("You have already validated this place.");
        if (type === 'matizar') {
            onMatizar(restaurant.club_restaurant_id);
            return;
        }
        setIsUpdating(true);
        await validateRecommendation(restaurant.club_restaurant_id, type, {});
        setIsUpdating(false);
    };

    const renderStars = (score) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} size={10} className={i <= Math.round(score) ? "text-yellow-400" : "text-slate-200"} fill="currentColor" />
                ))}
            </div>
        );
    };

    return (
        <div 
            onClick={() => navigate(`/restaurant/${restaurant.id}?club=${club.id}`)}
            className="bg-white rounded-[2rem] border border-brand-green/20 shadow-xl shadow-slate-200/20 overflow-hidden mb-4 relative p-5 cursor-pointer hover:border-brand-green/40 transition-colors"
        >
            {isAdmin && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(restaurant.id); }}
                    className="absolute top-4 right-4 w-8 h-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center active:scale-90 transition-transform z-10"
                >
                    <Trash2 size={14} />
                </button>
            )}
            <div className="flex gap-4 items-start">
                <img 
                    src={restaurant.image_url || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400'} 
                    alt={restaurant.name} 
                    className="w-24 h-24 rounded-[1.5rem] object-cover bg-slate-100 shadow-md"
                />
                <div className="flex-1 min-w-0 pr-8 flex flex-col">
                    <h3 className="font-black text-brand-dark text-lg uppercase tracking-tight leading-none mb-1">{restaurant.name}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate mb-2">
                        {restaurant.cuisine} • {restaurant.zone} {restaurant.average_spend ? `• $${restaurant.average_spend}` : ''}
                    </p>
                    
                    {restaurant.recommender_name && (
                        <div className="flex items-center gap-1.5 mb-2 bg-slate-50 p-1.5 pr-3 rounded-full self-start inline-flex border border-slate-100">
                            {restaurant.recommender_avatar ? (
                                <img src={restaurant.recommender_avatar} className="w-4 h-4 rounded-full object-cover" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-brand-orange text-white flex items-center justify-center text-[8px] font-black">{restaurant.recommender_name.charAt(0)}</div>
                            )}
                            <span className="text-[8px] font-black text-brand-dark uppercase tracking-widest">Added by {restaurant.recommender_name.split(' ')[0]}</span>
                        </div>
                    )}

                    {restaurant.pro_tip && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-1">
                            <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest block mb-0.5">Pro Tip:</span>
                            <p className="text-xs font-medium text-brand-dark italic leading-tight">"{restaurant.pro_tip}"</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between">
                <div className="flex flex-col gap-2 flex-1">
                    <div className="flex justify-between items-center pr-4">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Google Score</span>
                        {renderStars(googleScore)}
                    </div>
                    <div className="flex justify-between items-center pr-4">
                        <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest">Recommender</span>
                        {renderStars(recommenderScore)}
                    </div>
                    <div className="flex justify-between items-center pr-4">
                        <span className="text-[9px] font-black text-brand-green uppercase tracking-widest">Consensus</span>
                        {renderStars(consensusScore)}
                    </div>
                </div>

                <div className="w-[1px] bg-slate-100 mx-2"></div>

                <div className="flex flex-col gap-2 justify-center pl-2 flex-shrink-0 w-32">
                    <button 
                        disabled={isUpdating || hasValidated}
                        onClick={(e) => handleValidate(e, 'confirm')}
                        className={clsx("py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors", hasValidated ? "bg-slate-50 text-gray-300 border-transparent" : "bg-brand-green/10 text-brand-green border-brand-green/20 hover:bg-brand-green hover:text-white")}
                    >Confirm</button>
                    <button 
                        disabled={isUpdating || hasValidated}
                        onClick={(e) => handleValidate(e, 'matizar')}
                        className={clsx("py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors", hasValidated ? "bg-slate-50 text-gray-300 border-transparent" : "bg-slate-50 text-gray-600 border-slate-200 hover:bg-gray-200")}
                    >Adjust</button>
                    <button 
                        disabled={isUpdating || hasValidated}
                        onClick={(e) => handleValidate(e, 'report')}
                        className={clsx("py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-colors", hasValidated ? "bg-slate-50 text-gray-300 border-transparent" : "bg-red-50 text-red-500 border-red-100 hover:bg-red-500 hover:text-white")}
                    >Flag</button>
                </div>
            </div>
        </div>
    );
}

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
    const [searchQuery, setSearchQuery] = useState('');
    const [recModal, setRecModal] = useState({ isOpen: false, mode: 'add', context: null });
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
                    onClick={() => navigate('/social')}
                    className="bg-brand-orange text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-orange/30 active:scale-95 transition-all"
                >
                    Back to Clubs
                </button>
            </div>
        );
    }

    const handleAddRestaurant = async (resId) => {
        if (club?.type === 'public') {
            setRecModal({ isOpen: true, mode: 'add', context: { type: 'existing', resId } });
            return;
        }

        const result = await addRestaurantToClub(id, resId);
        if (result.success) {
            setIsAddOpen(false);
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const onPlaceChanged = async () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            if (!place.geometry) return;

            if (club?.type === 'public') {
                setRecModal({ isOpen: true, mode: 'add', context: { type: 'google', place } });
                return;
            }

            setIsLoadingPlace(true);
            const result = await addGooglePlaceToClub(id, place);
            setIsLoadingPlace(false);
            if (result.success) {
                setSearchQuery('');
                setIsAddOpen(false);
            } else {
                alert(`Error: ${result.error}`);
            }
        }
    };

    const handleModalSubmit = async (details) => {
        const { mode, context } = recModal;
        setRecModal({ isOpen: false, mode: 'add', context: null });
        
        if (mode === 'matizar') {
            await useStore.getState().validateRecommendation(context.club_restaurant_id, 'matizar', { new_rating: details.rating });
            fetchClubDetails(id);
            return;
        }

        if (mode === 'add') {
            let result;
            if (context.type === 'existing') {
                result = await addRestaurantToClub(id, context.resId, {
                    recommender_rating: details.rating,
                    average_spend: details.average_spend,
                    pro_tip: details.pro_tip
                });
            } else if (context.type === 'google') {
                result = await useStore.getState().addGooglePlaceToClub(id, context.place, {
                    recommender_rating: details.rating,
                    average_spend: details.average_spend,
                    pro_tip: details.pro_tip
                });
            }

            if (result?.success) {
                setIsAddOpen(false);
                setSearchQuery('');
            } else {
                alert(`Error: ${result?.error}`);
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
        if (window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
            const result = await deleteClub(id);
            if (result.success) {
                navigate('/social');
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

    const handleShare = async () => {
        const url = `${window.location.origin}/join/${club.id}`; // Simple join link
        const text = `Join my foodie club "${club.name}" on Hello Foodie! 🍔✨\n${url}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: club.name, text, url });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share error:', err);
                }
            }
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
                        onClick={() => navigate('/social')}
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
                                <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">{club.type === 'public' ? 'Community List' : 'Collaborative List'}</h2>
                                <button
                                    onClick={() => setIsAddOpen(true)}
                                    className="flex items-center gap-2 text-brand-orange text-[10px] font-black uppercase tracking-widest py-2 px-4 bg-brand-orange/5 rounded-full border border-brand-orange/10 active:scale-95 transition-all"
                                >
                                    <Plus size={14} /> Add New
                                </button>
                            </div>

                            {(sortedClubRestaurants || []).length > 0 ? (
                                sortedClubRestaurants.map((res) => {
                                    return (
                                        <CommunityRestaurantCard 
                                            key={res.club_restaurant_id} 
                                            restaurant={res} 
                                            club={club} 
                                            isAdmin={isAdmin} 
                                            onDelete={handleRemoveRestaurant}
                                            onMatizar={(club_restaurant_id) => setRecModal({ isOpen: true, mode: 'matizar', context: { club_restaurant_id } })}
                                        />
                                    );
                                })
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

                            <div className="space-y-3">
                                {(club.members || []).map((member, index) => {
                                    const isCurrentUser = member.user_id === profile?.id;
                                    return (
                                        <div key={member.user_id} className={clsx(
                                            "bg-white p-4 rounded-[2.5rem] flex items-center gap-4 transition-all shadow-xl shadow-slate-200/20 border-2",
                                            isCurrentUser ? "border-brand-orange scale-[1.02] shadow-brand-orange/10 z-10 relative" : "border-white"
                                        )}>
                                            <div className={clsx(
                                                "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-inner transition-colors",
                                                index === 0 ? "bg-brand-orange text-white" : "bg-slate-50 text-slate-300"
                                            )}>
                                                {index + 1}
                                            </div>
                                            <div className="w-14 h-14 rounded-[1.5rem] overflow-hidden border-2 border-white shadow-md relative group">
                                                <img
                                                    src={member.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`}
                                                    className="w-full h-full object-cover"
                                                    alt={member.profile?.full_name}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-black text-brand-dark text-[11px] uppercase truncate tracking-tight">
                                                    {member.profile?.full_name || 'Incognito Foodie'}
                                                    {isCurrentUser && <span className="ml-2 text-[8px] text-brand-orange">(You)</span>}
                                                </h4>
                                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                                                    Vibing Member
                                                </p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-sm font-black text-brand-dark leading-none">
                                                    {member.contribution_count || 0}
                                                </p>
                                                <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mt-1">Contribs</p>
                                            </div>
                                        </div>
                                    );
                                })}
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

            {/* Modals */}
            <RecommendationModal 
                isOpen={recModal.isOpen} 
                mode={recModal.mode} 
                onClose={() => setRecModal({ isOpen: false, mode: 'add', context: null })}
                onSubmit={handleModalSubmit}
            />

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
                                    { id: 'personal', label: club?.type === 'public' ? 'My Favorites' : 'From My List', icon: MapPin },
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
                                {addSource === 'personal' ? (() => {
                                    const availableRestaurants = myRestaurants.filter(r => {
                                        if (club?.restaurants?.some(cr => cr.id === r.id)) return false;
                                        if (club?.type === 'public') return r.is_favorite === true || r.is_favorite === 'true';
                                        return true;
                                    });

                                    return availableRestaurants.length > 0 ? (
                                        availableRestaurants.map(res => (
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
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest max-w-[180px]">
                                                {club?.type === 'public' 
                                                    ? "You don't have any favorites available to recommend to this community." 
                                                    : "No more restaurants from your list to add!"}
                                            </p>
                                        </div>
                                    );
                                })() : (
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
