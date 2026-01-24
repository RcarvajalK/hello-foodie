import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

export default function SplashScreen({ isVisible }) {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6"
                >
                    {/* Subtle Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent"></div>

                    <div className="flex-1 flex flex-col items-center justify-center -mt-20">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                duration: 1
                            }}
                            className="relative z-10"
                        >
                            <BrandLogo size={120} />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8 text-center relative z-10"
                        >
                            <h1 className="text-3vw font-black tracking-tighter text-brand-dark mb-4 drop-shadow-sm min-text-[32px]">Hello Foodie!</h1>
                            <div className="flex gap-2 justify-center">
                                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-brand-orange rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="pb-12 text-[9px] font-black tracking-[0.3em] text-gray-300 uppercase text-center relative z-10"
                    >
                        Powered by 1Production Technology
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
