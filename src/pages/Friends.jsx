import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../lib/store';
import { Users, Search, ChevronLeft, Loader2, X, AtSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const USERNAME_REGEX = /^[a-z0-9_@]{1,30}$/;

export default function Friends() {
    const fetchFriends = useStore(state => state.fetchFriends);
    const friends = useStore(state => state.friends);
    const searchUserByUsername = useStore(state => state.searchUserByUsername);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchTimer, setSearchTimer] = useState(null);

    useEffect(() => {
        fetchFriends();
    }, [fetchFriends]);

    const handleSearchChange = useCallback((e) => {
        const val = e.target.value;
        setSearchQuery(val);
        setHasSearched(false);

        if (searchTimer) clearTimeout(searchTimer);

        const clean = val.replace('@', '').trim();
        if (!clean || clean.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const id = setTimeout(async () => {
            const result = await searchUserByUsername(clean);
            setSearchResults(result.data || []);
            setIsSearching(false);
            setHasSearched(true);
        }, 500);
        setSearchTimer(id);
    }, [searchTimer, searchUserByUsername]);

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
        setIsSearching(false);
    };

    const isSearchActive = searchQuery.length >= 2;

    return (
        <div className="pb-24 bg-brand-light min-h-screen">
            {/* Header */}
            <div className="pt-16 px-8 pb-8 bg-white rounded-b-[3.5rem] shadow-sm flex items-end gap-4 relative">
                <button
                    onClick={() => navigate('/social')}
                    className="p-3 bg-slate-50 text-slate-400 rounded-2xl active:scale-90 transition-all absolute top-12 left-6"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="mt-8">
                    <h1 className="text-4xl font-black text-brand-dark uppercase tracking-tight italic leading-none mb-2">
                        My <span className="text-brand-orange">Friends</span>
                    </h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Your Foodie Network</p>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Search Bar */}
                <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange font-black text-base select-none pointer-events-none">@</span>
                    <input
                        id="friend-search-input"
                        type="text"
                        placeholder="Search by username…"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full bg-white border border-slate-100 p-4 pl-10 pr-12 rounded-2xl text-brand-dark font-bold text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {isSearching && <Loader2 size={16} className="animate-spin text-brand-orange/50" />}
                        {!isSearching && searchQuery.length > 0 && (
                            <button onClick={clearSearch} className="text-slate-300 hover:text-slate-500 transition-colors">
                                <X size={16} />
                            </button>
                        )}
                        {!isSearching && searchQuery.length === 0 && (
                            <Search size={16} className="text-slate-300" />
                        )}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* ── Search Results ── */}
                    {isSearchActive && (
                        <motion.div
                            key="search-results"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">
                                {isSearching ? 'Searching…' : hasSearched ? `${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchQuery.replace('@', '')}"` : ''}
                            </p>

                            {!isSearching && hasSearched && searchResults.length === 0 && (
                                <div className="bg-white rounded-[2.5rem] p-8 text-center shadow-sm border border-gray-50">
                                    <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                                        <AtSign size={28} className="text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        No foodies found for <span className="text-brand-orange">@{searchQuery.replace('@', '')}</span>
                                    </p>
                                </div>
                            )}

                            {searchResults.map((user) => (
                                <motion.div
                                    key={user.id}
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-4 rounded-[2.5rem] flex items-center gap-4 shadow-sm border border-gray-50"
                                >
                                    <div className="w-14 h-14 rounded-[1.8rem] overflow-hidden border-2 border-brand-light shadow-inner shrink-0 bg-slate-50">
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                className="w-full h-full object-cover"
                                                alt={user.full_name}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center font-black text-2xl text-brand-orange">
                                                {user.full_name?.charAt(0) || user.username?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-brand-dark text-[12px] uppercase tracking-tight truncate">
                                            {user.full_name || 'Foodie'}
                                        </h4>
                                        <p className="text-[9px] font-black text-brand-orange uppercase tracking-[0.15em] mt-0.5">
                                            @{user.username}
                                        </p>
                                        {user.bio && (
                                            <p className="text-[9px] text-slate-400 font-bold mt-1 truncate">{user.bio}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* ── Crew (from clubs) ── */}
                    {!isSearchActive && (
                        <motion.div
                            key="friends-list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2">Your Foodie Crew</p>

                            {friends.length > 0 ? (
                                friends.map((friend) => (
                                    <div key={friend.id} className="bg-white p-4 rounded-[2.5rem] flex items-center gap-4 shadow-sm border border-gray-50">
                                        <div className="w-14 h-14 rounded-[1.8rem] overflow-hidden border-2 border-brand-light shadow-inner shrink-0">
                                            <img
                                                src={friend.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                                                className="w-full h-full object-cover"
                                                alt={friend.full_name}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-brand-dark text-[11px] uppercase tracking-tight truncate">
                                                {friend.full_name || 'Incognito Foodie'}
                                            </h4>
                                            {friend.username ? (
                                                <p className="text-[9px] font-black text-brand-orange uppercase tracking-[0.15em] mt-0.5">
                                                    @{friend.username}
                                                </p>
                                            ) : (
                                                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mt-0.5">
                                                    {friend.role || 'Member'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-24 text-center">
                                    <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center text-gray-200 mx-auto mb-6 shadow-sm">
                                        <Users size={40} />
                                    </div>
                                    <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight italic mb-2">Flying solo?</h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-12 leading-relaxed">
                                        Search a <span className="text-brand-orange">@username</span> above, or join a Club to connect with other foodies.
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
