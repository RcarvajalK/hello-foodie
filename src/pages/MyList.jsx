import { Filter, Search, PlusCircle } from 'lucide-react';
import { mockRestaurants } from '../lib/data';
import RestaurantCard from '../components/RestaurantCard';
import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';

export default function MyList() {
    const savedIds = useStore(state => state.savedIds);
    const savedRestaurants = mockRestaurants.filter(r => savedIds.includes(r.id));

    return (
        <div className="pb-20">
            <header className="bg-white p-5 sticky top-0 z-10 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-brand-dark mb-4">My Bucket List</h1>

                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search your list..."
                            className="w-full bg-gray-50 h-10 rounded-lg pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-brand-orange"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <button className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-gray-600">
                        <Filter size={20} />
                    </button>
                </div>
            </header>

            <div className="p-5">
                {savedRestaurants.length > 0 ? (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500">{savedRestaurants.length} places to visit</span>
                            <Link to="/map" className="text-brand-orange text-sm font-medium">Map View</Link>
                        </div>

                        <div className="space-y-4">
                            {savedRestaurants.map(restaurant => (
                                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-4">
                            <PlusCircle size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-brand-dark mb-1">Your list is empty</h3>
                        <p className="text-sm text-gray-500 mb-6 px-10">Start saving restaurants you want to visit later!</p>
                        <Link to="/" className="bg-brand-orange text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-brand-orange/20">
                            Explore Restaurants
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
