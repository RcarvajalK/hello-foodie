import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { ArrowLeft, CheckCircle, XCircle, Loader, Play, ImageOff } from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/fetch-place-photo`;

function isGoogleUrl(url) {
    if (!url || typeof url !== 'string') return false;
    return (
        url.includes('googleusercontent.com') ||
        url.includes('ggpht.com') ||
        url.includes('googleapis.com/maps')
    );
}

export default function MigratePhotos() {
    const navigate = useNavigate();
    const restaurants = useStore(state => state.restaurants);
    const fetchRestaurants = useStore(state => state.fetchRestaurants);

    const [targets, setTargets] = useState([]);
    const [results, setResults] = useState({});
    const [running, setRunning] = useState(false);
    const [done, setDone] = useState(false);

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        // Only restaurants with at least one Google URL
        const withGoogle = restaurants.filter(r =>
            isGoogleUrl(r.image_url) ||
            (Array.isArray(r.additional_images) && r.additional_images.some(isGoogleUrl))
        );
        setTargets(withGoogle);
    }, [restaurants]);

    const migrateOne = async (restaurant, session) => {
        const googleUrls = [
            restaurant.image_url,
            ...(Array.isArray(restaurant.additional_images) ? restaurant.additional_images : [])
        ].filter(isGoogleUrl);

        if (googleUrls.length === 0) return { status: 'skipped' };

        try {
            const res = await fetch(EDGE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ photoUrls: googleUrls, restaurantId: restaurant.id }),
            });

            if (!res.ok) {
                const txt = await res.text();
                return { status: 'error', message: `HTTP ${res.status}: ${txt.slice(0, 100)}` };
            }

            const result = await res.json();

            if (!result.photos || result.photos.length === 0) {
                return { status: 'error', message: 'Edge Function returned 0 photos' };
            }

            const [newMain, ...newExtras] = result.photos;

            // Preserve non-Google URLs that are already permanent
            const keptExtras = (Array.isArray(restaurant.additional_images) ? restaurant.additional_images : [])
                .filter(u => !isGoogleUrl(u));

            const updates = {
                image_url: newMain,
                additional_images: [...newExtras, ...keptExtras].slice(0, 5),
            };

            const { error } = await supabase
                .from('restaurants')
                .update(updates)
                .eq('id', restaurant.id);

            if (error) return { status: 'error', message: error.message };

            return { status: 'ok', count: result.photos.length };
        } catch (err) {
            return { status: 'error', message: err.message };
        }
    };

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
            const result = await migrateOne(r, session);
            setResults(prev => ({ ...prev, [r.id]: result }));
        }

        // Refresh store so main app sees updated URLs
        await fetchRestaurants();
        setRunning(false);
        setDone(true);
    };

    const succeeded = Object.values(results).filter(r => r.status === 'ok').length;
    const failed = Object.values(results).filter(r => r.status === 'error').length;

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 px-5 py-4 pt-12 flex items-center gap-4 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-brand-dark"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="font-black text-brand-dark uppercase tracking-tight text-lg">Photo Migration</h1>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin Tool</p>
                </div>
            </header>

            <div className="p-5 space-y-5">
                {/* Info Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-[2rem] p-5">
                    <p className="text-sm font-black text-amber-800 uppercase tracking-tight mb-1">¿Qué hace esto?</p>
                    <p className="text-xs text-amber-700 font-medium leading-relaxed">
                        Descarga las fotos de Google y las guarda permanentemente en Supabase Storage, arreglando el error de imágenes rotas en todos tus restaurantes.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-[1.5rem] p-4 text-center shadow-sm border border-slate-100">
                        <p className="text-2xl font-black text-brand-dark">{targets.length}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">To Migrate</p>
                    </div>
                    <div className="bg-white rounded-[1.5rem] p-4 text-center shadow-sm border border-slate-100">
                        <p className="text-2xl font-black text-brand-green">{succeeded}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Done</p>
                    </div>
                    <div className="bg-white rounded-[1.5rem] p-4 text-center shadow-sm border border-slate-100">
                        <p className="text-2xl font-black text-red-400">{failed}</p>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Failed</p>
                    </div>
                </div>

                {/* Action Button */}
                {targets.length === 0 && !running ? (
                    <div className="bg-white rounded-[2rem] p-8 text-center shadow-sm border border-slate-100">
                        <CheckCircle size={40} className="text-brand-green mx-auto mb-3" />
                        <p className="font-black text-brand-dark uppercase tracking-tight">All photos are up to date!</p>
                        <p className="text-xs text-gray-400 mt-1">No Google URLs found in your restaurants.</p>
                    </div>
                ) : (
                    <button
                        onClick={runMigration}
                        disabled={running || done}
                        className="w-full bg-brand-orange text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-3 shadow-xl shadow-brand-orange/30 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm uppercase tracking-widest"
                    >
                        {running ? (
                            <>
                                <Loader size={20} className="animate-spin" />
                                Migrating... ({succeeded + failed}/{targets.length})
                            </>
                        ) : done ? (
                            <>
                                <CheckCircle size={20} />
                                Migration Complete!
                            </>
                        ) : (
                            <>
                                <Play size={20} />
                                Migrate All {targets.length} Restaurants
                            </>
                        )}
                    </button>
                )}

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
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Restaurants to migrate</p>
                        {targets.map(r => {
                            const res = results[r.id];
                            return (
                                <div key={r.id} className="bg-white rounded-[1.5rem] p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                                    {/* Tiny photo preview */}
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                                        {r.image_url ? (
                                            <img
                                                src={r.image_url}
                                                alt={r.name}
                                                className="w-full h-full object-cover"
                                                onError={e => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <ImageOff size={20} className="text-gray-300 m-auto mt-3" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-brand-dark text-xs uppercase tracking-tight truncate">{r.name}</p>
                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest truncate">{r.zone}</p>
                                        {res?.status === 'error' && (
                                            <p className="text-[9px] text-red-400 font-bold mt-0.5 truncate">{res.message}</p>
                                        )}
                                        {res?.status === 'ok' && (
                                            <p className="text-[9px] text-brand-green font-bold mt-0.5">{res.count} photos saved</p>
                                        )}
                                    </div>

                                    <div className="flex-shrink-0">
                                        {!res && (
                                            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-200" />
                                        )}
                                        {res?.status === 'running' && (
                                            <Loader size={20} className="text-brand-orange animate-spin" />
                                        )}
                                        {res?.status === 'ok' && (
                                            <CheckCircle size={20} className="text-brand-green" />
                                        )}
                                        {res?.status === 'error' && (
                                            <XCircle size={20} className="text-red-400" />
                                        )}
                                        {res?.status === 'skipped' && (
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                                                <span className="text-[8px] font-black text-gray-400">—</span>
                                            </div>
                                        )}
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
