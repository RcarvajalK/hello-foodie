import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, DollarSign, MessageSquare } from 'lucide-react';
import clsx from 'clsx';

export default function RecommendationModal({ isOpen, onClose, onSubmit, mode = 'add' }) {
    const [rating, setRating] = useState(0);
    const [spend, setSpend] = useState('');
    const [tip, setTip] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        if (rating === 0) {
            setError('Please select a rating.');
            return;
        }

        if (mode === 'add') {
            if (!spend || isNaN(spend)) {
                setError('Please enter a valid average spend.');
                return;
            }
            if (!tip.trim()) {
                setError('Please add a Pro Tip or comment.');
                return;
            }
        }

        setError('');
        onSubmit({
            rating,
            average_spend: mode === 'add' ? parseFloat(spend) : null,
            pro_tip: mode === 'add' ? tip.trim() : null
        });

        // Reset
        setRating(0);
        setSpend('');
        setTip('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-brand-dark/80 backdrop-blur-sm" 
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                        animate={{ scale: 1, opacity: 1, y: 0 }} 
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black text-brand-dark uppercase tracking-tight text-xl">
                                {mode === 'add' ? 'Community Rating' : 'Adjust Rating'}
                            </h3>
                            <button onClick={onClose} className="p-2 text-gray-300 hover:text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Rating */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Star size={12} className="text-brand-orange" /> Your Score (1-5)
                                </label>
                                <div className="flex justify-between px-2 bg-slate-50 py-4 rounded-2xl border border-slate-100">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button key={s} onClick={() => setRating(s)} className="transition-transform active:scale-90">
                                            <Star size={32} className={clsx("transition-colors", s <= rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200")} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {mode === 'add' && (
                                <>
                                    {/* Average Spend */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <DollarSign size={12} className="text-brand-green" /> Average Spend
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                <span className="text-brand-dark font-black">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full bg-slate-50 pl-8 pr-4 py-4 rounded-2xl font-black text-brand-dark border border-slate-100 focus:border-brand-green/30 focus:ring-4 focus:ring-brand-green/10 focus:outline-none transition-all text-sm"
                                                placeholder="e.g. 500"
                                                value={spend}
                                                onChange={(e) => setSpend(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Pro Tip */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare size={12} className="text-blue-500" /> Pro Tip (Required)
                                        </label>
                                        <textarea
                                            className="w-full bg-slate-50 p-4 rounded-2xl font-medium text-brand-dark border border-slate-100 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-sm resize-none min-h-[100px]"
                                            placeholder="What should people order? Any hidden gems?"
                                            value={tip}
                                            onChange={(e) => setTip(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <button
                                onClick={handleSubmit}
                                className="w-full bg-brand-dark text-white font-black py-4 rounded-[1.5rem] flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all mt-4 uppercase tracking-widest text-xs"
                            >
                                {mode === 'add' ? 'Submit Recommendation' : 'Confirm Rating'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
