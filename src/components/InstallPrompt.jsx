import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useStore } from '../lib/store';

// Store the prompt globally in case the component mounts after the event
let globalDeferredPrompt = null;
let globalHasDismissed = false;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    globalDeferredPrompt = e;
});

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const profile = useStore(state => state.profile);

    useEffect(() => {
        // Only target mobile browsers
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (!isMobile) return;
        
        // Only show if user has finished the tour
        if (!profile || !profile.has_seen_tour) return;

        const hasDismissed = localStorage.getItem('foodie_install_dismissed');
        globalHasDismissed = !!hasDismissed;

        const checkPrompt = () => {
            if (globalDeferredPrompt && !globalHasDismissed && !showPrompt) {
                setDeferredPrompt(globalDeferredPrompt);
                // Wait a few seconds before showing so it doesn't overlap immediately with page load
                setTimeout(() => setShowPrompt(true), 3000);
            }
        };

        checkPrompt();

        const handler = (e) => {
            e.preventDefault();
            globalDeferredPrompt = e;
            if (!globalHasDismissed) {
                setDeferredPrompt(e);
                setTimeout(() => setShowPrompt(true), 3000);
            }
        };

        window.addEventListener('beforeinstallprompt', handler);

        // We could also poll briefly to catch if it happens slightly after mount
        const interval = setInterval(checkPrompt, 1000);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            clearInterval(interval);
        };
    }, [showPrompt]);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        
        setShowPrompt(false);
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        globalDeferredPrompt = null;
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('foodie_install_dismissed', 'true');
        globalHasDismissed = true;
    };

    return (
        <AnimatePresence>
            {showPrompt && (
                <div className="fixed inset-0 z-[1000] flex items-end justify-center sm:items-center px-4 pb-20 sm:p-0 pointer-events-none">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                        onClick={handleDismiss}
                    />
                    
                    <motion.div
                        initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="bg-white w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl relative pointer-events-auto flex flex-col items-center text-center overflow-hidden border border-gray-100"
                    >
                        <button 
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-2 bg-gray-50 rounded-full text-gray-400 active:scale-95 transition-all"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                        
                        <div className="w-16 h-16 bg-gradient-to-br from-brand-orange/20 to-brand-orange/5 rounded-2xl flex items-center justify-center mb-5 border border-brand-orange/20 shadow-lg">
                            <BrandLogo size={32} animate={false} />
                        </div>
                        
                        <h3 className="text-xl font-black text-brand-dark uppercase tracking-tight leading-tight mb-2">
                            Instala Hello Foodie
                        </h3>
                        <p className="text-[11px] text-gray-500 uppercase font-bold tracking-[0.1em] mb-6 leading-relaxed px-2">
                            ¿Deseas instalar el app en tu móvil para una experiencia más rápida y acceso sin conexión?
                        </p>
                        
                        <button 
                            onClick={handleInstall}
                            className="w-full bg-brand-dark text-white font-black uppercase tracking-widest text-[11px] py-4 rounded-[1.5rem] shadow-xl shadow-brand-dark/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <Download size={16} />
                            Instalar App
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
