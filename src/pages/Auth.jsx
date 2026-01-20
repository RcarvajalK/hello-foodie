import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');
    const [errorType, setErrorType] = useState('info');
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setErrorType('info');

        try {
            if (!supabase) throw new Error("Supabase client error.");

            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: email.split('@')[0] }
                    }
                });
                if (error) throw error;
                setMessage('Check your email for the link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/');
            }
        } catch (error) {
            setErrorType('error');
            setMessage(error.message || "Credential issue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6 pb-20 relative overflow-hidden">
            {/* Brand Background Elements */}
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[100px]"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full mx-auto bg-white rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 border border-white/50"
            >
                <div className="bg-white p-12 text-center border-b border-gray-50 flex flex-col items-center">
                    <BrandLogo size={80} />
                    <h1 className="text-3xl font-black tracking-tighter text-brand-dark uppercase mt-6">Hello Foodie!</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mt-2">Personal Culinary Log</p>
                </div>

                <div className="p-8 pb-12 bg-slate-50/30">
                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-400 ml-5 tracking-[0.2em]">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-white border border-gray-100 p-5 pl-14 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all shadow-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase text-gray-400 ml-5 tracking-[0.2em]">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-white border border-gray-100 p-5 pl-14 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all shadow-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange" />
                            </div>
                        </div>

                        <AnimatePresence>
                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-center border flex items-center justify-center gap-2 ${errorType === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-brand-orange/5 border-brand-orange/10 text-brand-orange'
                                        }`}
                                >
                                    <AlertCircle size={14} />
                                    {message}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            disabled={loading}
                            className="w-full bg-brand-orange text-white font-black py-5 rounded-[2rem] shadow-xl shadow-brand-orange/40 active:scale-[0.97] transition-all flex items-center justify-center gap-3 mt-4 group overflow-hidden relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange-light/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            {loading ? (
                                <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                                    <span className="uppercase tracking-widest">{isSignUp ? 'Create My Profile' : 'Start Journey'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100"></span></div>
                        <div className="relative flex justify-center text-[8px] font-bold uppercase tracking-widest text-gray-300">
                            <span className="bg-[#fcfcfd] px-4">Social Login</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={async () => await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
                            className="flex-1 bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm active:scale-95 transition-all"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-4 h-4 grayscale group-hover:grayscale-0" alt="Google" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand-dark">Google</span>
                        </button>
                        <button
                            onClick={async () => await supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin } })}
                            className="flex-1 bg-brand-dark text-white p-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                        >
                            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                            <span className="text-[10px] font-black uppercase tracking-widest">Github</span>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full text-center text-[9px] font-black text-gray-400 mt-10 uppercase tracking-[0.2em] hover:text-brand-orange transition-colors"
                    >
                        {isSignUp ? 'Already joined? Login' : "New foodie? Signup"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
