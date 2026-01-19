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
                    className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
                >
                    {/* Subtle Background Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-transparent"></div>

                    <motion.div
                        initial={{ scale: 0.5, y: 20 }}
                        animate={{ scale: 1.1, y: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            duration: 1
                        }}
                        className="relative z-10"
                    >
                        <BrandLogo size={140} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-10 text-center relative z-10"
                    >
                        <h1 className="text-4xl font-black tracking-tighter text-brand-dark mb-3">Hello Foodie!</h1>
                        <div className="flex gap-1.5 justify-center">
                            <div className="w-2.5 h-2.5 bg-brand-orange rounded-full animate-bounce"></div>
                            <div className="w-2.5 h-2.5 bg-brand-orange rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2.5 h-2.5 bg-brand-orange rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                    </motion.div>

                    <div className="absolute bottom-16 text-[10px] font-black tracking-[0.4em] text-gray-300 uppercase">
                        Powered by Production Technology
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
