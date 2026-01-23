import { Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Calendar, User, Users, CheckCircle, Edit3, X, Save, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useMemo } from 'react';
import { useStore } from '../lib/store';
import clsx from 'clsx';
import BrandLogo from './BrandLogo';
import { getRestaurantImage, filterRestaurantImages, DEFAULT_RESTAURANT_IMAGE, getDiverseFallbackImage } from '../lib/images';

export default function RestaurantCard({ restaurant, variant = 'list-photos', onDelete }) {
    const navigate = useNavigate();
    const isVisited = restaurant.is_visited;
    const updateRestaurant = useStore(state => state.updateRestaurant);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ cuisine: restaurant.cuisine, price: restaurant.price });

    const handleSave = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await updateRestaurant(restaurant.id, editData);
        setIsEditing(false);
    };

    // Official logo tag
    const BrandTag = () => (
        <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
            <BrandLogo size={12} animate={false} />
        </div>
    );

    const EditButton = () => (
        <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
            className="p-2 bg-slate-50 text-gray-400 rounded-xl hover:text-brand-orange transition-colors"
        >
            <Edit3 size={14} />
        </button>
    );

    const CardCarousel = ({ images, height = "h-64", rounded = "rounded-t-[3.5rem]" }) => {
        const [activeIdx, setActiveIdx] = useState(0);
        const scrollRef = useRef(null);

        const allImages = useMemo(() => {
            return filterRestaurantImages(restaurant.additional_images, restaurant.image_url || restaurant.image);
        }, [restaurant.additional_images, restaurant.image_url, restaurant.image]);

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

        if (allImages.length <= 1) {
            return (
                <div className={clsx("relative overflow-hidden", height, rounded)}>
                    <img
                        src={allImages[0] || DEFAULT_RESTAURANT_IMAGE}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = getDiverseFallbackImage(restaurant.name)}
                    />
                </div>
            );
        }

        return (
            <div className={clsx("relative overflow-hidden group/carousel", height, rounded)}>
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full"
                >
                    {allImages.map((img, idx) => (
                        <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative">
                            <img
                                src={img}
                                alt={`${restaurant.name} ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = getDiverseFallbackImage(`${restaurant.name}-${idx}`);
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Carousel Controls */}
                {allImages.length > 1 && (
                    <>
                        {/* Desktop Arrows */}
                        <div className="absolute inset-y-0 left-0 right-0 hidden md:flex items-center justify-between px-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity pointer-events-none">
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollTo(activeIdx - 1); }}
                                disabled={activeIdx === 0}
                                className="w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/50 transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); scrollTo(activeIdx + 1); }}
                                disabled={activeIdx === allImages.length - 1}
                                className="w-8 h-8 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white pointer-events-auto disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/50 transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 px-4">
                            {allImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); scrollTo(i); }}
                                    className={clsx(
                                        "h-1 rounded-full transition-all duration-300",
                                        i === activeIdx ? "w-4 bg-white" : "w-1 bg-white/40 hover:bg-white/60"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    };

    const SwipeWrapper = ({ children, rounded = "rounded-[2rem]" }) => {
        const [isOpen, setIsOpen] = useState(false);
        if (!onDelete) return children;

        const handleDragEnd = (_, info) => {
            // Threshold for snapping: 60px or high velocity
            const threshold = -60;
            const velocity = info.velocity.x;

            if (info.offset.x < threshold || velocity < -500) {
                setIsOpen(true);
            } else {
                setIsOpen(false);
            }
        };

        return (
            <div className={clsx("relative overflow-hidden", rounded)}>
                {/* Delete Action Background */}
                <div
                    className="absolute inset-0 bg-red-500 flex items-center justify-end px-12 text-white"
                    onClick={(e) => { e.stopPropagation(); onDelete(restaurant.id); }}
                >
                    <div className="flex flex-col items-center gap-1">
                        <Trash2 size={24} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Delete</span>
                    </div>
                </div>

                <motion.div
                    drag="x"
                    dragDirectionLock
                    dragConstraints={{ left: -120, right: 0 }}
                    dragElastic={0.4}
                    animate={{ x: isOpen ? -120 : 0 }}
                    onDragEnd={handleDragEnd}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="relative z-10"
                >
                    {children}
                </motion.div>
            </div>
        );
    };

    if (variant === 'list') {
        return (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <SwipeWrapper>
                    <div
                        onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                        className="flex items-center gap-4 bg-white p-4 border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden active:scale-98 cursor-pointer"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                            <img
                                src={getRestaurantImage(restaurant.image_url || restaurant.image)}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                                onError={(e) => e.target.src = getDiverseFallbackImage(restaurant.name)}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-brand-dark text-sm truncate uppercase tracking-tight">{restaurant.name}</h3>
                                {isVisited && <BrandTag />}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                {restaurant.zone || 'No Zone'} • {restaurant.cuisine}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 px-2">
                            <div className="flex items-center gap-1.5 text-brand-orange bg-brand-orange/5 px-2.5 py-1 rounded-full">
                                <Star size={10} fill="currentColor" />
                                <span className="text-[11px] font-black tabular-nums">{restaurant.rating || '---'}</span>
                            </div>
                            <EditButton />
                        </div>
                    </div>
                </SwipeWrapper>
                <QuickEditModal isVisible={isEditing} onClose={() => setIsEditing(false)} data={editData} setData={setEditData} onSave={handleSave} />
            </motion.div>
        );
    }

    if (variant === 'gallery') {
        return (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group active:scale-95 transition-transform">
                <Link
                    to={`/restaurant/${restaurant.id}`}
                    className="block aspect-square rounded-[2.5rem] overflow-hidden shadow-lg border-2 border-white relative group"
                >
                    <CardCarousel height="h-full" rounded="rounded-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/20 to-transparent flex flex-col justify-end p-5 pointer-events-none">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-white text-xs leading-tight drop-shadow-md uppercase tracking-tight">{restaurant.name}</h3>
                            {isVisited && <BrandLogo size={12} animate={false} />}
                        </div>
                        <p className="text-[8px] text-brand-orange-light font-black uppercase tracking-[0.2em]">{restaurant.cuisine}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center shadow-lg pointer-events-none">
                        <Star size={10} className="text-brand-orange fill-brand-orange mr-1" />
                        <span className="text-[10px] font-black text-brand-dark">{restaurant.rating || '---'}</span>
                    </div>
                </Link>
            </motion.div>
        );
    }

    // default: list-photos
    const content = (
        <div
            onClick={() => navigate(`/restaurant/${restaurant.id}`)}
            className="block bg-white border border-gray-50 transition-all hover:shadow-2xl relative cursor-pointer"
        >
            <div className="relative group">
                <CardCarousel />
                <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-[1.5rem] flex items-center shadow-2xl border border-white/50 pointer-events-none">
                    <Star size={18} className="text-brand-orange fill-brand-orange mr-2" />
                    <span className="text-base font-black text-brand-dark tabular-nums">{restaurant.rating || '---'}</span>
                </div>
                <div className="absolute bottom-6 left-6 bg-brand-dark/40 backdrop-blur-md text-white px-5 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl border border-white/10 flex items-center gap-3 pointer-events-none">
                    {restaurant.cuisine}
                    {restaurant.meal_type && (
                        <span className="bg-brand-orange text-white px-2 py-0.5 rounded-lg text-[8px]">{restaurant.meal_type}</span>
                    )}
                </div>
            </div>

            <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-black text-brand-dark leading-tight uppercase tracking-tighter">{restaurant.name}</h3>
                            {isVisited && (
                                <div className="bg-brand-orange/10 p-1.5 rounded-xl border border-brand-orange/5">
                                    <BrandLogo size={18} animate={false} />
                                </div>
                            )}
                        </div>
                        <div className="flex items-center text-gray-400 text-[10px] gap-4 font-black uppercase tracking-widest">
                            <span className="flex items-center gap-2"><MapPin size={14} className="text-brand-orange" /> {restaurant.zone || 'Explore City'}</span>
                            <span className="flex items-center gap-2 h-1.5 w-1.5 bg-brand-orange/20 rounded-full"></span>
                            <span className="flex items-center gap-2"><Calendar size={14} /> {new Date(restaurant.date_added).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className="text-xl font-black text-brand-orange drop-shadow-sm">{restaurant.price}</span>
                        <EditButton />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 font-black uppercase tracking-[0.25em]">
                        <div className="w-8 h-8 bg-brand-orange/5 rounded-2xl flex items-center justify-center text-brand-orange">
                            <User size={14} />
                        </div>
                        <span>Rec by: <span className="text-brand-dark">{restaurant.recommended_by || 'Me'}</span></span>
                    </div>
                    {restaurant.club_name && (
                        <div className="flex bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2 flex items-center gap-3 text-[10px] text-brand-dark font-black uppercase tracking-widest">
                            <Users size={14} className="text-brand-orange" />
                            <span>{restaurant.club_name}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }}>
            {variant === 'list' ? (
                <SwipeWrapper rounded="rounded-[3.5rem]">
                    {content}
                </SwipeWrapper>
            ) : content}
            <QuickEditModal isVisible={isEditing} onClose={() => setIsEditing(false)} data={editData} setData={setEditData} onSave={handleSave} />
        </motion.div>
    );
}

function QuickEditModal({ isVisible, onClose, data, setData, onSave }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-brand-dark uppercase tracking-tight">Quick Edit</h3>
                            <button onClick={onClose} className="p-2 text-gray-300"><X size={20} /></button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-3">Cuisine / Type</label>
                                <input
                                    className="w-full bg-slate-50 p-4 rounded-xl font-bold text-brand-dark border-2 border-slate-100 focus:border-brand-orange/20 focus:outline-none transition-all"
                                    value={data.cuisine}
                                    onChange={(e) => setData({ ...data, cuisine: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-3">Price Level</label>
                                <div className="flex gap-2">
                                    {['$', '$$', '$$$', '$$$$'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setData({ ...data, price: p })}
                                            className={clsx(
                                                "flex-1 py-3 rounded-xl font-black transition-all",
                                                data.price === p ? "bg-brand-orange text-white shadow-lg" : "bg-slate-50 text-gray-400"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={onSave}
                                className="w-full bg-brand-dark text-white font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all"
                            >
                                <Save size={18} />
                                Update Place
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
