import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage('Check your email for the confirmation link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/');
            }
        } catch (error) {
            setMessage(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6 pb-20 relative overflow-hidden">
            {/* Decorative Blurs */}
            <div className="absolute top-[-100px] left-[-100px] w-80 h-80 bg-brand-orange/10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-100px] right-[-100px] w-80 h-80 bg-brand-green/10 rounded-full blur-[100px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="max-w-md w-full mx-auto bg-white rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 border border-white"
            >
                <div className="bg-brand-orange p-10 py-14 text-white text-center rounded-b-[3.5rem] relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl relative z-10 transition-transform hover:rotate-6">
                        <BrandLogo size={48} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase relative z-10">Hello Foodie!</h1>
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80 mt-2 relative z-10">Your personal culinary hub</p>
                </div>

                <div className="p-8 pt-12">
                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-5 tracking-[0.2em]">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-50 border border-gray-100 p-5 pl-14 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-5 tracking-[0.2em]">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-gray-100 p-5 pl-14 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" />
                            </div>
                        </div>

                        <AnimatePresence>
                            {message && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-xs text-brand-orange font-black text-center px-4 bg-brand-orange/5 py-3 rounded-xl border border-brand-orange/10"
                                >
                                    {message}
                                </motion.p>
                            )}
                        </AnimatePresence>

                        <button
                            disabled={loading}
                            className="w-full bg-brand-orange text-white font-black py-5 rounded-[1.8rem] shadow-xl shadow-brand-orange/30 active:scale-[0.97] transition-all flex items-center justify-center gap-3 mt-4 group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus size={22} /> : <LogIn size={22} />}
                                    <span className="uppercase tracking-widest">{isSignUp ? 'Join the Community' : 'Sign In Now'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full text-center text-[10px] font-black text-gray-400 mt-8 uppercase tracking-[0.1em] hover:text-brand-orange transition-colors"
                    >
                        {isSignUp ? 'Already a foodie? Sign In' : "New here? Create your profile"}
                    </button>
                </div>
            </motion.div>

            <p className="text-center text-[9px] font-black text-gray-300 uppercase tracking-[0.3em] mt-8">Secure by Supabase Technology</p>
        </div>
    );
}
