import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Navigation, MapPin, Star, ArrowRight, Crosshair, Plus, Minus, Route } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

const defaultCenter = {
    lat: 19.4326,
    lng: -99.1332
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    styles: [
        { "featureType": "all", "elementType": "labels.text.fill", "stylers": [{ "color": "#7c93a3" }] },
        { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#dee2e4" }] },
        { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "color": "#f1f3f4" }] },
        { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "color": "#dee2e4" }] },
        { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
        { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#c9d1d4" }] }
    ]
};

export default function MapPage() {
    const restaurants = useStore((state) => state.restaurants);
    const fetchRestaurants = useStore((state) => state.fetchRestaurants);
    const [selected, setSelected] = useState(null);
    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [directions, setDirections] = useState(null);

    useEffect(() => {
        fetchRestaurants();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log('Location error', err)
            );
        }
    }, [fetchRestaurants]);

    const onLoad = useCallback(function callback(map) { setMap(map); }, []);
    const onUnmount = useCallback(function callback() { setMap(null); }, []);

    const centerOnUser = () => {
        if (userLocation && map) {
            map.panTo(userLocation);
            map.setZoom(15);
        }
    };

    const handleZoomIn = () => map && map.setZoom(map.getZoom() + 1);
    const handleZoomOut = () => map && map.setZoom(map.getZoom() - 1);

    const calculateRoute = (dest) => {
        if (!userLocation) {
            alert("No podemos calcular ruta sin tu ubicación.");
            return;
        }
        const service = new google.maps.DirectionsService();
        service.route(
            {
                origin: userLocation,
                destination: dest,
                travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === 'OK') {
                    setDirections(result);
                    setSelected(null);
                } else {
                    console.error('Directions error', status);
                }
            }
        );
    };

    if (typeof google === 'undefined') {
        return <div className="h-screen w-full flex items-center justify-center bg-slate-50 font-black text-brand-orange animate-pulse">CONNECTING...</div>;
    }

    return (
        <div className="h-screen w-full relative">
            <header className="absolute top-0 left-0 right-0 z-10 p-5 pt-12 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-[2.5rem] shadow-xl border border-white flex justify-between items-center pointer-events-auto max-w-lg mx-auto">
                    <div>
                        <h1 className="text-xl font-black text-brand-dark flex items-center gap-2 uppercase tracking-tight">
                            <Navigation className="text-brand-orange" size={24} />
                            Foodie Map
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{restaurants.length} PLACES</p>
                    </div>
                </div>
            </header>

            {/* Map Tools */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-3">
                <button onClick={handleZoomIn} className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-brand-dark active:scale-95 transition-all"><Plus size={24} /></button>
                <button onClick={handleZoomOut} className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-brand-dark active:scale-95 transition-all"><Minus size={24} /></button>
                <div className="h-4"></div>
                <button onClick={centerOnUser} className="w-14 h-14 bg-brand-orange text-white rounded-[1.5rem] shadow-2xl flex items-center justify-center active:scale-95 transition-all border-4 border-white"><Crosshair size={28} /></button>
            </div>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation || defaultCenter}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
            >
                {restaurants.map((restaurant) => {
                    if (!restaurant.coordinates) return null;
                    const position = {
                        lat: restaurant.coordinates.lat,
                        lng: restaurant.coordinates.lng
                    };

                    return (
                        <Marker
                            key={restaurant.id}
                            position={position}
                            onClick={() => setSelected(restaurant)}
                            icon={{
                                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                                fillColor: restaurant.is_visited ? '#4ECDC4' : '#FF6B6B',
                                fillOpacity: 1,
                                strokeWeight: 2,
                                strokeColor: '#FFFFFF',
                                scale: 2,
                                anchor: new google.maps.Point(12, 22),
                            }}
                        />
                    );
                })}

                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            fillColor: '#3B82F6',
                            fillOpacity: 1,
                            strokeWeight: 4,
                            strokeColor: '#FFFFFF',
                            scale: 8,
                        }}
                    />
                )}

                {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true }} />}

                {selected && (
                    <InfoWindow
                        position={{ lat: selected.coordinates.lat, lng: selected.coordinates.lng }}
                        onCloseClick={() => setSelected(null)}
                    >
                        <div className="p-1 min-w-[200px]">
                            <img src={selected.image_url || selected.image} className="w-full h-24 object-cover rounded-xl mb-3" alt={selected.name} />
                            <div className="px-1">
                                <h3 className="font-black text-brand-dark text-sm uppercase leading-tight mb-1">{selected.name}</h3>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest">{selected.cuisine}</span>
                                    <div className="flex items-center gap-1"><Star size={10} className="text-yellow-400 fill-yellow-400" /><span className="text-[10px] font-black">{selected.rating || '---'}</span></div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => calculateRoute({ lat: selected.coordinates.lat, lng: selected.coordinates.lng })}
                                        className="flex-1 bg-brand-orange text-white text-[9px] font-black py-2 rounded-lg flex items-center justify-center gap-1 uppercase tracking-widest"
                                    >
                                        <Route size={14} /> Ruta
                                    </button>
                                    <Link
                                        to={`/restaurant/${selected.id}`}
                                        className="flex-1 bg-brand-dark text-white text-[9px] font-black py-2 rounded-lg flex items-center justify-center gap-1 uppercase tracking-widest"
                                    >
                                        Details <ArrowRight size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
