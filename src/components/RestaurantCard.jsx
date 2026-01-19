import { Link } from 'react-router-dom';
import { Star, MapPin, Calendar, User, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function RestaurantCard({ restaurant, variant = 'list-photos' }) {
    if (variant === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <Link
                    to={`/restaurant/${restaurant.id}`}
                    className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-brand-dark text-sm truncate">{restaurant.name}</h3>
                        <p className="text-[10px] text-gray-500 truncate">{restaurant.zone} • {restaurant.cuisine}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-0.5 text-brand-orange">
                            <Star size={10} fill="currentColor" />
                            <span className="text-[10px] font-black">{restaurant.rating}</span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">{restaurant.price}</span>
                    </div>
                </Link>
            </motion.div>
        );
    }

    if (variant === 'gallery') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative group"
            >
                <Link
                    to={`/restaurant/${restaurant.id}`}
                    className="block aspect-square rounded-3xl overflow-hidden shadow-md"
                >
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                        <h3 className="font-bold text-white text-sm leading-tight drop-shadow-md">{restaurant.name}</h3>
                        <p className="text-[10px] text-white/80 font-medium">{restaurant.cuisine}</p>
                    </div>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center shadow-sm">
                        <Star size={10} className="text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-[10px] font-black text-gray-800">{restaurant.rating}</span>
                    </div>
                </Link>
            </motion.div>
        );
    }

    // default: list-photos
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
        >
            <Link
                to={`/restaurant/${restaurant.id}`}
                className="block bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 transition-shadow hover:shadow-md"
            >
                <div className="relative h-48">
                    <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full flex items-center shadow-md">
                        <Star size={14} className="text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-xs font-black text-brand-dark">{restaurant.rating}</span>
                    </div>
                    <div className="absolute top-4 left-4 bg-brand-orange text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                        {restaurant.cuisine}
                    </div>
                </div>

                <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h3 className="text-lg font-black text-brand-dark leading-tight mb-1">{restaurant.name}</h3>
                            <div className="flex items-center text-gray-400 text-xs gap-3">
                                <span className="flex items-center gap-1 font-medium"><MapPin size={12} className="text-brand-orange" /> {restaurant.zone}</span>
                                <span className="flex items-center gap-1 font-medium"><Calendar size={12} /> {restaurant.dateAdded}</span>
                            </div>
                        </div>
                        <span className="text-sm font-black text-brand-orange">{restaurant.price}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-1">
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                            <User size={12} className="text-brand-green" /> Rec by: <span className="text-brand-dark">{restaurant.recommendedBy}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                            <Users size={12} className="text-blue-500" /> Club: <span className="text-brand-dark">{restaurant.club}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
