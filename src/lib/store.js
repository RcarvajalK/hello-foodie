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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("No user found for addRestaurant");
            set({ loading: false });
            return null;
        }

        // Format coordinates for Postgres 'point' type: (lng, lat)
        // Note: Google Places uses lat() and lng(), we should probably map to (lng, lat)
        const coords = restaurantData.coordinates;
        const formattedCoords = coords ? `(${coords.y}, ${coords.x})` : null;

        const payload = {
            ...restaurantData,
            user_id: user.id,
            coordinates: formattedCoords,
            date_added: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('restaurants')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error("Supabase Add Error:", error.message, error.details);
            set({ loading: false });
            return null;
        }

        set((state) => ({
            restaurants: [data, ...state.restaurants],
            loading: false
        }));
        return data;
    },

    // Toggle visited status in DB with optional review
    toggleVisited: async (id, currentStatus, review = null) => {
        const updateData = { is_visited: !currentStatus };
        if (review) {
            updateData.rating = review.rating;
            updateData.review_comment = review.comment;
            updateData.visited_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('restaurants')
            .update(updateData)
            .eq('id', id);

        if (!error) {
            set((state) => ({
                restaurants: state.restaurants.map((r) =>
                    r.id === id ? { ...r, ...updateData } : r
                )
            }));
        }
    },

    // Update restaurant details
    updateRestaurant: async (id, updates) => {
        const { error } = await supabase
            .from('restaurants')
            .update(updates)
            .eq('id', id);

        if (!error) {
            set((state) => ({
                restaurants: state.restaurants.map((r) =>
                    r.id === id ? { ...r, ...updates } : r
                )
            }));
        }
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
}));
