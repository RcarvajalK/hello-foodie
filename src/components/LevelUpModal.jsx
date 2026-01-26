import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../lib/store';
import { Trophy, Share2, X, Star, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function LevelUpModal() {
    const showLevelUpModal = useStore(state => state.showLevelUpModal);
    const setLevelUpModal = useStore(state => state.setLevelUpModal);

    useEffect(() => {
        if (showLevelUpModal) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF6B6B', '#4ECDC4', '#FFE66D']
            });
        }
    }, [showLevelUpModal]);

    if (!showLevelUpModal) return null;

    const { newLevel } = showLevelUpModal;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setLevelUpModal(null)}
                    className="absolute inset-0 bg-brand-dark/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 p-8 flex flex-col items-center text-center"
                >
                    <button
                        onClick={() => setLevelUpModal(null)}
                        className="absolute top-6 right-6 text-gray-400 p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="relative mb-8 pt-4">
                        <div className="w-24 h-24 bg-brand-orange rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-brand-orange/20 relative z-10">
                            <Trophy size={48} className="text-white" />
                        </div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="absolute -bottom-2 -right-2 bg-brand-green text-white w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg z-20"
                        >
                            <CheckCircle2 size={24} />
                        </motion.div>
                        <div className="absolute inset-0 bg-brand-orange/20 blur-3xl rounded-full animate-pulse" />
                    </div>

                    <h2 className="text-3xl font-black text-brand-orange uppercase leading-none mb-2">Congratulations!</h2>
                    <p className="text-lg font-black text-brand-dark uppercase tracking-tight mb-4">You reached Level {newLevel.level}: {newLevel.name}</p>

                    <p className="text-xs text-gray-400 font-bold uppercase tracking-tight mb-8 leading-relaxed px-4">
                        {newLevel.description} You're now part of the Hello Foodie! elite.
                    </p>

                    <div className="w-full flex items-center justify-between gap-4 mb-8 bg-slate-50 p-4 rounded-3xl">
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center shadow-md mb-1">
                                <CheckCircle2 size={16} />
                            </div>
                            <span className="text-[8px] font-black uppercase text-gray-400">Enthusiast</span>
                        </div>
                        <div className="flex-1 h-0.5 bg-gray-200 relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="h-full bg-brand-orange"
                            />
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-md mb-1 animate-bounce">
                                <Star size={16} fill="currentColor" />
                            </div>
                            <span className="text-[8px] font-black uppercase text-brand-orange">{newLevel.name}</span>
                        </div>
                    </div>

                    <div className="w-full space-y-3">
                        <button
                            onClick={() => setLevelUpModal(null)}
                            className="w-full bg-brand-orange text-white font-black py-4 rounded-[1.5rem] shadow-xl shadow-brand-orange/30 active:scale-95 transition-all text-sm uppercase tracking-widest"
                        >
                            See my benefits
                        </button>
                        <button className="w-full bg-white text-gray-500 font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 active:scale-95 transition-all text-[10px] uppercase tracking-widest hover:bg-slate-50 border border-slate-100">
                            <Share2 size={14} />
                            Share my achievement
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
