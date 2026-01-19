import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
    return (
        <div className="min-h-screen bg-slate-50 relative pb-16">
            <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl flex flex-col relative overflow-x-hidden">
                <div className="flex-1 overflow-y-auto">
                    <Outlet />
                </div>
            </main>
            <Navbar />
        </div>
    );
}
