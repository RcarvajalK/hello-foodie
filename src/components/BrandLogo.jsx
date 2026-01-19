import { motion } from 'framer-motion';

export default function BrandLogo({ size = 64, className = "", animate = true }) {
    const content = (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="pinGradient" x1="50" y1="5" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FFB347" />
                    <stop offset="100%" stopColor="#FF6B6B" />
                </linearGradient>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                    <feOffset dx="0" dy="4" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.2" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Main Pin Shape */}
            <path
                d="M50 5C27.9 5 10 22.9 10 45C10 75 50 115 50 115C50 115 90 75 90 45C90 22.9 72.1 5 50 5Z"
                fill="url(#pinGradient)"
                filter="url(#shadow)"
            />

            {/* Highlight on the right side of the pin */}
            <path
                d="M50 5C65 5 80 18 80 45C80 65 50 105 50 105C50 105 50 25 50 5Z"
                fill="white"
                fillOpacity="0.15"
            />

            {/* Fork and Spoon Cutouts */}
            {/* Fork */}
            <path
                d="M38 30V42M42 30V42M34 30V42M34 42C34 46 37 49 41 49V65H38V67H44V65H41V49C45 49 48 46 48 42V30H38Z"
                fill="white"
                transform="translate(-2, 0)"
            />

            {/* Spoon */}
            <path
                d="M60 30C56 30 53 33 53 38C53 43 56 46 60 46H62V65H59V67H65V65H62V46C66 46 69 43 69 38C69 33 66 30 62 30H60Z"
                fill="white"
                transform="translate(2, 0)"
            />
        </svg>
    );

    if (!animate) return content;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ width: size, height: size }}
        >
            {content}
        </motion.div>
    );
}
