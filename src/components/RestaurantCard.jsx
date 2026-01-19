import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, User, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import BrandLogo from './BrandLogo';

export default function RestaurantCard({ restaurant, variant = 'list-photos' }) {
    const isVisited = restaurant.is_visited;

    // Official logo tag
    const BrandTag = () => (
        <div className="bg-white p-1 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
            <BrandLogo size={12} animate={false} />
        </div>
    );

    if (variant === 'list') {
        return (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Link
                    to={`/restaurant/${restaurant.id}`}
                    className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all relative overflow-hidden active:scale-98"
                >
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100">
                        <img src={restaurant.image_url || restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-brand-dark text-sm truncate uppercase tracking-tight">{restaurant.name}</h3>
                            {isVisited && <BrandTag />}
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{restaurant.zone || 'No Zone'} • {restaurant.cuisine}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 px-2">
                        <div className="flex items-center gap-1.5 text-brand-orange bg-brand-orange/5 px-2.5 py-1 rounded-full">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[11px] font-black tabular-nums">{restaurant.rating || '---'}</span>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    if (variant === 'gallery') {
        return (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group active:scale-95 transition-transform">
                <Link
                    to={`/restaurant/${restaurant.id}`}
                    className="block aspect-square rounded-[2.5rem] overflow-hidden shadow-lg border-2 border-white"
                >
                    <img src={restaurant.image_url || restaurant.image} alt={restaurant.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/20 to-transparent flex flex-col justify-end p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-white text-xs leading-tight drop-shadow-md uppercase tracking-tight">{restaurant.name}</h3>
                            {isVisited && <BrandLogo size={12} animate={false} />}
                        </div>
                        <p className="text-[8px] text-brand-orange-light font-black uppercase tracking-[0.2em]">{restaurant.cuisine}</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center shadow-lg">
                        <Star size={10} className="text-brand-orange fill-brand-orange mr-1" />
                        <span className="text-[10px] font-black text-brand-dark">{restaurant.rating || '---'}</span>
                    </div>
                </Link>
            </motion.div>
        );
    }

    // default: list-photos
    return (
        <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileTap={{ scale: 0.98 }}>
            <Link
                to={`/restaurant/${restaurant.id}`}
                className="block bg-white rounded-[3.5rem] overflow-hidden shadow-xl shadow-slate-200/40 border border-gray-50 transition-all hover:shadow-2xl relative"
            >
                <div className="relative h-64">
                    <img src={restaurant.image_url || restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-[1.5rem] flex items-center shadow-2xl border border-white/50">
                        <Star size={18} className="text-brand-orange fill-brand-orange mr-2" />
                        <span className="text-base font-black text-brand-dark tabular-nums">{restaurant.rating || '---'}</span>
                    </div>
                    <div className="absolute bottom-6 left-6 bg-brand-dark/40 backdrop-blur-md text-white px-5 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl border border-white/10">
                        {restaurant.cuisine}
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
                        <span className="text-xl font-black text-brand-orange drop-shadow-sm">{restaurant.price}</span>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-2">
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
            </Link>
        </motion.div>
    );
}
