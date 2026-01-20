import { create } from 'zustand';
import { supabase } from './supabase';

export const useStore = create((set, get) => ({
    restaurants: [],
    profile: null,
    loading: false,
    notificationPreferences: {
        nearby: true,
        lunch: true,
        dinner: true
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
            .order('date_added', { ascending: false });

        if (!error) {
            const parsedData = (data || []).map(r => {
                if (typeof r.coordinates === 'string' && r.coordinates.includes('(')) {
                    const [lng, lat] = r.coordinates.replace(/[()]/g, '').split(',').map(Number);
                    return { ...r, coordinates: { x: lat, y: lng } };
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
        const formattedCoords = coords ? `(${coords.y}, ${coords.x})` : null;

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
            newData = { ...newData, coordinates: { x: lat, y: lng } };
        }

        set((state) => ({
            restaurants: [newData, ...state.restaurants],
            loading: false
        }));
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
            set((state) => ({
                restaurants: state.restaurants.map((r) =>
                    r.id === id ? { ...r, ...updateData } : r
                )
            }));
            return { success: true };
        }

        const errorMsg = error ? error.message : "No rows updated. (Check RLS policies)";
        console.error("Supabase Update Error:", error || errorMsg);
        return { success: false, error: errorMsg };
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

        if (!error) set({ profile: data });
        return { data, error };
    },

    // Delete restaurant
    deleteRestaurant: async (id) => {
        const { error } = await supabase
            .from('restaurants')
            .delete()
            .eq('id', id);

        if (!error) {
            set((state) => ({
                restaurants: state.restaurants.filter((r) => r.id !== id)
            }));
        }
    },

    // --- Clubs Functionality ---
    clubs: [],
    fetchClubs: async () => {
        const { data, error } = await supabase
            .from('clubs')
            .select('*, club_members(count)');
        if (!error) {
            set({ clubs: data || [] });
        }
    },

    createClub: async (clubData) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data, error } = await supabase
            .from('clubs')
            .insert([{ ...clubData, created_by: session.user.id }])
            .select()
            .single();

        if (error) return null;

        // Auto-join creator
        await supabase.from('club_members').insert([{ club_id: data.id, user_id: session.user.id, role: 'admin' }]);

        set(state => ({ clubs: [data, ...state.clubs] }));
        return data;
    },

    joinClub: async (clubId) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return false;

        const { error } = await supabase
            .from('club_members')
            .insert([{ club_id: clubId, user_id: session.user.id, role: 'member' }]);

        return !error;
    }
}));
