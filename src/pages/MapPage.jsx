import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { Navigation, MapPin, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../lib/store';

const containerStyle = {
    width: '100%',
    height: '100vh'
};

const center = {
    lat: 19.4326,
    lng: -99.1332
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    styles: [
        {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#7c93a3" }]
        },
        {
            "featureType": "administrative",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#dee2e4" }]
        },
        {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#f1f3f4" }]
        },
        {
            "featureType": "poi",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#dee2e4" }]
        },
        {
            "featureType": "road",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#ffffff" }]
        },
        {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#c9d1d4" }]
        }
    ]
};

export default function MapPage() {
    const restaurants = useStore((state) => state.restaurants);
    const fetchRestaurants = useStore((state) => state.fetchRestaurants);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const [map, setMap] = useState(null);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);


    return (
        <div className="h-screen w-full relative">
            <header className="absolute top-0 left-0 right-0 z-10 p-5 pt-12 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-[2rem] shadow-xl border border-white flex justify-between items-center pointer-events-auto max-w-lg mx-auto">
                    <div>
                        <h1 className="text-xl font-black text-brand-dark flex items-center gap-2 uppercase tracking-tight">
                            <Navigation className="text-brand-orange" size={24} />
                            Google Foodie Map
                        </h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{restaurants.length} SAVED PLACES</p>
                    </div>
                    <div className="w-12 h-12 bg-brand-orange text-white rounded-2xl flex items-center justify-center shadow-lg shadow-brand-orange/30">
                        <MapPin size={24} />
                    </div>
                </div>
            </header>

            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={mapOptions}
            >
                {restaurants.map((restaurant) => {
                    if (!restaurant.coordinates) return null;

                    const position = {
                        lat: restaurant.coordinates.x || restaurant.coordinates[0],
                        lng: restaurant.coordinates.y || restaurant.coordinates[1]
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

                {selected && (
                    <InfoWindow
                        position={{
                            lat: selected.coordinates.x || selected.coordinates[0],
                            lng: selected.coordinates.y || selected.coordinates[1]
                        }}
                        onCloseClick={() => setSelected(null)}
                    >
                        <div className="p-1 min-w-[200px]">
                            <img
                                src={selected.image_url || selected.image}
                                className="w-full h-24 object-cover rounded-xl mb-3"
                                alt={selected.name}
                            />
                            <div className="px-1">
                                <h3 className="font-black text-brand-dark text-sm uppercase leading-tight mb-1">{selected.name}</h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-black text-brand-orange uppercase tracking-widest">{selected.cuisine}</span>
                                    <div className="flex items-center gap-1">
                                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-[10px] font-black">{selected.rating || '---'}</span>
                                    </div>
                                </div>
                                <Link
                                    to={`/restaurant/${selected.id}`}
                                    className="mt-3 w-full bg-slate-900 text-white text-[10px] font-black py-2 rounded-lg flex items-center justify-center gap-1 uppercase tracking-widest hover:bg-brand-orange transition-colors"
                                >
                                    View Details
                                    <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
