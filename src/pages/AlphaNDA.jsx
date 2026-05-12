import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AlphaNDA() {
    const navigate = useNavigate();
    const [accepted, setAccepted] = useState(false);

    const handleAccept = () => {
        localStorage.setItem('foodie_nda_signed', 'true');
        // Let the Guard in App.jsx handle redirecting if they came from somewhere specific, 
        // but normally we just send them to home.
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen bg-brand-dark flex flex-col justify-between p-6">
            <div className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/20 shadow-2xl"
                >
                    <ShieldAlert size={40} className="text-brand-orange" />
                </motion.div>
                
                <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-3xl font-black text-white uppercase tracking-tight text-center mb-2"
                >
                    Alpha Tester<br/>Agreement
                </motion.h1>
                
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 border border-white/10 p-8 rounded-[2.5rem] mt-8 text-center"
                >
                    <p className="text-white/80 text-sm font-bold leading-relaxed mb-8">
                        You have been selected to participate in the exclusive Alpha test for Hello Foodie. By proceeding, you agree to our confidentiality terms.
                    </p>
                    <ul className="text-left space-y-5 text-[10px] font-bold text-white/60 uppercase tracking-[0.15em] leading-relaxed">
                        <li className="flex gap-4">
                            <CheckCircle2 size={18} className="text-brand-orange shrink-0 mt-0.5" />
                            <span>This is an early version; you may encounter bugs.</span>
                        </li>
                        <li className="flex gap-4">
                            <CheckCircle2 size={18} className="text-brand-orange shrink-0 mt-0.5" />
                            <span>You agree not to copy, reverse engineer, or steal the concepts presented.</span>
                        </li>
                        <li className="flex gap-4">
                            <CheckCircle2 size={18} className="text-brand-orange shrink-0 mt-0.5" />
                            <span>Your feedback is crucial to improve the platform.</span>
                        </li>
                    </ul>
                </motion.div>
            </div>

            <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="pt-8 pb-6 max-w-sm mx-auto w-full"
            >
                <label className="flex items-center gap-4 mb-6 p-5 bg-white/5 rounded-2xl border border-white/10 cursor-pointer active:scale-[0.98] transition-transform">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            className="peer appearance-none w-7 h-7 border-2 border-white/20 rounded-xl checked:bg-brand-orange checked:border-brand-orange transition-all"
                            checked={accepted}
                            onChange={(e) => setAccepted(e.target.checked)}
                        />
                        <CheckCircle2 size={16} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" strokeWidth={3} />
                    </div>
                    <span className="text-[9px] font-black uppercase text-white/80 tracking-widest leading-tight">I accept the terms and<br/>conditions</span>
                </label>
                
                <button
                    onClick={handleAccept}
                    disabled={!accepted}
                    className="w-full bg-white text-brand-dark disabled:bg-white/20 disabled:text-white/40 font-black py-5 rounded-[2rem] shadow-xl shadow-brand-dark/50 active:scale-95 transition-all text-[11px] uppercase tracking-widest"
                >
                    Enter Alpha
                </button>
            </motion.div>
        </div>
    );
}
