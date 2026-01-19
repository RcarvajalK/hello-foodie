import { motion } from 'framer-motion';

export default function BrandLogo({ size = 64, className = "" }) {
    return (
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 100 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            {/* Location Pin Shape */}
            <path
                d="M50 5C27.9 5 10 22.9 10 45C10 75 50 115 50 115C50 115 90 75 90 45C90 22.9 72.1 5 50 5Z"
                fill="#FF6B6B"
                className="drop-shadow-lg"
            />

            {/* Interior White Circle */}
            <circle cx="50" cy="45" r="28" fill="white" />

            {/* Fork and Spoon forming a Pin internal shape */}
            {/* Fork */}
            <path
                d="M42 35V45M46 35V45M38 35V45M38 45C38 48.3 40.7 51 44 51V65H42V67H46V65H44V51C47.3 51 50 48.3 50 45V35H42Z"
                fill="#4ECDC4"
                transform="translate(-5, 0)"
            />

            {/* Spoon */}
            <path
                d="M62 35C58.7 35 56 37.7 56 41C56 44.3 58.7 47 62 47H64V65H62V67H66V65H64V47C67.3 47 70 44.3 70 41C70 37.7 67.3 35 64 35H62Z"
                fill="#4ECDC4"
                transform="translate(2, 0)"
            />
        </motion.svg>
    );
}
