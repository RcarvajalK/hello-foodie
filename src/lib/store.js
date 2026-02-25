import { create } from 'zustand';
import { supabase } from './supabase';
import { calculateXP, getLevelFromXP } from './badges';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/fetch-place-photo`;

/**
 * Downloads Google photo URLs via the Edge Function and stores them
 * permanently in Supabase Storage. Returns the permanent public URLs.
 * Falls back to original URLs if the Edge Function fails.
 */
async function permanentizePhotos(googleUrls, restaurantId) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { photos: googleUrls }; // no auth, return as-is

    try {
        const res = await fetch(EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ photoUrls: googleUrls, restaurantId }),
        });

        if (!res.ok) {
            console.warn('[permanentizePhotos] Edge function returned', res.status);
            return { photos: googleUrls }; // fallback
        }

        const result = await res.json();
        // If Edge Function got at least one photo, use them; otherwise keep originals
        if (result.photos && result.photos.length > 0) {
            return { photos: result.photos };
        }
        return { photos: googleUrls };
    } catch (err) {
        console.warn('[permanentizePhotos] Failed, using original URLs:', err.message);
        return { photos: googleUrls }; // fallback gracefully
    }
}


export const useStore = create((set, get) => ({
    restaurants: [],
    profile: null,
    loading: false,
    notificationPreferences: {
        nearby: true,
        lunch: true,
        dinner: true
    },
    showLevelUpModal: null, // { oldLevel, newLevel }
    setLevelUpModal: (data) => set({ showLevelUpModal: data }),

    uploadImage: async (file, path = null) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            // If no path is provided, use the userId as the folder (aligns with RLS)
            const folder = path || userId || 'public';

            // 1. Compression logic
            const compressedFile = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const img = new Image();
                    img.src = event.target.result;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 1200;
                        const MAX_HEIGHT = 1200;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);

                        canvas.toBlob((blob) => {
                            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                        }, 'image/jpeg', 0.8);
                    };
                };
            });

            // 2. Upload to Supabase
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
            const filePath = `${folder}/${fileName}`;

            const { data, error } = await supabase.storage
                .from('images')
                .upload(filePath, compressedFile);

            if (error) throw error;

            // 3. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            return { success: true, url: publicUrl };
        } catch (error) {
            console.error("Upload Error:", error);
            return { success: false, error: error.message };
        }
    },
    setRestaurants: (restaurants) => set({ restaurants }),
    // Fetch all restaurants for the current user
    fetchRestaurants: async () => {
        set({ loading: true });
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            set({ loading: false });
            return;
        }

        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_deleted', false)
            .order('date_added', { ascending: false });

        if (error) {
            console.error("fetchRestaurants Error:", error);
            alert("Error loading restaurants: " + error.message);
        } else {
            const parsedData = (data || []).map(r => {
                if (typeof r.coordinates === 'string') {
                    // Supabase point returns (lng, lat) -> (x, y) in Postgres
                    const [lng, lat] = r.coordinates.replace(/[()]/g, '').split(',');
                    return { ...r, coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) } };
                }
                return r;
            });
            set({ restaurants: parsedData });
        }
        set({ loading: false });
    },

    setProfile: (profile) => set({ profile }),
    setNotificationPreferences: (prefs) => set((state) => ({
        notificationPreferences: { ...state.notificationPreferences, ...prefs }
    })),

    // Fetch user profile
    fetchProfile: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (!error) set({ profile: data });
    },

    // Add new restaurant to Supabase
    addRestaurant: async (restaurantData) => {
        set({ loading: true });
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            console.error("No user session found for addRestaurant");
            set({ loading: false });
            return null;
        }

        const coords = restaurantData.coordinates;
        // Postgres Point is (lng, lat)
        const formattedCoords = coords ? `(${coords.lng}, ${coords.lat})` : null;

        const payload = {
            ...restaurantData,
            user_id: session.user.id,
            coordinates: formattedCoords,
            date_added: new Date().toISOString()
        };

        console.log("Adding Restaurant payload:", payload);

        const { data, error } = await supabase
            .from('restaurants')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error("Supabase Add Error:", error);
            set({ loading: false });
            return { success: false, error: error.message };
        }

        console.log("Supabase Add Success:", data);
        let newData = data;

        if (typeof newData.coordinates === 'string' && newData.coordinates.includes('(')) {
            const [lng, lat] = newData.coordinates.replace(/[()]/g, '').split(',').map(Number);
            newData = { ...newData, coordinates: { lat, lng } };
        }

        set((state) => {
            const newRestaurants = [newData, ...state.restaurants];
            return {
                restaurants: newRestaurants,
                loading: false
            };
        });
        return { success: true, data: newData };
    },

    // Toggle visited status in DB with optional review
    toggleVisited: async (id, currentStatus, review = null) => {
        const updateData = { is_visited: !currentStatus };
        if (review) {
            updateData.rating = review.rating;
            updateData.review_comment = review.comment;
            updateData.visited_at = new Date().toISOString();
            if (review.personal_price) {
                updateData.personal_price = review.personal_price;
            }
        }

        console.log("Toggling Visited:", { id, updateData });

        const { data, error, count } = await supabase
            .from('restaurants')
            .update(updateData)
            .eq('id', id)
            .select();

        console.log("Supabase Update Result:", { data, error, count });

        if (!error && data?.length > 0) {
            const oldXP = calculateXP(get().restaurants);
            const oldLevel = getLevelFromXP(oldXP);

            const updatedRestaurants = get().restaurants.map((r) =>
                r.id === id ? { ...r, ...updateData } : r
            );

            const newXP = calculateXP(updatedRestaurants);
            const newLevel = getLevelFromXP(newXP);

            set({ restaurants: updatedRestaurants });

            if (newLevel.level > oldLevel.level) {
                set({ showLevelUpModal: { oldLevel, newLevel } });
            }

            return { success: true };
        }

        const errorMsg = error ? error.message : "No rows updated. (Check RLS policies)";
        console.error("Supabase Update Error:", error || errorMsg);
        return { success: false, error: errorMsg };
    },

    toggleFavorite: async (id, currentStatus) => {
        const { data, error } = await supabase
            .from('restaurants')
            .update({ is_favorite: !currentStatus })
            .eq('id', id)
            .select();

        if (!error && data?.length > 0) {
            set((state) => ({
                restaurants: state.restaurants.map((r) =>
                    r.id === id ? { ...r, is_favorite: !currentStatus } : r
                )
            }));
            return { success: true };
        }
        return { success: false, error: error?.message };
    },

    updateRestaurant: async (id, updates) => {
        console.log("Updating Restaurant:", { id, updates });
        const { data, error } = await supabase
            .from('restaurants')
            .update(updates)
            .eq('id', id)
            .select();

        console.log("Supabase Update Result:", { data, error });

        if (!error && data?.length > 0) {
            set((state) => ({
                restaurants: state.restaurants.map((r) =>
                    r.id === id ? { ...r, ...updates } : r
                )
            }));
            return { success: true, data: data[0] };
        }
        const errorMsg = error ? error.message : "Update failed or no rows changed.";
        return { success: false, error: errorMsg };
    },

    // Update user profile
    updateProfile: async (profileUpdates) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            console.error("updateProfile Error:", error);
        } else {
            set({ profile: data });
        }
        return { data, error };
    },

    // Soft delete restaurant
    deleteRestaurant: async (id) => {
        const { error } = await supabase
            .from('restaurants')
            .update({ is_deleted: true })
            .eq('id', id);

        if (!error) {
            set((state) => ({
                restaurants: state.restaurants.filter((r) => r.id !== id)
            }));
            return { success: true };
        }
        return { success: false, error: error.message };
    },

    refreshRestaurantImages: async (id, googlePlaceId = null) => {
        if (!window.google) return { success: false, error: 'Maps API not loaded' };
        const { isBrokenImage } = await import('./images');

        try {
            const service = new window.google.maps.places.PlacesService(document.createElement('div'));
            let activePlaceId = googlePlaceId;

            // If no Place ID, try to find it
            if (!activePlaceId) {
                const currentRes = get().restaurants.find(r => r.id === id);
                if (!currentRes) return { success: false, error: 'Restaurant not found locally' };

                const searchQuery = `${currentRes.name} ${currentRes.zone || ''} ${currentRes.address || ''}`;
                const searchResult = await new Promise((resolve) => {
                    service.findPlaceFromQuery({
                        query: searchQuery,
                        fields: ['place_id']
                    }, (results, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.[0]?.place_id) {
                            resolve(results[0].place_id);
                        } else {
                            resolve(null);
                        }
                    });
                });

                if (!searchResult) return { success: false, error: 'Could not find Place ID for healing' };
                activePlaceId = searchResult;
            }

            const place = await new Promise((resolve, reject) => {
                service.getDetails({
                    placeId: activePlaceId,
                    fields: ['photo', 'photos']
                }, (result, status) => {
                    if (status === window.google.maps.places.PlacesServiceStatus.OK) resolve(result);
                    else reject(status);
                });
            });

            if (!place || !place.photos || place.photos.length === 0) {
                console.warn(`[Refresh] No photos found for Place ID: ${activePlaceId}`);
                return { success: false, error: 'No photos found' };
            }

            const allFetchedPhotos = place.photos.map(p => p.getUrl({ maxWidth: 1200 }));
            const validGoogleUrls = allFetchedPhotos.filter(url => !isBrokenImage(url));

            if (validGoogleUrls.length === 0) {
                console.warn(`[Refresh] All ${allFetchedPhotos.length} photos look like placeholders.`);
                return { success: false, error: 'No valid photos found' };
            }

            console.log(`[Refresh] Found ${validGoogleUrls.length} Google URLs. Permanentizing via Edge Function...`);

            // *** KEY CHANGE: Permanentize via Edge Function instead of saving raw Google URLs ***
            const { photos: permanentUrls } = await permanentizePhotos(validGoogleUrls, id);

            const updates = {
                image_url: permanentUrls[0],
                additional_images: permanentUrls.slice(1, 5),
                google_place_id: activePlaceId
            };

            const { data, error } = await supabase
                .from('restaurants')
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;

            set((state) => ({
                restaurants: state.restaurants.map((r) =>
                    r.id === id ? { ...r, ...updates } : r
                )
            }));

            console.log(`[Refresh] Permanently stored ${permanentUrls.length} photos for restaurant ${id}`);
            return { success: true, data };
        } catch (error) {
            console.error(`[Refresh] Error for restaurant ${id}:`, error);
            return { success: false, error: typeof error === 'string' ? error : error.message };
        }
    },

    // --- Trash Bin Actions ---
    deletedRestaurants: [],
    fetchDeletedRestaurants: async () => {
        set({ loading: true });
        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('is_deleted', true)
            .order('date_added', { ascending: false });

        if (!error) {
            const parsedData = (data || []).map(r => {
                if (typeof r.coordinates === 'string') {
                    const [lng, lat] = r.coordinates.replace(/[()]/g, '').split(',');
                    return { ...r, coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) } };
                }
                return r;
            });
            set({ deletedRestaurants: parsedData });
        }
        set({ loading: false });
    },

    restoreRestaurant: async (id) => {
        const { error } = await supabase
            .from('restaurants')
            .update({ is_deleted: false })
            .eq('id', id);

        if (!error) {
            // Refetch or update local state
            set((state) => ({
                deletedRestaurants: state.deletedRestaurants.filter(r => r.id !== id)
            }));
            get().fetchRestaurants(); // Refresh main list
            return { success: true };
        }
        return { success: false, error: error.message };
    },

    permanentlyDeleteRestaurant: async (id) => {
        const { error } = await supabase
            .from('restaurants')
            .delete()
            .eq('id', id);

        if (!error) {
            set((state) => ({
                deletedRestaurants: state.deletedRestaurants.filter(r => r.id !== id)
            }));
            return { success: true };
        }
        return { success: false, error: error.message };
    },

    // --- Clubs Functionality ---
    clubs: [],
    fetchClubs: async () => {
        const { data: { session } } = await supabase.auth.getSession();

        const { data, error } = await supabase
            .from('clubs')
            .select(`
                *,
                club_members(count),
                is_member:club_members!inner(user_id)
            `)
            .eq('club_members.user_id', session?.user?.id);

        // The above query is tricky because !inner filters the parent. 
        // Better approach: fetch all clubs and check membership separately or use a join.

        const { data: allClubs, error: clubsError } = await supabase
            .from('clubs')
            .select('*, club_members(count)');

        if (clubsError) return;

        if (session?.user) {
            const { data: memberships } = await supabase
                .from('club_members')
                .select('club_id')
                .eq('user_id', session.user.id);

            const memberClubIds = new Set(memberships?.map(m => m.club_id) || []);
            const clubsWithStatus = (allClubs || []).map(club => ({
                ...club,
                is_member: memberClubIds.has(club.id)
            }));
            set({ clubs: clubsWithStatus });
        } else {
            set({ clubs: allClubs || [] });
        }
    },

    createClub: async (clubData) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, error: 'No session' };

        const { data, error } = await supabase
            .from('clubs')
            .insert([{
                ...clubData,
                created_by: session.user.id
            }])
            .select()
            .single();

        if (error) {
            console.error("Supabase Create Club Error:", error);
            return { success: false, error: error.message };
        }

        // Auto-join creator as admin
        await supabase.from('club_members').insert([{
            club_id: data.id,
            user_id: session.user.id,
            role: 'admin'
        }]);

        set(state => ({ clubs: [{ ...data, is_member: true }, ...state.clubs] }));
        return { success: true, data };
    },

    joinClub: async (clubId) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, error: "No active session found." };

        const { error } = await supabase
            .from('club_members')
            .insert([{ club_id: clubId, user_id: session.user.id, role: 'member' }]);

        if (error) {
            console.error("Supabase Join Club Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true };
    },

    // --- Expanded Clubs Logic ---
    clubDetails: null,
    fetchClubDetails: async (clubId) => {
        set({ loading: true });
        try {
            // 1. Fetch Club Info
            const { data: club, error: clubError } = await supabase
                .from('clubs')
                .select('*')
                .eq('id', clubId)
                .single();

            if (clubError) throw clubError;

            // 2. Fetch Members with Profiles
            const { data: members, error: membersError } = await supabase
                .from('club_members')
                .select(`
                    user_id,
                    role,
                    profile:profiles!inner(id, full_name, avatar_url)
                `)
                .eq('club_id', clubId);

            // 3. Fetch Collaborative Restaurants
            const { data: clubRestaurants, error: restError } = await supabase
                .from('club_restaurants')
                .select(`
                    *,
                    restaurant:restaurants(*)
                `)
                .eq('club_id', clubId);

            // 4. Fetch visits for rankings
            const memberIds = (members || []).map(m => m.user_id);
            const { data: allVisits } = await supabase
                .from('restaurants')
                .select('user_id, name, is_visited')
                .in('user_id', memberIds)
                .eq('is_visited', true);

            const restaurantsInClubNames = new Set((clubRestaurants || []).map(r => r.restaurant?.name).filter(Boolean));

            const rankings = (members || []).map(m => {
                const memberVisits = (allVisits || []).filter(v =>
                    v.user_id === m.user_id && restaurantsInClubNames.has(v.name)
                ).length;
                return {
                    ...m,
                    visit_count: memberVisits
                };
            }).sort((a, b) => b.visit_count - a.visit_count);

            const details = {
                ...club,
                members: rankings,
                restaurants: (clubRestaurants || []).map(r => r.restaurant).filter(Boolean)
            };

            set({ clubDetails: details, loading: false });
            return { success: true, data: details };
        } catch (error) {
            console.error("fetchClubDetails Error:", error);
            set({ loading: false });
            return { success: false, error: error.message };
        }
    },

    addRestaurantToClub: async (clubId, restaurantId) => {
        const { error } = await supabase
            .from('club_restaurants')
            .insert([{ club_id: clubId, restaurant_id: restaurantId }]);

        if (error) return { success: false, error: error.message };

        // Refresh details local state if viewing this club
        const currentDetails = get().clubDetails;
        if (currentDetails && currentDetails.id === clubId) {
            get().fetchClubDetails(clubId);
        }

        return { success: true };
    },

    removeRestaurantFromClub: async (clubId, restaurantId) => {
        const { error } = await supabase
            .from('club_restaurants')
            .delete()
            .match({ club_id: clubId, restaurant_id: restaurantId });

        if (error) return { success: false, error: error.message };

        // Refresh details local state if viewing this club
        const currentDetails = get().clubDetails;
        if (currentDetails && currentDetails.id === clubId) {
            get().fetchClubDetails(clubId);
        }

        return { success: true };
    },

    addGooglePlaceToClub: async (clubId, place) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return { success: false, error: 'No session' };

        // 1. Check if restaurant already exists for this user
        let { data: restaurant, error: fetchErr } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('name', place.name)
            .maybeSingle();

        if (!restaurant) {
            // 2. Create it if not
            const coords = place.geometry?.location;
            const formattedCoords = coords ? `(${coords.lng()}, ${coords.lat()})` : null;

            const { data: newRes, error: createErr } = await supabase
                .from('restaurants')
                .insert([{
                    user_id: session.user.id,
                    name: place.name,
                    cuisine: place.types?.[0]?.replace(/_/g, ' ') || 'Restaurant',
                    zone: place.vicinity || place.formatted_address,
                    coordinates: formattedCoords,
                    image_url: place.photos?.[0]?.getUrl() || null,
                    rating: place.rating || null,
                    is_visited: false,
                    date_added: new Date().toISOString()
                }])
                .select()
                .single();

            if (createErr) {
                console.error("Add Google Place Error:", createErr);
                return { success: false, error: createErr.message };
            }
            restaurant = newRes;

            // Format coordinates back for local state if needed
            let storableRes = newRes;
            if (formattedCoords && coords) {
                storableRes = { ...newRes, coordinates: { x: coords.lat(), y: coords.lng() } };
            }

            // Add to local state
            set(state => ({ restaurants: [storableRes, ...state.restaurants] }));
        }

        // 3. Link to club
        return get().addRestaurantToClub(clubId, restaurant.id);
    },

    updateClub: async (clubId, updates) => {
        const { data, error } = await supabase
            .from('clubs')
            .update(updates)
            .eq('id', clubId)
            .select()
            .single();

        if (error) {
            console.error("Update Club Error:", error);
            return { success: false, error: error.message };
        }

        // Update local state
        set(state => ({
            clubs: state.clubs.map(c => c.id === clubId ? { ...c, ...data } : c),
            clubDetails: state.clubDetails?.id === clubId ? { ...state.clubDetails, ...data } : state.clubDetails
        }));

        return { success: true, data };
    },

    deleteClub: async (clubId) => {
        const { data, error } = await supabase
            .from('clubs')
            .delete()
            .eq('id', clubId)
            .select();

        if (error) {
            console.error("Delete Club Error:", error);
            return { success: false, error: error.message };
        }

        if (!data || data.length === 0) {
            return { success: false, error: 'No tienes permisos para borrar este club o ya fue eliminado.' };
        }

        // Update local state
        set(state => ({
            clubs: state.clubs.filter(c => c.id !== clubId),
            clubDetails: state.clubDetails?.id === clubId ? null : state.clubDetails
        }));

        return { success: true };
    },

    // --- Rankings Functionality ---
    rankings: [],
    userRank: null,
    fetchRankings: async () => {
        set({ loading: true });
        try {
            // 1. Fetch all profiles
            const { data: profiles, error: pError } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url');

            if (pError) throw pError;

            // 2. Fetch all visited restaurant counts
            // Note: This assumes RLS allows public select of is_visited and user_id for global ranking
            const { data: visits, error: vError } = await supabase
                .from('restaurants')
                .select('user_id')
                .eq('is_visited', true);

            if (vError) throw vError;

            // 3. Aggregate counts
            const counts = (visits || []).reduce((acc, v) => {
                acc[v.user_id] = (acc[v.user_id] || 0) + 1;
                return acc;
            }, {});

            // 4. Combine and Sort
            const allRankings = profiles.map(p => ({
                ...p,
                visit_count: counts[p.id] || 0
            })).sort((a, b) => b.visit_count - a.visit_count);

            // 5. Detect User Rank
            const { data: { session } } = await supabase.auth.getSession();
            const currentUserId = session?.user?.id;
            const rankIndex = allRankings.findIndex(r => r.id === currentUserId);

            set({
                rankings: allRankings,
                userRank: rankIndex !== -1 ? rankIndex + 1 : null,
                loading: false
            });
            return { success: true };
        } catch (error) {
            console.error("fetchRankings Error:", error);
            set({ loading: false });
            return { success: false, error: error.message };
        }
    }
}));
