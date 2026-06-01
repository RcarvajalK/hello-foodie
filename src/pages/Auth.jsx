import { useState, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AtSign, User, CheckCircle2, XCircle, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import clsx from 'clsx';
import { getAndClearRedirectUrl } from '../lib/navUtils';
import logoCompleto from '../assets/logo-completo.png';


const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

function useDebouncedCallback(fn, delay) {
    const [timer, setTimer] = useState(null);
    return useCallback((...args) => {
        if (timer) clearTimeout(timer);
        const id = setTimeout(() => fn(...args), delay);
        setTimer(id);
    }, [fn, delay, timer]);
}

const slide = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 } };

export default function Auth() {
    const [view, setView] = useState('welcome'); // welcome | magic | password | check-email | username | profile
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'info' });
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [usernameStatus, setUsernameStatus] = useState('idle');
    const [pendingUserId, setPendingUserId] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Handle OAuth/Magic Link callbacks: ?step=check or ?step=username
    useEffect(() => {
        const step = searchParams.get('step');
        if (!step) return;

        // Listen for auth state change — this fires once the session is
        // established from the URL hash (magic link / OAuth callback)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!session?.user) return;

            // Unsubscribe immediately — we only need this once
            subscription.unsubscribe();

            const { data: profile } = await supabase
                .from('profiles')
                .select('username, display_name')
                .eq('id', session.user.id)
                .single();

            if (profile?.username) {
                navigate(getAndClearRedirectUrl());
            } else {
                setPendingUserId(session.user.id);
                if (profile?.display_name) setDisplayName(profile.display_name);
                setView('username');
            }
        });

        // Also try immediately in case the session is already established
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session?.user) return;
            subscription.unsubscribe();

            supabase.from('profiles')
                .select('username, display_name')
                .eq('id', session.user.id)
                .single()
                .then(({ data: profile }) => {
                    if (profile?.username) {
                        navigate(getAndClearRedirectUrl());
                    } else {
                        setPendingUserId(session.user.id);
                        if (profile?.display_name) setDisplayName(profile.display_name);
                        setView('username');
                    }
                });
        });

        return () => subscription.unsubscribe();
    }, [searchParams, navigate]);


    const msg = (text, type = 'error') => setMessage({ text, type });

    const validateEmail = (e) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'That email doesn\'t look right. Please check it.';
        if (['test.com','example.com','fake.com'].includes(e.split('@')[1])) return 'Please use a real email address.';
        return null;
    };

    const checkUsername = useCallback(async (val) => {
        if (!val || val.length < 3) { setUsernameStatus('idle'); return; }
        if (!USERNAME_REGEX.test(val)) { setUsernameStatus('invalid'); return; }
        setUsernameStatus('checking');
        try {
            const { data } = await supabase.rpc('is_username_available', { p_username: val });
            setUsernameStatus(data ? 'available' : 'taken');
        } catch { setUsernameStatus('idle'); }
    }, []);

    const debouncedCheck = useDebouncedCallback(checkUsername, 500);
    const handleUsernameChange = (e) => {
        const raw = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
        setUsername(raw);
        setUsernameStatus('idle');
        if (raw.length >= 3) debouncedCheck(raw);
    };

    const handleGoogle = async () => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth?step=check` }
        });
        if (error) { msg(error.message); setLoading(false); }
    };

    const handleMagicLink = async (e) => {
        e.preventDefault(); setLoading(true); setMessage({ text: '', type: 'info' });
        const err = validateEmail(email);
        if (err) { msg(err); setLoading(false); return; }
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth?step=check` } });
        if (error) msg(error.message);
        else msg('Link sent! Check your inbox 📬', 'info');
        setLoading(false);
    };

    const handlePassword = async (e) => {
        e.preventDefault(); setLoading(true); setMessage({ text: '', type: 'info' });
        const err = validateEmail(email);
        if (err) { msg(err); setLoading(false); return; }
        if (password.length < 6) { msg('Password must be at least 6 characters.'); setLoading(false); return; }
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data?.user) {
                    if (data.session) {
                        setPendingUserId(data.user.id);
                        setView('username');
                    } else {
                        setView('check-email');
                    }
                } else {
                    msg('Check your email to confirm your account.', 'info');
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate(getAndClearRedirectUrl());
            }
        } catch (error) { msg(error.message); }
        setLoading(false);
    };

    const handleUsernameSubmit = async (e) => {
        e.preventDefault();
        if (usernameStatus !== 'available') { msg('Please choose a valid and available username.'); return; }
        setView('profile');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        if (!displayName.trim()) { msg('Please enter your display name.'); return; }
        setLoading(true);
        try {
            const userId = pendingUserId || (await supabase.auth.getUser()).data.user?.id;
            const { error } = await supabase.from('profiles').update({
                username: username.toLowerCase(),
                display_name: displayName.trim(),
                full_name: displayName.trim(),
                updated_at: new Date().toISOString(),
            }).eq('id', userId);
            if (error) throw error;
            navigate('/onboarding');
        } catch (error) { msg(error.message); }
        setLoading(false);
    };

    const usernameHint = {
        idle: username.length > 0 && username.length < 3 ? 'At least 3 characters' : 'Letters, numbers, and underscores only (3–20 chars)',
        checking: 'Checking availability…',
        available: `✓ @${username} is available`,
        taken: `@${username} is already taken. Try another.`,
        invalid: 'Lowercase letters, numbers, and underscores only',
    };

    const steps = { welcome: 0, magic: 1, password: 1, 'check-email': 1, username: 2, profile: 3 };
    const totalSteps = 4;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-4 pb-16 relative overflow-hidden">
            <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-brand-orange/8 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-brand-green/8 rounded-full blur-[100px] pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="max-w-sm w-full mx-auto bg-white rounded-[3rem] shadow-2xl overflow-hidden relative z-10 border border-slate-50">

                {/* Progress dots */}
                {view !== 'welcome' && (
                    <div className="flex items-center gap-2 justify-center pt-8 pb-0">
                        {Array.from({ length: totalSteps }).map((_, i) => (
                            <div key={i} className={clsx('rounded-full transition-all duration-500',
                                i < steps[view] ? 'w-6 h-1.5 bg-brand-orange/40' :
                                i === steps[view] ? 'w-10 h-1.5 bg-brand-orange' : 'w-4 h-1.5 bg-slate-100')} />
                        ))}
                    </div>
                )}

                <div className="p-8 pt-6">
                    <AnimatePresence mode="wait">

                        {/* ── WELCOME ── */}
                        {view === 'welcome' && (
                            <motion.div key="welcome" {...slide} className="space-y-5 text-center">
                                <div className="flex flex-col items-center gap-2 pt-4">
                                    <img
                                        src={logoCompleto}
                                        alt="Hello Foodie!"
                                        className="w-[180px] h-auto object-contain mx-auto"
                                    />
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mt-1">Your personal culinary journal</p>
                                </div>

                                {/* Tab selector: Login vs Signup */}
                                <div className="flex bg-slate-100 rounded-2xl p-1 gap-1">
                                    <button id="tab-login"
                                        onClick={() => setIsSignUp(false)}
                                        className={clsx('flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                                            !isSignUp ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400 hover:text-slate-600')}>
                                        I have an account
                                    </button>
                                    <button id="tab-signup"
                                        onClick={() => setIsSignUp(true)}
                                        className={clsx('flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                                            isSignUp ? 'bg-white text-brand-dark shadow-sm' : 'text-slate-400 hover:text-slate-600')}>
                                        I'm new here
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {/* Magic Link — funciona para login y signup */}
                                    <button id="btn-magic"
                                        onClick={() => { setView('magic'); setMessage({ text: '', type: 'info' }); }}
                                        className="w-full flex items-center justify-center gap-3 bg-brand-orange text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-brand-orange/30 hover:shadow-brand-orange/40 active:scale-[0.97] transition-all relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-white/15 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                        <Mail size={18} />
                                        {isSignUp ? 'Sign up with email ✨' : 'Sign in with magic link ✨'}
                                    </button>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-px bg-slate-100" />
                                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or</span>
                                        <div className="flex-1 h-px bg-slate-100" />
                                    </div>

                                    {/* Password option */}
                                    <button id="btn-to-password"
                                        onClick={() => { setView('password'); setMessage({ text: '', type: 'info' }); }}
                                        className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-3.5 rounded-2xl font-black text-sm text-slate-500 hover:border-brand-orange/30 hover:text-brand-orange active:scale-[0.97] transition-all">
                                        <Lock size={16} />
                                        {isSignUp ? 'Sign up with password' : 'Sign in with password'}
                                    </button>
                                </div>

                                <p className="text-[9px] text-slate-300 font-bold uppercase tracking-wider leading-relaxed">
                                    By continuing you agree to our{' '}
                                    <span className="text-brand-orange underline">Terms</span> &{' '}
                                    <span className="text-brand-orange underline">Privacy Policy</span>
                                </p>
                            </motion.div>

                        )}

                        {/* ── MAGIC LINK ── */}
                        {view === 'magic' && (
                            <motion.form key="magic" {...slide} onSubmit={handleMagicLink} className="space-y-5">
                                <button type="button" onClick={() => setView('welcome')} className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-orange transition-colors">
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <div className="text-center space-y-1 py-2">
                                    <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Sparkles className="text-brand-orange" size={28} />
                                    </div>
                                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Magic Link</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No passwords, no hassle ✨</p>
                                </div>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange/50" />
                                    <input id="magic-email" type="email" placeholder="you@email.com" value={email}
                                        onChange={e => setEmail(e.target.value)} required
                                        className="w-full bg-slate-50 border border-slate-100 p-4 pl-11 rounded-2xl text-sm font-bold text-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all" />
                                </div>
                                {message.text && <MsgBanner message={message} />}
                                <button id="btn-send-magic" type="submit" disabled={loading}
                                    className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-orange/30 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Send magic link ✉️'}
                                </button>
                                <button type="button" onClick={() => setView('password')}
                                    className="w-full text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-orange transition-colors py-1">
                                    Use password instead
                                </button>
                            </motion.form>
                        )}

                        {/* ── PASSWORD ── */}
                        {view === 'password' && (
                            <motion.form key="password" {...slide} onSubmit={handlePassword} className="space-y-4">
                                <button type="button" onClick={() => setView('welcome')} className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-orange transition-colors">
                                    <ArrowLeft size={14} /> Back
                                </button>
                                <div className="text-center py-2">
                                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">
                                        {isSignUp ? 'Create account' : 'Welcome back'}
                                    </h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                                        {isSignUp ? 'Sign up with your email and password' : 'Sign in with your email and password'}
                                    </p>
                                </div>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange/50" />
                                    <input id="pw-email" type="email" placeholder="you@email.com" value={email}
                                        onChange={e => setEmail(e.target.value)} required
                                        className="w-full bg-slate-50 border border-slate-100 p-4 pl-11 rounded-2xl text-sm font-bold text-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all" />
                                </div>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange/50" />
                                    <input id="pw-password" type="password" placeholder="••••••••" value={password}
                                        onChange={e => setPassword(e.target.value)} required minLength={6}
                                        className="w-full bg-slate-50 border border-slate-100 p-4 pl-11 rounded-2xl text-sm font-bold text-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all" />
                                </div>
                                {message.text && <MsgBanner message={message} />}
                                <button id="btn-pw-submit" type="submit" disabled={loading}
                                    className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-orange/30 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : isSignUp ? 'Create account →' : 'Sign in →'}
                                </button>
                                <div className="flex items-center justify-between">
                                    <button type="button" onClick={() => { setIsSignUp(!isSignUp); setMessage({ text: '', type: 'info' }); }}
                                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-orange transition-colors">
                                        {isSignUp ? 'Already have an account?' : 'No account? Sign up'}
                                    </button>
                                    {!isSignUp && (
                                        <button type="button" onClick={async () => {
                                            if (!email) { msg('Enter your email first.'); return; }
                                            const { error } = await supabase.auth.resetPasswordForEmail(email);
                                            if (error) msg(error.message);
                                            else msg('Recovery link sent 📬', 'info');
                                        }} className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:underline transition-colors">
                                            Forgot your password?
                                        </button>
                                    )}
                                </div>
                            </motion.form>
                        )}

                        {/* ── CHECK EMAIL ── */}
                        {view === 'check-email' && (
                            <motion.div key="check-email" {...slide} className="space-y-5 text-center">
                                <div className="flex flex-col items-center gap-3 pt-4">
                                    <div className="w-16 h-16 bg-brand-orange/10 rounded-[1.5rem] flex items-center justify-center mb-2">
                                        <Mail size={32} className="text-brand-orange" />
                                    </div>
                                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Check your email!</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                                        We sent a confirmation link to:<br/>
                                        <span className="text-brand-orange lowercase font-black select-all">{email}</span>
                                    </p>
                                </div>
                                <div className="bg-[#FAFAFA] border border-slate-100 p-6 rounded-2xl text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-relaxed text-left space-y-3">
                                    <p className="flex gap-2">
                                        <span className="text-brand-orange">1.</span>
                                        <span>Click the link in the email to activate your account.</span>
                                    </p>
                                    <p className="flex gap-2">
                                        <span className="text-brand-orange">2.</span>
                                        <span>Once confirmed, return here to choose your foodie handle and set up your profile.</span>
                                    </p>
                                </div>
                                <button
                                    id="btn-back-login"
                                    onClick={() => setView('welcome')}
                                    className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-orange/30 active:scale-95 transition-all text-xs uppercase tracking-widest"
                                >
                                    Back to Login
                                </button>
                            </motion.div>
                        )}

                        {/* ── USERNAME ── */}
                        {view === 'username' && (
                            <motion.form key="username" {...slide} onSubmit={handleUsernameSubmit} className="space-y-5">
                                <div className="text-center space-y-1 py-2">
                                    <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <AtSign className="text-brand-orange" size={28} />
                                    </div>
                                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Pick your handle</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">This is how your friends will find you</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange font-black text-base select-none">@</span>
                                        <input id="username-input" type="text" placeholder="your_handle" value={username}
                                            onChange={handleUsernameChange} maxLength={20} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} required
                                            className={clsx('w-full bg-slate-50 border p-4 pl-9 pr-10 rounded-2xl text-sm font-bold text-brand-dark focus:outline-none focus:ring-4 transition-all',
                                                usernameStatus === 'available' && 'border-emerald-200 focus:ring-emerald-100',
                                                usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-200 focus:ring-red-100' : '',
                                                !['available','taken','invalid'].includes(usernameStatus) && 'border-slate-100 focus:ring-brand-orange/10'
                                            )} />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            {usernameStatus === 'checking' && <Loader2 size={16} className="animate-spin text-slate-400" />}
                                            {usernameStatus === 'available' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                            {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <XCircle size={16} className="text-red-400" />}
                                        </div>
                                    </div>
                                    <p className={clsx('text-[10px] font-bold ml-2 transition-colors',
                                        usernameStatus === 'available' ? 'text-emerald-500' :
                                        usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'text-red-400' : 'text-slate-400')}>
                                        {usernameHint[usernameStatus]}
                                    </p>
                                </div>
                                {message.text && <MsgBanner message={message} />}
                                <button id="btn-username-submit" type="submit" disabled={usernameStatus !== 'available'}
                                    className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-orange/30 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none">
                                    This is mine →
                                </button>
                                <p className="text-[9px] text-center text-slate-300 uppercase font-bold tracking-widest">You can change this later in Settings</p>
                            </motion.form>
                        )}

                        {/* ── PROFILE ── */}
                        {view === 'profile' && (
                            <motion.form key="profile" {...slide} onSubmit={handleProfileSubmit} className="space-y-5">
                                <div className="text-center space-y-1 py-2">
                                    <div className="w-14 h-14 bg-brand-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <User className="text-brand-green" size={28} />
                                    </div>
                                    <h2 className="text-2xl font-black text-brand-dark uppercase tracking-tight">Almost there...</h2>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">How do you want to appear to others?</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="relative">
                                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange/50" />
                                        <input id="profile-displayname" type="text" placeholder="Your display name *" value={displayName}
                                            onChange={e => setDisplayName(e.target.value)} required maxLength={60}
                                            className="w-full bg-slate-50 border border-slate-100 p-4 pl-11 rounded-2xl text-sm font-bold text-brand-dark focus:outline-none focus:ring-4 focus:ring-brand-orange/10 transition-all" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold text-center">
                                        🖼️ Profile photo — you can add one later from your profile
                                    </p>
                                </div>
                                {message.text && <MsgBanner message={message} />}
                                <button id="btn-profile-submit" type="submit" disabled={loading}
                                    className="w-full bg-brand-orange text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-orange/30 active:scale-[0.97] transition-all flex items-center justify-center gap-2 disabled:opacity-60 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/15 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Let's go! 🍽️"}
                                </button>
                                <p className="text-[9px] text-center text-slate-300 uppercase font-bold tracking-widest">You can edit your profile anytime</p>
                            </motion.form>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}

function MsgBanner({ message }) {
    return (
        <AnimatePresence mode="wait">
            {message.text && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className={clsx('p-3 rounded-xl text-[10px] font-black uppercase tracking-wider text-center border flex items-center justify-center gap-2',
                        message.type === 'error' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-brand-orange/5 border-brand-orange/10 text-brand-orange')}>
                    {message.text}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
