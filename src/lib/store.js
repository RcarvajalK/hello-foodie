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

        const newData = data;
        if (typeof newData.coordinates === 'string' && newData.coordinates.includes('(')) {
            const [lng, lat] = newData.coordinates.replace(/[()]/g, '').split(',').map(Number);
            newData.coordinates = { x: lat, y: lng };
        }

        set((state) => ({
            restaurants: [newData, ...state.restaurants],
            loading: false
        }));
        return newData;
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
            return true;
        }
        return false;
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
