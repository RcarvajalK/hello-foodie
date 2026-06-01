import { motion } from 'framer-motion';
import logoIsotipo from '../assets/logo-isotipo.png';

export default function BrandLogo({ size = 64, className = "", animate = true }) {
    const content = (
        <img
            src={logoIsotipo}
            alt="Hello Foodie!"
            className={className}
            style={{
                width: size,
                height: size,
                objectFit: 'contain',
            }}
        />
    );

    if (!animate) return content;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            {content}
        </motion.div>
    );
}

