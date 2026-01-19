import { create } from 'zustand';
import { supabase } from './supabase';

export const useStore = create((set, get) => ({
    restaurants: [],
    profile: null,
    loading: false,

    // Fetch all restaurants for the current user
    fetchRestaurants: async () => {
        set({ loading: true });
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .order('date_added', { ascending: false });

        if (!error) set({ restaurants: data || [] });
        set({ loading: false });
    },

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('restaurants')
            .insert([{ ...restaurantData, user_id: user.id }])
            .select()
            .single();

        if (!error) {
            set((state) => ({ restaurants: [data, ...state.restaurants] }));
            return data;
        }
        return null;
    },

    // Toggle visited status in DB
    toggleVisited: async (id, currentStatus) => {
        const { error } = await supabase
            .from('restaurants')
            .update({ is_visited: !currentStatus })
            .eq('id', id);

        if (!error) {
            set((state) => ({
                restaurants: state.restaurants.map((r) =>
                    r.id === id ? { ...r, is_visited: !currentStatus } : r
                )
            }));
        }
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
