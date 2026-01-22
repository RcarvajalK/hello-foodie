import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Star, Clock, MapPin, Globe, Phone, Share2, Heart, CheckCircle, Trash2, Edit3, Save, X } from 'lucide-react';
import { useStore } from '../lib/store';
import { getRestaurantImage, filterRestaurantImages, DEFAULT_RESTAURANT_IMAGE } from '../lib/images';
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
        price: restaurant?.price,
        meal_type: restaurant?.meal_type?.split(', ') || []
    });

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

    const handleShare = () => {
        const text = `Hey! Let's go to ${restaurant.name}! It's a ${restaurant.cuisine} place in ${restaurant.zone}. Check it out on Hello Foodie!`;
        if (navigator.share) {
            navigator.share({
                title: 'Hungry?',
                text: text,
                url: window.location.href,
            });
        } else {
            alert('Sharing not supported on this browser, but here is the text: ' + text);
        }
    };

    return (
        <div className="bg-white min-h-screen pb-16">
            <div className="relative h-48 bg-slate-100 sm:h-64">
                <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full relative">
                    {(() => {
                        const allImages = filterRestaurantImages(restaurant.additional_images, restaurant.image_url || restaurant.image);

                        return allImages.map((img, idx) => (
                            <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                                <img
                                    src={img}
                                    alt={`${restaurant.name} ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => e.target.src = DEFAULT_RESTAURANT_IMAGE}
                                />
                                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-1.5 px-6">
                                    {allImages.map((_, i) => (
                                        <div key={i} className={clsx("h-1 rounded-full transition-all", i === idx ? "w-4 bg-white" : "w-1 bg-white/40")} />
                                    ))}
                                </div>
                            </div>
                        ));
                    })()}
                </div>
                <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleShare} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                            <Share2 size={20} />
                        </button>
                        <button onClick={handleDelete} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                            <Trash2 size={20} />
                        </button>
                        <button onClick={() => setIsEditing(true)} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
                            <Edit3 size={20} />
                        </button>
                        <button
                            onClick={() => toggleFavorite(restaurant.id, restaurant.is_favorite)}
                            className={clsx(
                                "w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-all",
                                restaurant.is_favorite ? "bg-red-500 text-white" : "bg-white/20 text-white"
                            )}
                        >
                            <Heart size={20} fill={restaurant.is_favorite ? "currentColor" : "none"} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-5 py-5 -mt-8 bg-white rounded-t-[3rem] relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start mb-1">
                    <h1 className="text-xl font-black text-brand-dark uppercase tracking-tight line-clamp-1">{restaurant.name}</h1>
                    <span className="text-base font-black text-brand-orange">{restaurant.price}</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <Star className="text-yellow-400 fill-yellow-400" size={16} />
                    <span className="font-black text-brand-dark text-xs">{restaurant.rating || '---'}</span>
                    <span className="w-0.5 h-0.5 bg-gray-300 rounded-full mx-0.5"></span>
                    <span className="text-brand-green font-bold text-[9px] uppercase">{restaurant.cuisine}</span>
                    {restaurant.meal_type && (
                        <span className="ml-auto bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tight">{restaurant.meal_type}</span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex-1 min-w-[120px] flex items-center gap-2.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                        <MapPin className="text-brand-orange flex-shrink-0" size={14} />
                        <div className="min-w-0">
                            <p className="font-black text-brand-dark text-[7px] uppercase tracking-wider">Location</p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address || restaurant.name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-gray-500 font-bold truncate block"
                            >
                                {restaurant.zone || 'Open Map'}
                            </a>
                        </div>
                    </div>

                    <div className="flex-1 min-w-[120px] flex items-center gap-2.5 p-2 bg-slate-50/50 rounded-xl border border-slate-100">
                        <Clock className="text-brand-green flex-shrink-0" size={14} />
                        <div className="min-w-0">
                            <p className="font-black text-brand-dark text-[7px] uppercase tracking-wider">Hours</p>
                            <p className="text-[10px] text-gray-500 font-bold truncate">
                                {restaurant.opening_hours?.length > 0 ? 'See List' : `Added ${new Date(restaurant.date_added).getMonth() + 1}/${new Date(restaurant.date_added).getFullYear()}`}
                            </p>
                        </div>
                    </div>

                    {restaurant.phone && (
                        <a href={`tel:${restaurant.phone}`} className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-xl border border-blue-100 text-blue-500">
                            <Phone size={14} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Call</span>
                        </a>
                    )}

                    {restaurant.website && (
                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-purple-50/50 rounded-xl border border-purple-100 text-purple-500">
                            <Globe size={14} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Web</span>
                        </a>
                    )}
                </div>

                {restaurant.notes && (
                    <div className="mb-6">
                        <h3 className="font-black text-base mb-2 tracking-tight">Notes</h3>
                        <div className="bg-slate-50 p-4 rounded-[1.2rem] border border-slate-100 text-[13px] text-gray-600 font-medium italic">
                            "{restaurant.notes}"
                        </div>
                    </div>
                )}

                <div className="mb-4">
                    <div className="bg-slate-50/50 p-3 rounded-2xl text-[10px] text-gray-600 font-bold border border-slate-100 flex flex-col gap-1">
                        <p><span className="text-brand-dark font-black uppercase text-[8px] tracking-widest block">Recommended By</span> {restaurant.recommended_by || 'Me'}</p>
                        {restaurant.club_name && <p><span className="text-brand-dark font-black uppercase text-[8px] tracking-widest block">Club</span> {restaurant.club_name}</p>}
                    </div>
                </div>

                {(restaurant.review_comment || showComparison) && (
                    <div className="mb-6 bg-brand-green/5 p-5 rounded-[1.5rem] border border-brand-green/10">
                        <h3 className="font-black text-xs text-brand-green uppercase tracking-widest mb-2 flex items-center gap-2">
                            <CheckCircle size={14} /> {showComparison ? 'Comparison' : 'My Review'}
                        </h3>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-3 bg-white rounded-xl">
                                <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Original (Places)</p>
                                <div className="flex items-center gap-1 mb-1">
                                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs font-black">{restaurant.rating || '---'}</span>
                                </div>
                                <span className="text-xs font-black text-brand-orange">{restaurant.price}</span>
                            </div>
                            <div className="p-3 bg-brand-green/10 rounded-xl border border-brand-green/10">
                                <p className="text-[8px] font-black text-brand-green uppercase mb-1">Your Rating</p>
                                <div className="flex items-center gap-1 mb-1">
                                    <Star size={10} className="text-brand-green fill-brand-green" />
                                    <span className="text-xs font-black">{review.rating}</span>
                                </div>
                                <span className="text-xs font-black text-brand-green">{review.personal_price || restaurant.price}</span>
                            </div>
                        </div>

                        {restaurant.review_comment && (
                            <p className="text-sm text-brand-dark font-medium leading-relaxed italic">"{restaurant.review_comment}"</p>
                        )}

                        {showComparison && (
                            <button
                                onClick={() => navigate('/visited')}
                                className="mt-4 w-full bg-brand-green text-white font-black py-3 rounded-xl text-[10px] uppercase tracking-widest"
                            >
                                Go to Visited List
                            </button>
                        )}
                    </div>
                )}

                <button
                    onClick={handleToggleVisited}
                    className={clsx(
                        "w-full font-black py-4 rounded-[1.5rem] shadow-xl transition-all flex items-center justify-center gap-2",
                        restaurant.is_visited
                            ? "bg-brand-green text-white shadow-brand-green/30"
                            : "bg-brand-orange text-white shadow-brand-orange/30 active:scale-[0.98]"
                    )}
                >
                    {restaurant.is_visited ? (
                        <>
                            <CheckCircle size={24} />
                            Visited!
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
