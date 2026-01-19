import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Clock, MapPin, Globe, Phone, Share2, Heart, CheckCircle } from 'lucide-react';
import { mockRestaurants } from '../lib/data';
import { useStore } from '../lib/store';
import clsx from 'clsx';

export default function RestaurantDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const restaurant = mockRestaurants.find(r => r.id === id);

    const savedIds = useStore(state => state.savedIds);
    const visitedIds = useStore(state => state.visitedIds);
    const toggleSave = useStore(state => state.toggleSave);
    const markVisited = useStore(state => state.markVisited);

    if (!restaurant) return <div className="p-10 text-center">Restaurant not found</div>;

    const isSaved = savedIds.includes(id);
    const isVisited = visitedIds.includes(id);

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Image */}
            <div className="relative h-72">
                <img
                    src={restaurant.image}
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
                        <button className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={() => toggleSave(id)}
                            className={clsx(
                                "w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center transition-all",
                                isSaved ? "bg-brand-orange text-white" : "bg-white/20 text-white"
                            )}
                        >
                            <Heart size={20} className={isSaved ? "fill-white" : ""} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-5 py-6 -mt-6 bg-white rounded-t-[2rem] relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold text-brand-dark">{restaurant.name}</h1>
                    <div className="flex flex-col items-end">
                        <span className="text-lg font-bold text-brand-orange">{restaurant.price}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                    <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    <span className="font-bold text-brand-dark">{restaurant.rating}</span>
                    <span className="text-gray-400 text-sm">(120 reviews)</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full mx-1"></span>
                    <span className="text-brand-green font-medium text-sm">{restaurant.cuisine}</span>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start gap-3">
                        <Clock className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="font-medium text-brand-dark">Open Now</p>
                            <p className="text-sm text-gray-500">{restaurant.hours}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <MapPin className="text-gray-400 mt-1" size={20} />
                        <div>
                            <p className="font-medium text-brand-dark">Address</p>
                            <p className="text-sm text-gray-500">{restaurant.address}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-6 pt-2">
                        <button className="flex items-center gap-2 text-brand-orange font-medium text-sm">
                            <Globe size={18} /> Website
                        </button>
                        <button className="flex items-center gap-2 text-brand-orange font-medium text-sm">
                            <Phone size={18} /> Call
                        </button>
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-2">About</h3>
                <p className="text-gray-600 leading-relaxed mb-8">
                    {restaurant.description} Experience the lively atmosphere and delicious flavors that make this place a local favorite.
                </p>

                <button
                    onClick={() => markVisited(id)}
                    disabled={isVisited}
                    className={clsx(
                        "w-full font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2",
                        isVisited
                            ? "bg-brand-green text-white shadow-brand-green/30"
                            : "bg-brand-orange text-white shadow-brand-orange/30 active:scale-[0.98]"
                    )}
                >
                    {isVisited ? (
                        <>
                            <CheckCircle size={20} />
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
