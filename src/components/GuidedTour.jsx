import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Sparkles, Plus, BarChart3, Filter, Users, LayoutGrid } from 'lucide-react';
import { useStore } from '../lib/store';
import clsx from 'clsx';

const TOUR_STEPS = [
    {
        id: 'welcome',
        title: "Hello Foodie! 🍔",
        content: "Welcome to your new culinary bucket list. Ready for a 30-second tour of your new superpowers?",
        icon: <Sparkles className="text-brand-orange" size={24} />,
        target: null, // Center of screen
    },
    {
        id: 'add',
        title: "Add a Place ➕",
        content: "This is where the magic starts. Add any restaurant from Google Places or manually. We'll handle the photos and details for you!",
        icon: <Plus className="text-brand-orange" size={24} />,
        target: '#tour-add',
    },
    {
        id: 'stats',
        title: "Track your Progress 📈",
        content: "See how many places you've conquered, which ones are pending, and your absolute favorites at a glance.",
        icon: <BarChart3 className="text-brand-orange" size={24} />,
        target: '#tour-stats',
    },
    {
        id: 'filters',
        title: "Smart Filters 🔍",
        content: "Hungry for Italian in Polanco? Use these filters to find the perfect spot in your list instantly.",
        icon: <Filter className="text-brand-orange" size={24} />,
        target: '#tour-filters',
    },
    {
        id: 'view',
        title: "Your Choice 🖼️",
        content: "Switch between a clean clinical list or a beautiful mosaic gallery of food photos.",
        icon: <LayoutGrid className="text-brand-orange" size={24} />,
        target: '#tour-view-modes',
    },
    {
        id: 'social',
        title: "Foodie Community 👥",
        content: "Connect with friends, join clubs, and see where everyone is eating today. Sharing is caring!",
        icon: <Users className="text-brand-orange" size={24} />,
        target: '#tour-social',
    }
];

export default function GuidedTour() {
    const profile = useStore(state => state.profile);
    const updateProfile = useStore(state => state.updateProfile);
    
    // We use a local state combined with profile to decide if showing
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        // Check if user has already seen the tour (via profile or localStorage fallback)
        const hasSeenTour = profile?.has_seen_tour || localStorage.getItem('foodie_seen_tour');
        if (!hasSeenTour && profile?.has_onboarded) {
            // Tiny delay to ensure Home page is rendered
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, [profile]);

    useLayoutEffect(() => {
        if (!isVisible) return;

        const step = TOUR_STEPS[currentStep];
        if (!step.target) {
            setTargetRect(null);
            return;
        }

        const updateRect = () => {
            const el = document.querySelector(step.target);
            if (el) {
                const rect = el.getBoundingClientRect();
                setTargetRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
            }
        };

        updateRect();
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
    }, [currentStep, isVisible]);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentStep(s => s + 1);
                setIsTransitioning(false);
            }, 300);
        } else {
            handleComplete();
        }
    };

    const handleComplete = async () => {
        setIsVisible(false);
        localStorage.setItem('foodie_seen_tour', 'true');
        if (profile) {
            await updateProfile({ has_seen_tour: true });
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (!isVisible) return null;

    const step = TOUR_STEPS[currentStep];

    return (
        <div className="fixed inset-0 z-[200] pointer-events-none">
            {/* Dark Overlay with Hole */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-brand-dark/70 backdrop-blur-[2px] pointer-events-auto"
                style={{
                    clipPath: targetRect 
                        ? `polygon(0% 0%, 0% 100%, ${targetRect.left - 10}px 100%, ${targetRect.left - 10}px ${targetRect.top - 10}px, ${targetRect.left + targetRect.width + 10}px ${targetRect.top - 10}px, ${targetRect.left + targetRect.width + 10}px ${targetRect.top + targetRect.height + 10}px, ${targetRect.left - 10}px ${targetRect.top + targetRect.height + 10}px, ${targetRect.left - 10}px 100%, 100% 100%, 100% 0%)`
                        : 'none'
                }}
            />

            {/* Tooltip Content */}
            <div className="absolute inset-0 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: isTransitioning ? 0 : 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className={clsx(
                            "bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl pointer-events-auto relative",
                            targetRect ? "mt-[-20vh]" : "" // Shift up slightly when highlighting bottom items
                        )}
                        style={targetRect ? {
                            position: 'absolute',
                            // Logic to position tooltip near the target
                            top: targetRect.top > window.innerHeight / 2 ? 'auto' : targetRect.top + targetRect.height + 40,
                            bottom: targetRect.top > window.innerHeight / 2 ? (window.innerHeight - targetRect.top) + 40 : 'auto',
                        } : {}}
                    >
                        <button 
                            onClick={handleSkip}
                            className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-brand-orange/10 rounded-2xl">
                                {step.icon}
                            </div>
                            <h4 className="text-lg font-black text-brand-dark uppercase tracking-tight italic">
                                {step.title}
                            </h4>
                        </div>

                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
                            {step.content}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex gap-1.5">
                                {TOUR_STEPS.map((_, i) => (
                                    <div 
                                        key={i} 
                                        className={clsx(
                                            "h-1 rounded-full transition-all duration-300",
                                            i === currentStep ? "w-6 bg-brand-orange" : "w-1.5 bg-gray-100"
                                        )} 
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleNext}
                                className="bg-brand-dark text-white px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-brand-dark/20"
                            >
                                {currentStep === TOUR_STEPS.length - 1 ? 'Got it!' : 'Next'}
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
