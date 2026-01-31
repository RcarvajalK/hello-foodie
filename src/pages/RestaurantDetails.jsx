import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Star, Clock, MapPin, Heart, Share2, Trash2, Edit3,
    MessageCircle, ChevronLeft, ChevronRight, Globe, Phone, CheckCircle, Save, X, Sparkles
} from 'lucide-react';
import { useStore } from '../lib/store';
import { getRestaurantImage, filterRestaurantImages, DEFAULT_RESTAURANT_IMAGE, isBrokenImage } from '../lib/images';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const MILESTONES = [
    { count: 1, name: 'First Bite', icon: '🍴', rank: 'Newcomer' },
    { count: 5, name: 'Foodie Explorer', icon: '🔍', rank: 'Apprentice' },
    { count: 10, name: 'Gourmet Adventurer', icon: '🍷', rank: 'Expert' },
    { count: 25, name: 'Culinary Legend', icon: '🏆', rank: 'Master' },
    { count: 50, name: 'Master Chef\'s Muse', icon: '👨‍🍳', rank: 'Guru' },
    { count: 100, name: 'Immortal Epicurean', icon: '✨', rank: 'Legend' }
];

export default function RestaurantDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const restaurants = useStore(state => state.restaurants);
    const toggleVisited = useStore(state => state.toggleVisited);
    const toggleFavorite = useStore(state => state.toggleFavorite);
    const deleteRestaurant = useStore(state => state.deleteRestaurant);
    const updateRestaurant = useStore(state => state.updateRestaurant);
    const refreshRestaurantImages = useStore(state => state.refreshRestaurantImages);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [levelUpData, setLevelUpData] = useState(null);

    const restaurant = restaurants.find(r => r.id === id);

    const [review, setReview] = useState({
        rating: 5,
        comment: '',
        personal_price: restaurant?.price || '$$'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        name: restaurant?.name,
        cuisine: restaurant?.cuisine,
        zone: restaurant?.zone,
        price: restaurant?.price || '$$',
        meal_type: restaurant?.meal_type?.split(', ') || []
    });

    const [livePhotos, setLivePhotos] = useState([]);

    // Unified photo refresh logic (Centralized in store)
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Proactive healing on mount
    useEffect(() => {
        const imageUrl = restaurant?.image_url || restaurant?.image;
        if (imageUrl && isBrokenImage(imageUrl) && !isRefreshing && restaurant?.id) {
            setIsRefreshing(true);
            console.log(`[Proactive-Heal-Details] Triggered for: ${restaurant.name}`);
            refreshRestaurantImages(restaurant.id, restaurant.google_place_id);
        }
    }, [restaurant?.id]);
    const handleSaveEdit = async () => {
        const payload = {
            ...editData,
            meal_type: editData.meal_type.join(', ')
        };
        const result = await updateRestaurant(restaurant.id, payload);
        if (result?.success) {
            setIsEditing(false);
        } else {
            alert(`Error updating: ${result?.error || 'Unknown error'}`);
        }
    };

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="text-center">
                    <h2 className="text-xl font-black text-brand-dark mb-4 uppercase">Restaurant Not Found</h2>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-brand-orange text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-orange/20"
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    const handleToggleVisited = async () => {
        if (!restaurant.is_visited) {
            setShowReviewModal(true);
        } else {
            const result = await toggleVisited(restaurant.id, restaurant.is_visited);
            if (!result.success) alert(`Failed to update status: ${result.error}`);
        }
    };

    const submitReview = async () => {
        const result = await toggleVisited(restaurant.id, false, review);
        if (result.success) {
            setShowReviewModal(false);

            // Celebration Logic
            const visitedCount = restaurants.filter(r => r.is_visited).length + 1; // +1 because we just visited this one
            const milestone = MILESTONES.find(m => m.count === visitedCount);

            if (milestone) {
                setLevelUpData(milestone);
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FF6B00', '#2B3A4F', '#4ECDC4']
                });
            } else {
                setShowComparison(true);
            }
        } else {
            alert(`Error: ${result.error}`);
        }
    };

    const handleDelete = () => {
        if (window.confirm('Delete this restaurant from your list?')) {
            deleteRestaurant(restaurant.id);
            navigate('/');
        }
    };

    const handleShare = async () => {
        const text = `Hey! Let's go to ${restaurant.name}! It's a ${restaurant.cuisine} place in ${restaurant.zone}. Check it out on Hello Foodie!`;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Hungry?',
                    text: text,
                    url: window.location.href,
                });
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('Share error:', err);
                }
            }
        } else {
            alert('Sharing not supported on this browser, but here is the text: ' + text);
        }
    };

    const [activeIdx, setActiveIdx] = useState(0);
    const scrollRef = useRef(null);

    const allImages = useMemo(() => {
        if (!restaurant) return [];
        return filterRestaurantImages(restaurant.additional_images, restaurant.image_url || restaurant.image);
    }, [restaurant]);



    const handleScroll = (e) => {
        const scrollLeft = e.target.scrollLeft;
        const width = e.target.clientWidth;
        if (width > 0) {
            const newIdx = Math.round(scrollLeft / width);
            if (newIdx !== activeIdx) {
                setActiveIdx(newIdx);
            }
        }
    };

    const scrollTo = (index) => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: index * scrollRef.current.clientWidth,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-16">
            <div className="relative h-[45vh] bg-slate-200 group overflow-hidden">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full relative"
                >
                    {allImages.length > 0 ? (
                        allImages.map((img, idx) => (
                            <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                                <img
                                    src={img}
                                    alt={`${restaurant.name} ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        if (!isRefreshing) {
                                            setIsRefreshing(true);
                                            refreshRestaurantImages(restaurant.id, restaurant.google_place_id);
                                        } else {
                                            e.target.src = DEFAULT_RESTAURANT_IMAGE;
                                        }
                                    }}
                                />
                            </div>
                        ))
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                            <img src={DEFAULT_RESTAURANT_IMAGE} className="w-full h-full object-cover opacity-50" />
                        </div>
                    )}
                </div>

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/30 pointer-events-none" />

                {/* Carousel Controls */}
                {allImages.length > 1 && (
                    <>
                        {/* Navigation Arrows (Desktop) */}
                        <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <button
                                onClick={() => scrollTo(activeIdx - 1)}
                                disabled={activeIdx === 0}
                                className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/50 transition-all"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => scrollTo(activeIdx + 1)}
                                disabled={activeIdx === allImages.length - 1}
                                className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/50 transition-all"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5 px-6">
                            {allImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollTo(i)}
                                    className={clsx(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        i === activeIdx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Top Actions */}
                <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start transition-all">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white shadow-lg border border-white/10"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <button
                        onClick={() => { setIsRefreshing(true); refreshRestaurantImages(restaurant.id, restaurant.google_place_id); }}
                        className="w-10 h-10 bg-black/20 backdrop-blur-xl rounded-full flex items-center justify-center text-brand-orange shadow-lg border border-white/10 active:scale-95 transition-all"
                    >
                        <Sparkles size={18} />
                    </button>
                </div>
            </div>

            <div className="px-5 pb-10 -mt-12 bg-slate-50 rounded-t-[3rem] relative z-10">
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/50 mb-6">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 mr-4">
                            <h1 className="text-2xl font-black text-brand-dark uppercase tracking-tight leading-tight">{restaurant.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                                <span className="font-black text-brand-dark text-sm">{restaurant.rating || '---'}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span className="text-brand-green font-bold text-[10px] uppercase tracking-wider">{restaurant.cuisine}</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-xl font-black text-brand-orange">{restaurant.price}</span>
                            {restaurant.meal_type && (
                                <span className="bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight mt-1">{restaurant.meal_type}</span>
                            )}
                        </div>
                    </div>

                    {/* Quick Tools Header */}
                    <div className="flex justify-between items-center py-4 mt-4 border-t border-slate-50">
                        <div className="flex gap-2">
                            <button onClick={handleShare} className="w-11 h-11 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-brand-orange/5 hover:text-brand-orange transition-all">
                                <Share2 size={20} />
                            </button>
                            <button onClick={handleDelete} className="w-11 h-11 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">
                                <Trash2 size={20} />
                            </button>
                            <button onClick={() => setIsEditing(true)} className="w-11 h-11 bg-slate-50 text-slate-500 rounded-2xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all">
                                <Edit3 size={20} />
                            </button>
                        </div>
                        <button
                            onClick={() => toggleFavorite(restaurant.id, restaurant.is_favorite)}
                            className={clsx(
                                "h-11 px-6 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                restaurant.is_favorite ? "bg-red-500 text-white shadow-lg shadow-red-200" : "bg-slate-50 text-red-500"
                            )}
                        >
                            <Heart size={18} fill={restaurant.is_favorite ? "currentColor" : "none"} />
                            {restaurant.is_favorite ? "Saved" : "Save"}
                        </button>
                    </div>
                </div>

                {/* Contact & Info Grid */}
                <div className="grid grid-cols-1 gap-4 mb-6">
                    {/* Location Card */}
                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4">
                        <div className="w-12 h-12 bg-brand-orange/10 rounded-2xl flex items-center justify-center text-brand-orange flex-shrink-0">
                            <MapPin size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Address</p>
                            <p className="text-sm font-bold text-brand-dark leading-snug mb-2">{restaurant.address || restaurant.zone || 'No address provided'}</p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address || `${restaurant.name} ${restaurant.zone || ''}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-brand-orange hover:gap-3 transition-all gap-2"
                            >
                                Open in Maps <ChevronRight size={12} />
                            </a>
                        </div>
                    </div>

                    {/* Contact Info Card */}
                    {(restaurant.phone || restaurant.website) && (
                        <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4">
                            {restaurant.phone && (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green flex-shrink-0">
                                        <Phone size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Phone</p>
                                        <a href={`tel:${restaurant.phone}`} className="text-sm font-black text-brand-dark">{restaurant.phone}</a>
                                    </div>
                                    <a href={`tel:${restaurant.phone}`} className="bg-brand-green text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Call</a>
                                </div>
                            )}

                            {restaurant.website && (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 flex-shrink-0">
                                        <Globe size={20} />
                                    </div>
                                    <div className="flex-1 truncate">
                                        <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Website</p>
                                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="text-sm font-black text-brand-dark truncate block">{restaurant.website.replace(/^https?:\/\//, '')}</a>
                                    </div>
                                    <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">Visit</a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Opening Hours */}
                    <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-start gap-4">
                        <div className="w-12 h-12 bg-brand-dark/5 rounded-2xl flex items-center justify-center text-brand-dark flex-shrink-0">
                            <Clock size={24} />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Schedule</p>
                            {restaurant.opening_hours?.length > 0 ? (
                                <div className="space-y-1">
                                    {restaurant.opening_hours.map((day, i) => (
                                        <p key={i} className="text-[11px] font-bold text-brand-dark flex justify-between">
                                            {day.split(': ')[0]} <span className="text-gray-400 font-medium">{day.split(': ')[1]}</span>
                                        </p>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm font-bold text-brand-dark">Added {new Date(restaurant.date_added).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            )}
                        </div>
                    </div>
                </div>

                {restaurant.notes && (
                    <div className="mb-8 p-6 bg-white rounded-[2.5rem] shadow-sm border border-slate-100">
                        <h3 className="font-black text-brand-dark uppercase text-[10px] tracking-[0.3em] mb-4">My Notes</h3>
                        <div className="text-sm text-gray-600 font-medium leading-relaxed italic border-l-4 border-brand-orange pl-4 py-1">
                            "{restaurant.notes}"
                        </div>
                    </div>
                ) || (
                        <div className="mb-8 p-5 bg-slate-100/50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No notes added yet</p>
                            <button onClick={() => setIsEditing(true)} className="mt-2 text-[10px] font-black text-brand-orange uppercase">Add Note</button>
                        </div>
                    )}

                <div className="mb-8 flex items-center justify-between px-2">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Recommended By</span>
                        <span className="text-sm font-black text-brand-dark">{restaurant.recommended_by || 'Me'}</span>
                    </div>
                    {restaurant.club_name && (
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Club</span>
                            <span className="bg-brand-dark text-white px-3 py-1 rounded-full text-[10px] font-black">{restaurant.club_name}</span>
                        </div>
                    )}
                </div>

                {(restaurant.review_comment || showComparison) && (
                    <div className="mb-8 bg-brand-green/10 p-6 rounded-[2.5rem] border border-brand-green/20">
                        <h3 className="font-black text-[10px] text-brand-green uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <CheckCircle size={16} /> {showComparison ? 'Comparison' : 'Visited Review'}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-white/50 rounded-2xl backdrop-blur-sm">
                                <p className="text-[8px] font-black text-gray-400 uppercase mb-2">Original Data</p>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-base font-black text-brand-dark">{restaurant.rating || '---'}</span>
                                </div>
                                <span className="text-sm font-black text-brand-orange">{restaurant.price}</span>
                            </div>
                            <div className="p-4 bg-brand-green/20 rounded-2xl border border-brand-green/20">
                                <p className="text-[8px] font-black text-brand-green uppercase mb-2">Your Rating</p>
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Star size={12} className="text-brand-green fill-brand-green" />
                                    <span className="text-base font-black text-brand-green">{review.rating}</span>
                                </div>
                                <span className="text-sm font-black text-brand-green">{review.personal_price || restaurant.price}</span>
                            </div>
                        </div>

                        {restaurant.review_comment && (
                            <div className="p-4 bg-white/40 rounded-2xl border border-white/60">
                                <p className="text-sm text-brand-dark font-medium leading-relaxed italic">"{restaurant.review_comment}"</p>
                            </div>
                        )}

                        {showComparison && (
                            <button
                                onClick={() => navigate('/visited')}
                                className="mt-6 w-full bg-brand-green text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-brand-green/20"
                            >
                                View in Visited History
                            </button>
                        )}
                    </div>
                )}

                <button
                    onClick={handleToggleVisited}
                    className={clsx(
                        "w-full font-black py-5 rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] text-sm uppercase tracking-widest",
                        restaurant.is_visited
                            ? "bg-brand-green text-white shadow-brand-green/30"
                            : "bg-brand-orange text-white shadow-brand-orange/40"
                    )}
                >
                    {restaurant.is_visited ? (
                        <>
                            <CheckCircle size={24} />
                            Already Visited
                        </>
                    ) : (
                        "Mark as Visited"
                    )}
                </button>
            </div>


            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-12 sm:items-center sm:p-0">
                    <div className="fixed inset-0 bg-brand-dark/60 backdrop-blur-sm transition-opacity" onClick={() => setShowReviewModal(false)}></div>
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        className="relative bg-white rounded-[3rem] p-8 w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-2 bg-brand-orange"></div>
                        <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-2">How was it?</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 text-center sm:text-left">Rate your experience</p>

                        <div className="flex justify-center gap-2 mb-10">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button key={s} onClick={() => setReview({ ...review, rating: s })}>
                                    <Star size={40} className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} />
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 block">Price Spent</label>
                                <div className="flex gap-2">
                                    {['$', '$$', '$$$', '$$$$'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setReview({ ...review, personal_price: p })}
                                            className={clsx(
                                                "flex-1 py-3 rounded-xl font-black transition-all",
                                                review.personal_price === p ? "bg-brand-orange text-white shadow-lg" : "bg-slate-50 text-gray-400"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-4 block">Comments (Optional)</label>
                                <textarea
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[2rem] text-brand-dark font-bold focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all resize-none min-h-[120px]"
                                    placeholder="What did you love? Any tips?"
                                    value={review.comment}
                                    onChange={(e) => setReview({ ...review, comment: e.target.value })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={submitReview}
                            className="w-full bg-brand-orange text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-brand-orange/20 active:scale-95 transition-all"
                        >
                            Confirm Visit & Save Review
                        </button>
                    </motion.div>
                </div>
            )}

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={() => setIsEditing(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-brand-dark uppercase tracking-tight text-lg">Edit Place</h3>
                                <button onClick={() => setIsEditing(false)} className="p-2 text-gray-300"><X size={20} /></button>
                            </div>

                            <div className="space-y-5 max-h-[70vh] overflow-y-auto no-scrollbar px-1">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-3">Name</label>
                                    <input
                                        className="w-full bg-slate-50 p-4 rounded-xl font-bold text-brand-dark border-2 border-slate-100 focus:border-brand-orange/20 focus:outline-none transition-all text-sm"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-3">Cuisine</label>
                                    <input
                                        className="w-full bg-slate-50 p-4 rounded-xl font-bold text-brand-dark border-2 border-slate-100 focus:border-brand-orange/20 focus:outline-none transition-all text-sm"
                                        value={editData.cuisine}
                                        onChange={(e) => setEditData({ ...editData, cuisine: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-3">Zone</label>
                                    <input
                                        className="w-full bg-slate-50 p-4 rounded-xl font-bold text-brand-dark border-2 border-slate-100 focus:border-brand-orange/20 focus:outline-none transition-all text-sm"
                                        value={editData.zone}
                                        onChange={(e) => setEditData({ ...editData, zone: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-3">Price Level</label>
                                    <div className="flex gap-2">
                                        {['$', '$$', '$$$', '$$$$'].map(p => (
                                            <button
                                                key={p}
                                                onClick={() => setEditData({ ...editData, price: p })}
                                                className={clsx(
                                                    "flex-1 py-3 rounded-xl font-black text-[10px] transition-all",
                                                    editData.price === p ? "bg-brand-orange text-white shadow-lg" : "bg-slate-50 text-gray-400"
                                                )}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-3">Meal Types</label>
                                    <div className="flex gap-2">
                                        {['Breakfast', 'Lunch', 'Dinner'].map(meal => {
                                            const isActive = editData.meal_type.includes(meal);
                                            return (
                                                <button
                                                    key={meal}
                                                    onClick={() => {
                                                        const newMeals = isActive
                                                            ? editData.meal_type.filter(m => m !== meal)
                                                            : [...editData.meal_type, meal];
                                                        setEditData({ ...editData, meal_type: newMeals });
                                                    }}
                                                    className={clsx(
                                                        "flex-1 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all",
                                                        isActive ? "bg-brand-orange text-white" : "bg-slate-50 text-gray-400"
                                                    )}
                                                >
                                                    {meal}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={handleSaveEdit}
                                    className="w-full bg-brand-dark text-white font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all mt-4"
                                >
                                    <Save size={18} />
                                    Update Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Level Up / Celebration Modal */}
            <AnimatePresence>
                {levelUpData && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-brand-dark/95 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.5, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.5, y: 50, opacity: 0 }}
                            className="relative bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-[0_30px_100px_rgba(255,107,0,0.3)] text-center overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-brand-orange via-brand-yellow to-brand-orange animate-pulse" />

                            <div className="text-7xl mb-8 animate-bounce">{levelUpData.icon}</div>

                            <h2 className="text-4xl font-black text-brand-dark uppercase tracking-tighter mb-2 leading-none">
                                Level Up!
                            </h2>
                            <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.4em] mb-8">
                                {levelUpData.rank} Status Achieved
                            </p>

                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">New Title</p>
                                <p className="text-xl font-black text-brand-dark uppercase tracking-tight">{levelUpData.name}</p>
                            </div>

                            <p className="text-sm text-gray-400 font-medium mb-10 leading-relaxed px-2">
                                You just reached <b>{levelUpData.count}</b> visited restaurants on Hello Foodie! Way to go!
                            </p>

                            <button
                                onClick={handleShare}
                                className="w-full bg-brand-orange text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-brand-orange/30 flex items-center justify-center gap-3 active:scale-95 transition-all text-sm uppercase tracking-widest mb-4"
                            >
                                <Share2 size={18} />
                                Share Success
                            </button>

                            <button
                                onClick={() => { setLevelUpData(null); setShowComparison(true); }}
                                className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-brand-dark transition-colors"
                            >
                                Continue to Review
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
