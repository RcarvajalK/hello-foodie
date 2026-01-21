import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, LogIn, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errorType, setErrorType] = useState('info');
    const navigate = useNavigate();

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: window.location.origin,
                },
            });
            if (error) throw error;
            setErrorType('info');
            setMessage('Check your email for the magic link!');
        } catch (error) {
            setErrorType('error');
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSocialAuth = async (provider) => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: { redirectTo: window.location.origin }
            });
            if (error) throw error;
        } catch (error) {
            alert(error.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6 pb-20 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full mx-auto bg-white rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 border border-white/50"
            >
                <div className="p-10 text-center flex flex-col items-center">
                    <BrandLogo size={64} />
                    <h1 className="text-3xl font-black tracking-tighter text-brand-dark uppercase mt-4 italic">Hello Foodie!</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mt-2">Personal Culinary Log</p>
                </div>

                <div className="px-8 pb-12">
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all shadow-inner"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" />
                        </div>

                        <AnimatePresence mode="wait">
                            {message && (
                                <motion.div
                                    key={message}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-center border flex items-center justify-center gap-2 ${errorType === 'error' ? "bg-red-50 border-red-100 text-red-500" : "bg-brand-orange/5 border-brand-orange/10 text-brand-orange"
                                        }`}
                                >
                                    <AlertCircle size={14} />
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            disabled={loading}
                            className="w-full bg-brand-orange text-white font-black py-5 rounded-[2rem] shadow-xl shadow-brand-orange/30 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
                            {loading ? (
                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span className="uppercase tracking-[0.2em]">Send Magic Link</span>
                                    <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-10">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                        <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-300">
                            <span className="bg-white px-4 italic">Social Join</span>
                        </div>
                    </div>

                    <button
                        onClick={() => handleSocialAuth('google')}
                        className="w-full bg-white border border-slate-100 p-5 rounded-2xl flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-95 transition-all"
                    >
                        <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-dark">Continue with Google</span>
                    </button>

                    <p className="text-[8px] text-center text-gray-300 uppercase font-black tracking-widest mt-10 leading-relaxed">
                        By joining you agree to our <br />
                        <span className="text-brand-orange underline">Terms Service</span> & <span className="text-brand-orange underline">Privacy Policy</span>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}


