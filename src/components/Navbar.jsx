import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { List, Map as MapIcon, Users, MoreHorizontal, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import MoreMenu from './MoreMenu';

export default function Navbar() {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setIsVisible(false); // Scrolling down
            } else {
                setIsVisible(true); // Scrolling up
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const navItems = [
        { path: '/', icon: List, label: 'My List' },
        { path: '/map', icon: MapIcon, label: 'Map' },
        { path: '/add', icon: Plus, label: 'Add', special: true },
        { path: '/clubs', icon: Users, label: 'Clubs' },
        { path: 'more', icon: MoreHorizontal, label: 'More', isAction: true },
    ];

    return (
        <>
            <motion.nav
                animate={{ y: isVisible ? 0 : 100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 flex justify-around items-center px-4 pb-[calc(8px+env(safe-area-inset-bottom,0px))] pt-4 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]"
            >
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    if (item.isAction) {
                        return (
                            <button
                                key={item.label}
                                onClick={() => setIsMoreOpen(true)}
                                className={clsx(
                                    "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
                                    "text-gray-300 hover:text-gray-500"
                                )}
                            >
                                <item.icon size={22} strokeWidth={2} />
                                <span className="text-[9px] font-black uppercase tracking-[0.15em] mb-1">{item.label}</span>
                            </button>
                        );
                    }

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                clsx(
                                    "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
                                    item.special
                                        ? "bg-brand-orange text-white p-4 rounded-[2.2rem] -mt-14 shadow-2xl shadow-brand-orange/40 active:scale-90 border-4 border-white"
                                        : isActive ? "text-brand-orange scale-110" : "text-gray-300 hover:text-gray-500"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {item.special ? (
                                        <Plus size={30} strokeWidth={3} />
                                    ) : (
                                        <>
                                            <item.icon size={22} strokeWidth={isActive ? 3 : 2} />
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] mb-1">{item.label}</span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="navTab"
                                                    className="absolute -bottom-1 w-1 h-1 bg-brand-orange rounded-full"
                                                />
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </motion.nav>
            <MoreMenu isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
        </>
    );
}
