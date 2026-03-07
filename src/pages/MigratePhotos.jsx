import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, XCircle, Loader, Play, RefreshCw } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/fetch-place-photo`;

/**
 * Gets fresh photo URLs from Google Places API using the Place ID or a name search,
 * then permanently stores them via the Edge Function.
 * Returns { status: 'ok', count } or { status: 'error', message }
 * Never throws — all errors are returned as { status: 'error', message }.
 */
async function refreshOneFresh(restaurant, session) {
    try {
        if (!window.google) return { status: 'error', message: 'Google Maps API not loaded' };

        const service = new window.google.maps.places.PlacesService(document.createElement('div'));

        // Step 1: Resolve Place ID (use stored or search by name)
        let placeId = restaurant.google_place_id || null;

        if (!placeId) {
            const query = `${restaurant.name} ${restaurant.zone || ''}`.trim();
            placeId = await new Promise((resolve) => {
                service.findPlaceFromQuery(
                    { query, fields: ['place_id'] },
                    (results, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.[0]?.place_id) {
                            resolve(results[0].place_id);
                        } else {
                            resolve(null);
                        }
                    }
                );
            });
        }

        if (!placeId) return { status: 'error', message: 'Place ID not found' };

        // Step 2: Get fresh photo objects from Places Details
        const place = await new Promise((resolve, reject) => {
            service.getDetails(
                { placeId, fields: ['photos'] },
                (result, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) resolve(result);
                    else reject(new Error(`Places status: ${status}`));
                }
            );
        }).catch(err => ({ error: err.message }));

        if (place?.error) return { status: 'error', message: place.error };
        if (!place?.photos?.length) return { status: 'error', message: 'No photos from Places API' };

        // Step 3: Get actual fresh URLs (max 5)
        const freshUrls = place.photos.slice(0, 5).map(p => p.getUrl({ maxWidth: 1200 }));

        // Step 4: Permanently store via Edge Function
        const res = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ photoUrls: freshUrls, restaurantId: restaurant.id }),
        });

        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            return { status: 'error', message: `Edge Fn HTTP ${res.status}: ${txt.slice(0, 80)}` };
        }

        const result = await res.json();
        if (!result.photos?.length) {
            return { status: 'error', message: result.errors?.[0] || 'Edge Fn returned 0 photos' };
        }

        // Step 5: Update DB with permanent Supabase Storage URLs
        const [newMain, ...newExtras] = result.photos;
        const { error: dbErr } = await supabase
            .from('restaurants')
            .update({
                image_url: newMain,
                additional_images: newExtras.slice(0, 4),
                google_place_id: placeId,
            })
            .eq('id', restaurant.id);

        if (dbErr) return { status: 'error', message: dbErr.message };

        return { status: 'ok', count: result.photos.length };
    } catch (err) {
        return { status: 'error', message: err?.message || 'Unknown error' };
    }
}

export default function MigratePhotos() {
    const navigate = useNavigate();
    const restaurants = useStore(state => state.restaurants);
    const fetchRestaurants = useStore(state => state.fetchRestaurants);

    const [results, setResults] = useState({});
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    // All non-sponsored restaurants need fresh photos
    const targets = restaurants.filter(r => !r.is_sponsored);

    const runMigration = async () => {
        if (running || targets.length === 0) return;
        setRunning(true);
        setDone(false);
        setResults({});

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            alert('No hay sesión activa. Por favor inicia sesión.');
            setRunning(false);
            return;
        }

        for (const r of targets) {
            setResults(prev => ({ ...prev, [r.id]: { status: 'running' } }));
            const result = await refreshOneFresh(r, session);
            setResults(prev => ({ ...prev, [r.id]: result }));
            // Small delay to avoid hammering the Places API
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        await fetchRestaurants();
        setRunning(false);
        setDone(true);
    };

    const succeeded = Object.values(results).filter(r => r.status === 'ok').length;
    const failed = Object.values(results).filter(r => r.status === 'error').length;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <header className="bg-white border-b border-slate-100 px-5 py-4 pt-12 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-brand-dark"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="font-black text-brand-dark uppercase tracking-tight text-lg">Fix Restaurant Photos</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin Tool</p>
                </div>
            </header>

            <div className="p-5 space-y-5">
                {/* Info Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-5">
                    <p className="text-sm font-black text-amber-800 uppercase tracking-tight mb-1">¿Qué hace esto?</p>
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        Para cada restaurante, obtiene fotos <b>frescas</b> directamente de Google Places API
                        (no intenta re-descargar URLs expiradas), y las guarda permanentemente en Supabase Storage.
                        Esto reemplaza los íconos rotos/rojos con fotos reales.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-[1.5rem] p-4 text-center shadow-sm border border-slate-100">
                        <p className="text-2xl font-black text-brand-dark">{targets.length}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Total</p>
                    </div>
                    <div className="bg-white rounded-[1.5rem] p-4 text-center shadow-sm border border-slate-100">
                        <p className="text-2xl font-black text-brand-green">{succeeded}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Fixed ✓</p>
                    </div>
                    <div className="bg-white rounded-[1.5rem] p-4 text-center shadow-sm border border-slate-100">
                        <p className="text-2xl font-black text-red-400">{failed}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Failed ✗</p>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={runMigration}
                    disabled={running || targets.length === 0}
                    className="w-full bg-brand-orange text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-brand-orange/30 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                >
                    {running ? (
                        <>
                            <Loader size={20} className="animate-spin" />
                            Fixing... ({succeeded + failed}/{targets.length})
                        </>
                    ) : done ? (
                        <>
                            <CheckCircle size={20} />
                            Done! {succeeded} fixed, {failed} failed
                        </>
                    ) : (
                        <>
                            <RefreshCw size={20} />
                            Fix All {targets.length} Restaurants
                        </>
                    )}
                </button>

                {done && (
                    <button
                        onClick={() => navigate('/')}
                        className="w-full bg-brand-dark text-white font-black py-4 rounded-[2rem] text-sm uppercase tracking-widest active:scale-95 transition-all"
                    >
                        Back to Home
                    </button>
                )}

                {/* Restaurant List */}
                {targets.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Restaurants</p>
                        {targets.map(r => {
                            const res = results[r.id];
                            return (
                                <div key={r.id} className="bg-white rounded-[1.5rem] p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-brand-dark text-xs uppercase tracking-tight truncate">{r.name}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{r.zone}</p>
                                        {res?.status === 'error' && (
                                            <p className="text-[9px] text-red-400 font-bold mt-0.5 truncate">{res.message}</p>
                                        )}
                                        {res?.status === 'ok' && (
                                            <p className="text-[9px] text-brand-green font-bold mt-0.5">{res.count} photos saved ✓</p>
                                        )}
                                    </div>
                                    <div className="flex-shrink-0">
                                        {!res && <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-200" />}
                                        {res?.status === 'running' && <Loader size={20} className="text-brand-orange animate-spin" />}
                                        {res?.status === 'ok' && <CheckCircle size={20} className="text-brand-green" />}
                                        {res?.status === 'error' && <XCircle size={20} className="text-red-400" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
