import { NavLink } from 'react-router-dom';
import { LayoutGrid, Map as MapIcon, Users, BarChart3, Plus } from 'lucide-react';
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
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-around items-center px-4 pb-8 pt-3 z-[60] shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        clsx(
                            "flex flex-col items-center gap-1.5 transition-all duration-300 relative",
                            item.special
                                ? "bg-brand-orange text-white p-4 rounded-[2rem] -mt-12 shadow-xl shadow-brand-orange/30 active:scale-90"
                                : isActive ? "text-brand-orange" : "text-gray-300 hover:text-gray-400"
                        )
                    }
                >
                    {({ isActive }) => (
                        <>
                            {item.special ? (
                                <div className="flex items-center justify-center">
                                    <Plus size={28} strokeWidth={3} />
                                </div>
                            ) : (
                                <>
                                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                    {isActive && !item.special && (
                                        <div className="absolute -bottom-2 w-1 h-1 bg-brand-orange rounded-full"></div>
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
