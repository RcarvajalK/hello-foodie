import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, User, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import BrandLogo from './BrandLogo';

export default function RestaurantCard({ restaurant, variant = 'list-photos' }) {
    const isVisited = restaurant.is_visited;

    // Tiny branded tag for quality
    const BrandTag = () => (
        <div className="bg-brand-orange/10 p-1 rounded-lg">
            <BrandLogo size={12} />
        </div>
    );

    if (variant === 'list') {
        return (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Link
                    to={`/restaurant/${restaurant.id}`}
                    className="flex items-center gap-4 bg-white p-4 rounded-3xl border border-gray-50 shadow-sm hover:shadow-md transition-all relative overflow-hidden active:scale-98"
                >
                    {isVisited && <div className="absolute top-0 right-0 w-10 h-10 bg-brand-green/10 flex items-center justify-center rounded-bl-3xl text-brand-green"><CheckCircle size={16} /></div>}
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100 shadow-inner">
                        <img src={restaurant.image_url || restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-brand-dark text-sm truncate uppercase tracking-tight">{restaurant.name}</h3>
                            {isVisited && <BrandTag />}
                        </div>
                        <p className="text-[10px] text-gray-400 font-black tracking-widest uppercase mt-0.5">{restaurant.zone || 'No Zone'} • {restaurant.cuisine}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1 text-brand-orange bg-brand-orange/5 px-2 py-1 rounded-full">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[10px] font-black">{restaurant.rating || '---'}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-300 tracking-tighter">{restaurant.price}</span>
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-5">
                        <h3 className="font-black text-white text-sm leading-tight drop-shadow-md uppercase tracking-tight mb-1">{restaurant.name}</h3>
                        <p className="text-[9px] text-brand-green font-black uppercase tracking-widest">{restaurant.cuisine}</p>
                    </div>
                    {isVisited && (
                        <div className="absolute top-4 left-4 bg-brand-green/90 backdrop-blur-md p-1.5 rounded-full text-white shadow-xl ring-2 ring-white/20">
                            <CheckCircle size={14} />
                        </div>
                    )}
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
                className="block bg-white rounded-[3rem] overflow-hidden shadow-md border border-gray-50 transition-all hover:shadow-xl relative active:translate-y-1"
            >
                <div className="relative h-56">
                    <img src={restaurant.image_url || restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute top-5 right-5 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center shadow-2xl">
                        <Star size={16} className="text-brand-orange fill-brand-orange mr-1.5" />
                        <span className="text-sm font-black text-brand-dark">{restaurant.rating || '---'}</span>
                    </div>
                    <div className="absolute top-5 left-5 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/20">
                        {restaurant.cuisine}
                    </div>
                </div>

                <div className="p-7">
                    <div className="flex justify-between items-start mb-5">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-2xl font-black text-brand-dark leading-tight uppercase tracking-tighter">{restaurant.name}</h3>
                                {isVisited && (
                                    <div className="bg-brand-green/10 p-1 rounded-lg">
                                        <CheckCircle size={20} className="text-brand-green" />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center text-gray-400 text-xs gap-4 font-black uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><MapPin size={14} className="text-brand-orange" /> {restaurant.zone || 'Unknown'}</span>
                                <span className="flex items-center gap-1.5 h-1.5 w-1.5 bg-slate-200 rounded-full"></span>
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(restaurant.date_added).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <span className="text-lg font-black text-brand-orange">{restaurant.price}</span>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-50 mt-2">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                            <div className="w-6 h-6 bg-brand-green/10 rounded-lg flex items-center justify-center text-brand-green">
                                <User size={12} />
                            </div>
                            <span>Rec by: <span className="text-brand-dark">{restaurant.recommended_by || 'Me'}</span></span>
                        </div>
                        {restaurant.club_name && (
                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
                                <div className="w-6 h-6 bg-brand-orange/10 rounded-lg flex items-center justify-center text-brand-orange">
                                    <Users size={12} />
                                </div>
                                <span className="text-brand-dark">{restaurant.club_name}</span>
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
