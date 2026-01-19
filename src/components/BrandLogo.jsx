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
                {/* Main Orange Gradient */}
                <linearGradient id="logoGradient" x1="50" y1="5" x2="50" y2="115" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#FB923C" /> {/* Orange 400 */}
                    <stop offset="100%" stopColor="#F43F5E" /> {/* Rose 500 - matches the vibrant orange/red look */}
                </linearGradient>

                {/* Shadow for depth */}
                <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                    <feOffset dx="0" dy="3" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.15" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Main Pin Shape with Gradient */}
            <path
                d="M50 5C27.9 5 10 22.9 10 45C10 75 50 115 50 115C50 115 90 75 90 45C90 22.9 72.1 5 50 5Z"
                fill="url(#logoGradient)"
                filter="url(#logoShadow)"
            />

            {/* The "S" Curve Highlight - This creates the depth seen in Opt 1 */}
            <path
                d="M50 5C68 5 85 20 85 45C85 68 50 105 50 105C50 105 52 75 52 45C52 25 50 5 50 5Z"
                fill="white"
                fillOpacity="0.12"
            />

            {/* Fork Cutout (Left Side) */}
            <g transform="translate(28, 32) scale(0.9)">
                {/* Fork Base */}
                <path d="M12 25V42H16V25C20 25 22 22 22 18V5H19V18H17V5H14V18H12V5H9V18H7V5H4V18C4 22 6 25 10 25H12Z" fill="white" />
            </g>

            {/* Spoon Cutout (Right Side) */}
            <g transform="translate(56, 32) scale(0.9)">
                {/* Spoon Head */}
                <ellipse cx="8" cy="14" rx="8" ry="11" fill="white" />
                {/* Spoon Handle */}
                <rect x="6" y="24" width="4" height="18" rx="2" fill="white" />
            </g>
        </svg>
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
