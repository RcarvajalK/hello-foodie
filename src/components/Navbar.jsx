import { NavLink } from 'react-router-dom';
import { LayoutGrid, Map as MapIcon, Users, BarChart3, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import BrandLogo from './BrandLogo';

export default function Navbar() {
    const navItems = [
        { path: '/', icon: LayoutGrid, label: 'Feed' },
        { path: '/map', icon: MapIcon, label: 'Map' },
        { path: '/add', icon: Plus, label: 'Add', special: true },
        { path: '/clubs', icon: Users, label: 'Clubs' },
        { path: '/stats', icon: BarChart3, label: 'Stats' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-gray-100 flex justify-around items-center px-4 pb-[calc(8px+env(safe-area-inset-bottom,0px))] pt-4 z-[100] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
            {navItems.map((item) => (
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
            ))}
        </nav>
    );
}
