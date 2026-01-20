import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div className="min-h-screen bg-white relative pb-[calc(76px+env(safe-area-inset-bottom,0px))]">
            <main className="min-h-screen flex flex-col relative overflow-x-hidden">
                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
            <Navbar />
        </div>
    );
}
