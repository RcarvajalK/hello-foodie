import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, UserPlus, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6 pb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full mx-auto bg-white rounded-[3rem] shadow-xl overflow-hidden"
            >
                <div className="bg-brand-orange p-10 text-white text-center rounded-b-[3rem]">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-brand-orange mx-auto mb-4 shadow-lg">
                        <Star size={32} fill="currentColor" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight uppercase">Hello Foodie!</h1>
                    <p className="text-sm font-bold opacity-80 mt-1">Start your culinary journey</p>
                </div>

                <div className="p-8 pt-10">
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-50 border border-gray-100 p-4 pl-12 rounded-2xl text-brand-dark font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Password</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-gray-100 p-4 pl-12 rounded-2xl text-brand-dark font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                        </div>

                        {message && (
                            <p className="text-xs text-brand-orange font-bold text-center px-4">{message}</p>
                        )}

                        <button
                            disabled={loading}
                            className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-orange/30 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                                    {isSignUp ? 'Create Account' : 'Sign In'}
                                </>
                            )}
                        </button>
                    </form>

                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full text-center text-xs font-bold text-gray-400 mt-6 hover:text-brand-orange transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
