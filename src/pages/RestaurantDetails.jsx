import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Globe, Phone, Share2, Heart, CheckCircle, Trash2 } from 'lucide-react';
import { useStore } from '../lib/store';
import clsx from 'clsx';

export default function RestaurantDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const restaurants = useStore(state => state.restaurants);
    const toggleVisited = useStore(state => state.toggleVisited);
    const deleteRestaurant = useStore(state => state.deleteRestaurant);

    const restaurant = restaurants.find(r => r.id === id);

    if (!restaurant) return <div className="p-10 text-center font-bold text-brand-orange mt-20">Restaurant not found or loading...</div>;

    const handleToggleVisited = () => {
        toggleVisited(restaurant.id, restaurant.is_visited);
    };

    const handleDelete = () => {
        if (window.confirm('Delete this restaurant from your list?')) {
            deleteRestaurant(restaurant.id);
            navigate('/');
        }
    };

    return (
        <div className="bg-white min-h-screen pb-24">
            <div className="relative h-72">
                <img
                    src={restaurant.image_url || restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex gap-3">
                        <button onClick={handleDelete} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                            <Trash2 size={20} />
                        </button>
                        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all">
                            <Heart size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-5 py-6 -mt-8 bg-white rounded-t-[3rem] relative z-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-black text-brand-dark uppercase tracking-tight">{restaurant.name}</h1>
                    <span className="text-xl font-black text-brand-orange">{restaurant.price}</span>
                </div>

                <div className="flex items-center gap-2 mb-8">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <span className="font-black text-brand-dark">{restaurant.rating || '---'}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                    <span className="text-brand-green font-bold text-sm uppercase">{restaurant.cuisine}</span>
                </div>

                <div className="space-y-5 mb-10">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <MapPin className="text-brand-orange" size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-brand-dark text-sm">Location / Zone</p>
                            <p className="text-sm text-gray-500 font-medium">{restaurant.zone || 'Address not set'}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Clock className="text-brand-green" size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-brand-dark text-sm">Status</p>
                            <p className="text-sm text-gray-500 font-medium tracking-tight">
                                Added on {new Date(restaurant.date_added).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="font-black text-lg mb-3 tracking-tight">Details</h3>
                    <div className="bg-slate-50 p-4 rounded-2xl text-sm text-gray-600 font-medium leading-relaxed border border-slate-100 flex flex-col gap-2">
                        <p><span className="text-brand-dark font-bold uppercase text-[10px] tracking-wider block mb-1">Recommended By</span> {restaurant.recommended_by || 'Me'}</p>
                        {restaurant.club_name && <p><span className="text-brand-dark font-bold uppercase text-[10px] tracking-wider block mb-1">Club</span> {restaurant.club_name}</p>}
                    </div>
                </div>

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
        </div>
    );
}
