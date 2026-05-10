import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MockPage({ title, icon: Icon, description }) {
    const navigate = useNavigate();

    return (
        <div className="pb-32 bg-[#F8FAFC] min-h-screen">
            {/* Header */}
            <header className="bg-white px-6 pt-10 pb-6 rounded-b-[3.5rem] shadow-xl shadow-slate-200/20 relative z-10 transition-all border-b border-gray-50 flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="p-3 bg-[#F1F3F6] rounded-full active:scale-95 transition-transform"
                >
                    <ChevronLeft size={20} className="text-brand-dark" />
                </button>
                <h1 className="text-lg font-black text-brand-dark uppercase tracking-tight flex-1 text-center mr-10">{title}</h1>
            </header>

            <div className="px-8 mt-24 flex flex-col items-center justify-center text-center">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center mb-8 border-4 border-white/50"
                >
                    <Icon size={48} className="text-slate-200" />
                </motion.div>

                <motion.h2 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-black text-brand-dark uppercase tracking-tight mb-4"
                >
                    Coming Soon
                </motion.h2>

                <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed px-4"
                >
                    {description}
                </motion.p>

                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => navigate(-1)}
                    className="mt-12 bg-brand-dark text-white font-black py-4 px-10 rounded-[1.5rem] uppercase tracking-widest text-[10px] shadow-xl active:scale-95 transition-all"
                >
                    Go Back
                </motion.button>
            </div>
        </div>
    );
}
