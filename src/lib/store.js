import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockRestaurants } from './data';

export const useStore = create(
    persist(
        (set) => ({
            // Initial State
            savedIds: [],
            visitedIds: [],
            userInfo: {
                name: 'Guest User',
                stats: { reviews: 0, photos: 0 },
            },

            // Actions
            toggleSave: (id) => set((state) => {
                const isSaved = state.savedIds.includes(id);
                return {
                    savedIds: isSaved
                        ? state.savedIds.filter(itemId => itemId !== id)
                        : [...state.savedIds, id]
                };
            }),

            markVisited: (id) => set((state) => {
                if (state.visitedIds.includes(id)) return state;
                return { visitedIds: [...state.visitedIds, id] };
            }),

            // Selectors (Helpers)
            isSaved: (id) => (state) => state.savedIds.includes(id),
            isVisited: (id) => (state) => state.visitedIds.includes(id),
        }),
        {
            name: 'hello-foodie-storage', // unique name
        }
    )
);
