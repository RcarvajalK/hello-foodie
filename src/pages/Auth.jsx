import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, LogIn, AlertCircle, ChevronRight, Lock, UserPlus,
    AtSign, User, CheckCircle2, XCircle, Loader2, Smile
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import clsx from 'clsx';
import { getAndClearRedirectUrl } from '../lib/navUtils';

// Debounce utility
function useDebouncedCallback(fn, delay) {
    const [timer, setTimer] = useState(null);
    return useCallback((...args) => {
        if (timer) clearTimeout(timer);
        const id = setTimeout(() => fn(...args), delay);
        setTimer(id);
    }, [fn, delay, timer]);
}

const USERNAME_REGEX = /^[a-z0-9_]{3,30}$/;

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordMode] = useState(true);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState('');
    const [errorType, setErrorType] = useState('info');
    const navigate = useNavigate();

    // ── Step 2 (profile setup after signup) ──
    const [step, setStep] = useState(1); // 1 = credentials, 2 = profile setup
    const [pendingUserId, setPendingUserId] = useState(null);
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [usernameStatus, setUsernameStatus] = useState('idle'); // 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) return { valid: false, message: 'Please enter a valid email format.' };
        const invalidDomains = ['test.com', 'example.com', 'fake.com', 'asdf.com'];
        const domain = email.split('@')[1];
        if (invalidDomains.includes(domain)) {
            return { valid: false, message: 'Please use a real email address. Test domains are not allowed.' };
        }
        return { valid: true };
    };

    // Real-time username availability check
    const checkUsername = useCallback(async (value) => {
        const clean = value.toLowerCase().replace(/\s/g, '');
        if (!clean || clean.length < 3) {
            setUsernameStatus('idle');
            return;
        }
        if (!USERNAME_REGEX.test(clean)) {
            setUsernameStatus('invalid');
            return;
        }
        setUsernameStatus('checking');
        try {
            const { data, error } = await supabase.rpc('is_username_available', { p_username: clean });
            if (error) throw error;
            setUsernameStatus(data ? 'available' : 'taken');
        } catch {
            setUsernameStatus('idle');
        }
    }, []);

    const debouncedCheckUsername = useDebouncedCallback(checkUsername, 500);

    const handleUsernameChange = (e) => {
        const raw = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(raw);
        setUsernameStatus('idle');
        if (raw.length >= 3) debouncedCheckUsername(raw);
    };

    // ── Step 1 handler ──
    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const validation = validateEmail(email);
        if (!validation.valid) {
            setErrorType('error');
            setMessage(validation.message);
            setLoading(false);
            return;
        }

        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: email.split('@')[0] },
                        emailRedirectTo: window.location.origin,
                    }
                });
                if (error) throw error;

                // Move to profile-setup step
                if (data?.user) {
                    setPendingUserId(data.user.id);
                    setStep(2);
                } else {
                    setErrorType('info');
                    setMessage('Check your email to confirm your account, then come back to log in!');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate(getAndClearRedirectUrl());
            }
        } catch (error) {
            console.error('Authentication Error:', error);
            setErrorType('error');
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2 handler ──
    const handleProfileSetup = async (e) => {
        e.preventDefault();
        if (!fullName.trim()) {
            setErrorType('error');
            setMessage('Full name is required.');
            return;
        }
        if (usernameStatus !== 'available') {
            setErrorType('error');
            setMessage('Please choose a valid and available username.');
            return;
        }

        setLoading(true);
        setMessage('');
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    username: username.toLowerCase(),
                    full_name: fullName.trim(),
                    bio: bio.trim() || null,
                })
                .eq('id', pendingUserId || (await supabase.auth.getUser()).data.user?.id);

            if (error) throw error;
            navigate(getAndClearRedirectUrl());
        } catch (error) {
            console.error('Profile setup error:', error);
            setErrorType('error');
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Username status icon
    const UsernameIcon = () => {
        if (usernameStatus === 'checking') return <Loader2 size={16} className="animate-spin text-brand-orange/50" />;
        if (usernameStatus === 'available') return <CheckCircle2 size={16} className="text-emerald-500" />;
        if (usernameStatus === 'taken') return <XCircle size={16} className="text-red-400" />;
        if (usernameStatus === 'invalid') return <XCircle size={16} className="text-red-400" />;
        return null;
    };

    const usernameHelperText = {
        idle: username.length > 0 && username.length < 3 ? 'At least 3 characters' : 'Letters, numbers, underscores only',
        checking: 'Checking availability…',
        available: `@${username} is available!`,
        taken: `@${username} is already taken. Try another.`,
        invalid: 'Only lowercase letters, numbers, and underscores (3–30 chars)',
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6 pb-20 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-brand-green/5 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full mx-auto bg-white rounded-[3.5rem] shadow-2xl overflow-hidden relative z-10 border border-white/50"
            >
                {/* Header */}
                <div className="p-10 text-center flex flex-col items-center pb-6">
                    <BrandLogo size={64} />
                    <h1 className="text-3xl font-black tracking-tighter text-brand-dark uppercase mt-4 italic">Hello Foodie!</h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mt-2">Personal Culinary Log</p>

                    {/* Step indicator — only visible during signup step 2 */}
                    <AnimatePresence>
                        {isSignUp && step === 2 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 mt-6"
                            >
                                <div className="w-8 h-2 bg-brand-orange rounded-full" />
                                <div className="w-8 h-2 bg-brand-orange rounded-full" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-brand-orange ml-1">Step 2 of 2</p>
                            </motion.div>
                        )}
                        {isSignUp && step === 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 mt-6"
                            >
                                <div className="w-8 h-2 bg-brand-orange rounded-full" />
                                <div className="w-8 h-2 bg-brand-orange/20 rounded-full" />
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-1">Step 1 of 2</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="px-8 pb-12">
                    <AnimatePresence mode="wait">
                        {/* ── STEP 1: Credentials ── */}
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleEmailAuth}
                                className="space-y-4"
                            >
                                {isSignUp && (
                                    <div className="text-center pb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            Create your account
                                        </p>
                                    </div>
                                )}

                                <div className="relative">
                                    <input
                                        id="auth-email"
                                        type="email"
                                        placeholder="name@example.com"
                                        className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all shadow-inner"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <Mail size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" />
                                </div>

                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
                                    <input
                                        id="auth-password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all shadow-inner"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                    <Lock size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" />
                                </motion.div>

                                <AnimatePresence mode="wait">
                                    {message && (
                                        <motion.div
                                            key={message}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-center border flex items-center justify-center gap-2 ${errorType === 'error'
                                                ? 'bg-red-50 border-red-100 text-red-500'
                                                : 'bg-brand-orange/5 border-brand-orange/10 text-brand-orange'
                                                }`}
                                        >
                                            <AlertCircle size={14} />
                                            {message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    id="auth-submit-btn"
                                    disabled={loading}
                                    className="w-full bg-brand-orange text-white font-black py-5 rounded-[2rem] shadow-xl shadow-brand-orange/30 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                    {loading ? (
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="uppercase tracking-[0.2em]">
                                                {isSignUp ? 'Continue →' : 'Login'}
                                            </span>
                                            <ChevronRight size={18} />
                                        </>
                                    )}
                                </button>

                                <button
                                    id="auth-toggle-mode-btn"
                                    type="button"
                                    onClick={() => { setIsSignUp(!isSignUp); setMessage(''); }}
                                    className="w-full text-center text-[9px] font-black text-gray-400 mt-2 uppercase tracking-[0.2em] hover:text-brand-orange transition-colors"
                                >
                                    {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
                                </button>
                            </motion.form>
                        )}

                        {/* ── STEP 2: Profile Setup ── */}
                        {step === 2 && (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleProfileSetup}
                                className="space-y-5"
                            >
                                <div className="text-center pb-2">
                                    <p className="text-[11px] font-black uppercase tracking-widest text-brand-dark">
                                        Set up your profile
                                    </p>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1">
                                        Choose your unique handle — this is how friends will find you.
                                    </p>
                                </div>

                                {/* Username field */}
                                <div className="space-y-1.5">
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange font-black text-base select-none">@</span>
                                        <input
                                            id="signup-username"
                                            type="text"
                                            placeholder="your_username"
                                            className={clsx(
                                                "w-full bg-slate-50 border p-5 pl-10 pr-12 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 transition-all shadow-inner",
                                                usernameStatus === 'available' && "border-emerald-200 focus:ring-emerald-100",
                                                usernameStatus === 'taken' && "border-red-200 focus:ring-red-100",
                                                usernameStatus === 'invalid' && "border-red-200 focus:ring-red-100",
                                                !['available', 'taken', 'invalid'].includes(usernameStatus) && "border-slate-100 focus:ring-brand-orange/10"
                                            )}
                                            value={username}
                                            onChange={handleUsernameChange}
                                            maxLength={30}
                                            autoComplete="off"
                                            autoCorrect="off"
                                            autoCapitalize="off"
                                            spellCheck={false}
                                            required
                                        />
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2">
                                            <UsernameIcon />
                                        </div>
                                    </div>
                                    <p className={clsx(
                                        "text-[9px] font-bold ml-4 transition-colors",
                                        usernameStatus === 'available' && "text-emerald-500",
                                        usernameStatus === 'taken' && "text-red-400",
                                        usernameStatus === 'invalid' && "text-red-400",
                                        !['available', 'taken', 'invalid'].includes(usernameStatus) && "text-slate-400"
                                    )}>
                                        {usernameHelperText[usernameStatus]}
                                    </p>
                                </div>

                                {/* Full Name field (required) */}
                                <div className="relative">
                                    <input
                                        id="signup-fullname"
                                        type="text"
                                        placeholder="Full Name *"
                                        className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all shadow-inner"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                    />
                                    <User size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" />
                                </div>

                                {/* Bio field (optional) */}
                                <div className="relative">
                                    <input
                                        id="signup-bio"
                                        type="text"
                                        placeholder="Short bio (optional)"
                                        className="w-full bg-slate-50 border border-slate-100 p-5 pl-14 rounded-2xl text-brand-dark font-bold text-sm focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all shadow-inner"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        maxLength={100}
                                    />
                                    <Smile size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-brand-orange/40" />
                                </div>

                                <AnimatePresence mode="wait">
                                    {message && (
                                        <motion.div
                                            key={message}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-wider text-center border flex items-center justify-center gap-2 ${errorType === 'error'
                                                ? 'bg-red-50 border-red-100 text-red-500'
                                                : 'bg-brand-orange/5 border-brand-orange/10 text-brand-orange'
                                                }`}
                                        >
                                            <AlertCircle size={14} />
                                            {message}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    id="signup-profile-submit-btn"
                                    disabled={loading || usernameStatus !== 'available'}
                                    className="w-full bg-brand-orange text-white font-black py-5 rounded-[2rem] shadow-xl shadow-brand-orange/30 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-50 disabled:pointer-events-none"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                    {loading ? (
                                        <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="uppercase tracking-[0.2em]">Let's Eat! 🍽️</span>
                                            <ChevronRight size={18} />
                                        </>
                                    )}
                                </button>

                                <p className="text-[8px] text-center text-slate-300 uppercase font-black tracking-widest">
                                    You can change your username later in Settings
                                </p>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {step === 1 && (
                        <p className="text-[8px] text-center text-gray-300 uppercase font-black tracking-widest mt-8 leading-relaxed">
                            By joining you agree to our <br />
                            <span className="text-brand-orange underline">Terms of Service</span> &{' '}
                            <span className="text-brand-orange underline">Privacy Policy</span>
                        </p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
