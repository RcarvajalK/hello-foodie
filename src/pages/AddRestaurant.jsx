import { useState } from 'react';
import { Camera, MapPin, Star, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function AddRestaurant() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        cuisine: '',
        zone: '',
        price: '$$',
        recommendedBy: '',
    });

    return (
        <div className="pb-24 bg-slate-50 min-h-screen">
            <header className="bg-white p-5 border-b border-gray-100 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400">
                    <X size={24} />
                </button>
                <h1 className="text-lg font-black text-brand-dark">Add New Place</h1>
                <div className="w-10"></div>
            </header>

            <div className="p-6">
                <div className="mb-8 flex flex-col items-center">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="w-full aspect-video bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-400 gap-2 shadow-sm"
                    >
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-brand-orange">
                            <Camera size={32} />
                        </div>
                        <span className="text-sm font-bold">Add Photo</span>
                    </motion.button>
                </div>

                <form className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Restaurant Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Rosetta"
                            className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-brand-dark font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Cuisine</label>
                            <input
                                type="text"
                                placeholder="Italian, etc."
                                className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-brand-dark font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Zone/City</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Roma Norte"
                                    className="w-full bg-white border border-gray-100 p-4 pl-10 rounded-2xl text-brand-dark font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                                />
                                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-orange" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-4 tracking-widest">Who recommended it?</label>
                        <input
                            type="text"
                            placeholder="@friend or 'Me'"
                            className="w-full bg-white border border-gray-100 p-4 rounded-2xl text-brand-dark font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
                        />
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="flex-1 bg-brand-orange text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-orange/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            <Plus size={20} />
                            Save to My List
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
