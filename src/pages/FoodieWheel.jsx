import { useState, useMemo, useRef, useEffect } from 'react';
import { useStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Plus, X, Search, Trophy, MapPin, Star, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import confetti from 'canvas-confetti';
import clsx from 'clsx';

export default function FoodieWheel() {
    const navigate = useNavigate();
    const restaurants = useStore(state => state.restaurants);
    const clubs = useStore(state => state.clubs);
    const fetchClubs = useStore(state => state.fetchClubs);
    const fetchRestaurants = useStore(state => state.fetchRestaurants);
    
    const [selectedIds, setSelectedIds] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSelectionOpen, setIsSelectionOpen] = useState(true);

    const [filters, setFilters] = useState({
        area: 'All',
        cuisine: 'All',
        price: 'All',
        rating: 'All',
        source: 'All',
        includeVisited: false,
        includeFavorites: false
    });
    const [openFilter, setOpenFilter] = useState(null);

    const [clubRestaurants, setClubRestaurants] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            await Promise.all([
                fetchRestaurants(),
                fetchClubs()
            ]);
            
            // Fetch all restaurants from all member clubs
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: memberClubs } = await supabase
                .from('club_members')
                .select('club_id')
                .eq('user_id', session.user.id);

            if (memberClubs && memberClubs.length > 0) {
                const clubIds = memberClubs.map(m => m.club_id);
                const { data: clubRests } = await supabase
                    .from('club_restaurants')
                    .select('club_id, clubs(name), restaurant:restaurants(*)')
                    .in('club_id', clubIds);

                if (clubRests) {
                    const formatted = clubRests.map(cr => ({
                        ...cr.restaurant,
                        source: `Club: ${cr.clubs?.name}`,
                        club_id: cr.club_id
                    })).filter(r => r.id); // Ensure restaurant exists
                    setClubRestaurants(formatted);
                }
            }
        };
        loadInitialData();
    }, []);

    const toVisit = useMemo(() => {
        return restaurants.filter(r => !r.is_visited);
    }, [restaurants]);

    const allOptions = useMemo(() => {
        const myOnes = restaurants.map(r => ({ ...r, source: 'My List' }));
        
        // Deduplicate by ID, but prioritize 'My List'
        const combined = [...myOnes, ...clubRestaurants];
        const unique = [];
        const seen = new Set();
        combined.forEach(r => {
            if (!seen.has(r.id)) {
                unique.push(r);
                seen.add(r.id);
            }
        });
        
        return unique;
    }, [restaurants, clubRestaurants]);

    const filteredOptions = useMemo(() => {
        let list = [...allOptions];

        // Status filters
        if (!filters.includeVisited) {
            list = list.filter(r => !r.is_visited);
        }
        if (filters.includeFavorites) {
            list = list.filter(r => r.is_favorite);
        }

        // Search
        if (searchQuery) {
            list = list.filter(r => 
                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.cuisine?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Advanced Filters
        if (filters.area !== 'All') {
            list = list.filter(r => r.zone?.toLowerCase().includes(filters.area.toLowerCase()));
        }
        if (filters.cuisine !== 'All') {
            list = list.filter(r => r.cuisine?.toLowerCase().includes(filters.cuisine.toLowerCase()));
        }
        if (filters.price !== 'All') {
            list = list.filter(r => r.price === filters.price);
        }
        if (filters.rating !== 'All') {
            const minRating = parseFloat(filters.rating);
            list = list.filter(r => (r.rating || 0) >= minRating);
        }
        if (filters.source !== 'All') {
            list = list.filter(r => r.source === filters.source);
        }

        return list;
    }, [allOptions, searchQuery, filters]);

    // Options for filter dropdowns
    const areaOptions = useMemo(() => ['All', ...new Set(allOptions.map(r => r.zone?.split(',')[0]).filter(Boolean))].sort(), [allOptions]);
    const cuisineOptions = useMemo(() => {
        const cuisines = new Set();
        allOptions.forEach(r => r.cuisine?.split(',').forEach(c => cuisines.add(c.trim())));
        return ['All', ...Array.from(cuisines)].sort();
    }, [allOptions]);
    const sourceOptions = useMemo(() => ['All', 'My List', ...clubs.map(c => `Club: ${c.name}`)], [clubs]);

    const selectedRestaurants = useMemo(() => {
        return allOptions.filter(r => selectedIds.includes(r.id));
    }, [allOptions, selectedIds]);

    const toggleSelection = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            if (selectedIds.length >= 6) {
                return;
            }
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleSpin = () => {
        if (selectedIds.length < 2) {
            alert("Select at least 2 restaurants!");
            return;
        }

        setIsSpinning(true);
        setIsSelectionOpen(false);
        setWinner(null);

        // Calculate a random winner
        const randomIndex = Math.floor(Math.random() * selectedRestaurants.length);
        const winResult = selectedRestaurants[randomIndex];

        // Simulate spin time
        setTimeout(() => {
            setIsSpinning(false);
            setWinner(winResult);
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FB923C', '#F43F5E', '#FFFFFF']
            });
        }, 3000); // 3 seconds spin
    };

    // Roulette Animation Logic
    const spinItems = useMemo(() => {
        if (selectedRestaurants.length === 0) return [];
        // Repeat the list many times to create the scrolling illusion
        const result = [];
        for (let i = 0; i < 20; i++) {
            result.push(...selectedRestaurants);
        }
        return result;
    }, [selectedRestaurants]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-24 overflow-hidden relative">
            {/* Header */}
            <header className="px-6 pt-10 pb-6 bg-white rounded-b-[3rem] shadow-xl shadow-slate-200/20 flex items-center gap-4 relative z-20">
                <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl active:scale-90 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-xl font-black text-brand-dark uppercase tracking-tight">Foodie Roulette</h1>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Can't decide? Let's spin!</p>
                </div>
            </header>

            <main className="px-6 py-8">
                {/* Roulette View */}
                <div className="relative h-[400px] w-full flex flex-col items-center justify-center">
                    {selectedRestaurants.length > 0 ? (
                        <div className="w-full max-w-sm relative">
                            {/* The Wheel/Slot Machine */}
                            <div className="h-48 w-full bg-white rounded-[3rem] shadow-2xl border-4 border-slate-50 overflow-hidden relative">
                                {/* Center Indicator */}
                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-brand-orange shadow-[0_0_15px_rgba(251,146,60,0.5)] z-10 -translate-y-1/2" />
                                
                                <motion.div
                                    animate={isSpinning ? {
                                        y: [0, -((spinItems.length - 5) * 60)], // Approximate height per item
                                    } : winner ? {
                                        y: -(spinItems.findIndex((item, idx) => idx > 10 && item.id === winner.id) * 60) + 60, // Land on winner
                                    } : { y: 0 }}
                                    transition={isSpinning ? {
                                        duration: 3,
                                        ease: "circIn",
                                    } : {
                                        duration: 0.8,
                                        type: "spring",
                                        bounce: 0.4
                                    }}
                                    className="flex flex-col items-center"
                                >
                                    {spinItems.map((res, i) => (
                                        <div key={`${res.id}-${i}`} className="h-[60px] flex items-center justify-center w-full px-4">
                                            <span className="text-sm font-black text-brand-dark uppercase tracking-tight truncate">{res.name}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                            {/* Trigger Button */}
                            <div className="mt-12 flex flex-col items-center">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleSpin}
                                    disabled={isSpinning || selectedIds.length < 2}
                                    className={clsx(
                                        "w-24 h-24 rounded-full shadow-2xl flex items-center justify-center transition-all relative z-10",
                                        isSpinning ? "opacity-50 grayscale" : "bg-white border-2 border-brand-orange/10"
                                    )}
                                >
                                    <BrandLogo size={64} animate={isSpinning} />
                                    {isSpinning && (
                                        <div className="absolute inset-0 rounded-full border-4 border-brand-orange border-t-transparent animate-spin" />
                                    )}
                                </motion.button>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-6 animate-pulse">
                                    {isSpinning ? "Consulting the stars..." : "Tap Logo to Spin"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 opacity-30">
                            <Sparkles size={64} className="mx-auto text-brand-orange mb-4" />
                            <p className="font-black uppercase tracking-widest text-xs">Pick your options first</p>
                        </div>
                    )}
                </div>

                {/* Winner Card */}
                <AnimatePresence>
                    {winner && !isSpinning && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 50 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 50 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center px-10 pointer-events-none"
                        >
                            <div className="bg-white rounded-[3.5rem] p-8 shadow-[0_50px_100px_rgba(0,0,0,0.3)] border border-brand-orange/20 text-center max-w-sm w-full pointer-events-auto relative overflow-hidden">
                                {/* Content */}
                                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-orange to-brand-orange-light" />
                                <Trophy className="text-brand-orange mx-auto mb-6" size={48} />
                                <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tight leading-tight mb-2">We have a winner!</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Fate has chosen for you</p>
                                
                                <div className="bg-slate-50 p-6 rounded-[2.5rem] mb-10 border border-slate-100">
                                    <h3 className="text-xl font-black text-brand-orange uppercase leading-tight mb-2">{winner.name}</h3>
                                    <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-400">
                                        <div className="flex items-center gap-1"><MapPin size={12} /> {winner.zone?.split(',')[0]}</div>
                                        <div className="flex items-center gap-1"><Star size={12} className="text-yellow-500 fill-yellow-500" /> {winner.rating || 'New'}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={() => navigate(`/restaurant/${winner.id}`)}
                                        className="w-full bg-brand-dark text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
                                    >
                                        Go There Now
                                    </button>
                                    <button 
                                        onClick={() => setWinner(null)}
                                        className="w-full bg-slate-100 text-slate-400 font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-all"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Selection Drawer Trigger */}
                {!isSpinning && (
                    <div className={clsx(
                        "fixed bottom-24 left-6 right-6 z-40 transition-all transform",
                        isSelectionOpen ? "translate-y-0" : "translate-y-[85%]"
                    )}>
                        <div className="bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] border-t border-slate-50 p-8 h-[70vh] flex flex-col">
                            <div 
                                className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 cursor-pointer active:bg-slate-200"
                                onClick={() => setIsSelectionOpen(!isSelectionOpen)}
                            />
                            
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-brand-dark uppercase tracking-tight">Select Options</h3>
                                <div className="bg-brand-orange/10 text-brand-orange px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                                    {selectedIds.length} / 6 Selected
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                                <FilterBadge 
                                    label="Area" 
                                    value={filters.area} 
                                    options={areaOptions} 
                                    onSelect={(val) => setFilters({...filters, area: val})} 
                                />
                                <FilterBadge 
                                    label="Cuisine" 
                                    value={filters.cuisine} 
                                    options={cuisineOptions} 
                                    onSelect={(val) => setFilters({...filters, cuisine: val})} 
                                />
                                <FilterBadge 
                                    label="Price" 
                                    value={filters.price} 
                                    options={['All', '$', '$$', '$$$', '$$$$']} 
                                    onSelect={(val) => setFilters({...filters, price: val})} 
                                />
                                <FilterBadge 
                                    label="Rating" 
                                    value={filters.rating} 
                                    options={['All', '4.5', '4.0', '3.5']} 
                                    onSelect={(val) => setFilters({...filters, rating: val})} 
                                />
                                <FilterBadge 
                                    label="Source" 
                                    value={filters.source} 
                                    options={sourceOptions} 
                                    onSelect={(val) => setFilters({...filters, source: val})} 
                                />
                            </div>

                            {/* Toggles */}
                            <div className="flex gap-4 mb-6">
                                <button 
                                    onClick={() => setFilters({...filters, includeVisited: !filters.includeVisited})}
                                    className={clsx(
                                        "flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                        filters.includeVisited ? "bg-brand-orange text-white" : "bg-slate-50 text-slate-400 border border-slate-100"
                                    )}
                                >
                                    Include Visited
                                </button>
                                <button 
                                    onClick={() => setFilters({...filters, includeFavorites: !filters.includeFavorites})}
                                    className={clsx(
                                        "flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                        filters.includeFavorites ? "bg-brand-orange text-white" : "bg-slate-50 text-slate-400 border border-slate-100"
                                    )}
                                >
                                    Include Favorites
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                <input 
                                    className="w-full bg-slate-50 py-3.5 px-12 rounded-2xl text-[10px] font-black uppercase tracking-widest placeholder-slate-300 focus:outline-none"
                                    placeholder="Search your list..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-32">
                                {filteredOptions.length > 0 ? filteredOptions.map(res => (
                                    <button 
                                        key={`${res.id}-${res.source}`}
                                        onClick={() => toggleSelection(res.id)}
                                        className={clsx(
                                            "w-full flex items-center gap-4 p-4 rounded-3xl transition-all border relative overflow-hidden",
                                            selectedIds.includes(res.id) 
                                                ? "bg-brand-orange/5 border-brand-orange/20" 
                                                : "bg-slate-50/50 border-transparent hover:bg-slate-50"
                                        )}
                                    >
                                        <div className={clsx(
                                            "w-6 h-6 rounded-lg flex items-center justify-center transition-all",
                                            selectedIds.includes(res.id) ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/30" : "bg-slate-100 text-transparent"
                                        )}>
                                            <Plus size={14} className={selectedIds.includes(res.id) ? "block" : "hidden"} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-black text-brand-dark uppercase tracking-tight truncate">{res.name}</p>
                                                {res.source !== 'My List' && (
                                                    <span className="text-[7px] font-black text-white bg-brand-orange px-1.5 py-0.5 rounded-md uppercase tracking-widest whitespace-nowrap">
                                                        Group
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{res.cuisine?.split(',')[0]} • {res.source}</p>
                                            </div>
                                        </div>
                                    </button>
                                )) : (
                                    <div className="py-20 text-center opacity-30">
                                        <p className="text-xs font-black uppercase tracking-widest">No restaurants found</p>
                                    </div>
                                )}
                            </div>

                            {/* Ready to Spin Button */}
                            <AnimatePresence>
                                {selectedIds.length >= 2 && (
                                    <motion.div 
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 100, opacity: 0 }}
                                        className="absolute bottom-6 left-8 right-8"
                                    >
                                        <button 
                                            onClick={() => setIsSelectionOpen(false)}
                                            className="w-full bg-brand-orange text-white font-black py-5 rounded-[2rem] uppercase tracking-[0.2em] text-[10px] shadow-[0_20px_40px_rgba(251,146,60,0.3)] flex items-center justify-center gap-3 active:scale-95 transition-all"
                                        >
                                            <Sparkles size={16} />
                                            Ready to Spin!
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

// Helper components for Foodie Roulette
function FilterBadge({ label, value, options, onSelect }) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const buttonRef = useRef(null);
    const [menuStyle, setMenuStyle] = useState({});

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setMenuStyle({
                position: 'fixed',
                bottom: window.innerHeight - rect.top + 12, // Position above the button
                left: Math.max(16, Math.min(rect.left, window.innerWidth - 170)),
                zIndex: 1000
            });
            setSearch(''); // Reset search when opening
        }
    }, [isOpen]);

    const filteredOptions = useMemo(() => {
        if (!search) return options;
        return options.filter(opt => 
            opt === 'All' || 
            opt.toLowerCase().includes(search.toLowerCase())
        );
    }, [options, search]);
    
    return (
        <div className="relative">
            <button 
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className={clsx(
                    "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border outline-none",
                    value !== 'All' ? "bg-brand-orange text-white border-brand-orange" : "bg-slate-50 text-slate-400 border-slate-100"
                )}
            >
                {label}: {value}
            </button>
            
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-[999]" onClick={() => setIsOpen(false)} />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            style={menuStyle}
                            className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 p-2 min-w-[180px] max-h-[300px] flex flex-col z-[1000] pointer-events-auto"
                        >
                            {options.length > 5 && (
                                <div className="p-2 mb-1 border-b border-slate-50 sticky top-0 bg-white z-10">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={12} />
                                        <input 
                                            autoFocus
                                            className="w-full bg-slate-50 py-2 pl-8 pr-4 rounded-xl text-[9px] font-black uppercase tracking-widest placeholder-slate-300 focus:outline-none"
                                            placeholder={`Search ${label}...`}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                            <div className="overflow-y-auto no-scrollbar flex-1">
                                {filteredOptions.length > 0 ? filteredOptions.map(opt => (
                                    <button 
                                        key={opt}
                                        onClick={() => { 
                                            onSelect(opt); 
                                            setIsOpen(false); 
                                        }}
                                        className={clsx(
                                            "w-full text-left px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all mb-1 last:mb-0",
                                            value === opt ? "bg-brand-orange text-white" : "text-slate-500 hover:bg-slate-50"
                                        )}
                                    >
                                        {opt}
                                    </button>
                                )) : (
                                    <div className="px-4 py-3 text-[9px] font-bold text-slate-300 uppercase italic">
                                        No results
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
