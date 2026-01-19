import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mockRestaurants } from '../lib/data';
import { Link } from 'react-router-dom';

// Fix for default marker icons in Leaflet with Webpack/Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

export default function MapPage() {
    const center = [19.4326, -99.1332]; // Mexico City center

    return (
        <div className="h-screen w-full relative">
            <div className="absolute top-4 left-4 right-4 z-[1000]">
                <div className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-between">
                    <h1 className="font-bold text-brand-dark">Explore Nearby</h1>
                    <span className="text-xs bg-brand-orange text-white px-2 py-1 rounded-full">{mockRestaurants.length} places</span>
                </div>
            </div>

            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {mockRestaurants.map((restaurant) => (
                    <Marker
                        key={restaurant.id}
                        position={restaurant.coordinates}
                    >
                        <Popup className="custom-popup">
                            <div className="w-48">
                                <img
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                    className="w-full h-24 object-cover rounded-lg mb-2"
                                />
                                <h3 className="font-bold text-brand-dark leading-tight">{restaurant.name}</h3>
                                <p className="text-xs text-brand-orange mb-2">{restaurant.cuisine} • {restaurant.price}</p>
                                <Link
                                    to={`/restaurant/${restaurant.id}`}
                                    className="block text-center bg-brand-orange text-white text-xs font-bold py-2 rounded-md hover:bg-brand-orange/90 transition-colors"
                                >
                                    View Details
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
