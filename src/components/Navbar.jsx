import { NavLink } from 'react-router-dom';
import { List, Plus, Map, Users, BarChart3 } from 'lucide-react';
import clsx from 'clsx';

export default function Navbar() {
    const navItems = [
        { to: '/', icon: List, label: 'My List' },
        { to: '/add', icon: Plus, label: 'Add', special: true },
        { to: '/map', icon: Map, label: 'Map' },
        { to: '/clubs', icon: Users, label: 'Clubs' },
        { to: '/stats', icon: BarChart3, label: 'Stats' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom shadow-lg">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
                {navItems.map(({ to, icon: Icon, label, special }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            clsx(
                                "flex-1 flex flex-col items-center justify-center h-full transition-all duration-200",
                                isActive ? "text-brand-orange" : "text-gray-400 hover:text-brand-orange/70",
                                special && "relative -top-4"
                            )
                        }
                    >
                        <div className={clsx(
                            "transition-all duration-200 flex items-center justify-center",
                            special ? "w-14 h-14 bg-brand-orange text-white rounded-full shadow-lg shadow-brand-orange/40 scale-110 active:scale-95" : "scale-100"
                        )}>
                            <Icon size={special ? 28 : 22} />
                        </div>
                        {!special && <span className="text-[10px] font-bold tracking-tight uppercase mt-1">{label}</span>}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
