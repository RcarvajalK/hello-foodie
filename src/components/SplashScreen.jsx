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
                    className="fixed inset-0 z-[100] bg-brand-orange flex flex-col items-center justify-center text-white"
                >
                    <motion.div
                        initial={{ scale: 0.5, rotate: -10 }}
                        animate={{ scale: 1.2, rotate: 0 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            repeat: Infinity,
                            repeatType: "reverse",
                            duration: 2
                        }}
                    >
                        <BrandLogo size={120} />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center"
                    >
                        <h1 className="text-4xl font-black tracking-tighter mb-2">HELLO FOODIE!</h1>
                        <div className="flex gap-1 justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                    </motion.div>

                    <div className="absolute bottom-12 text-[10px] font-black tracking-[0.3em] opacity-50 uppercase">
                        Your Culinary Journey Starts Here
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
