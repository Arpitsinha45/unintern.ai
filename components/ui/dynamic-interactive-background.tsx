import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export const DynamicInteractiveBackground: React.FC = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth physics for the spotlight
    const springConfig = { damping: 30, stiffness: 200 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050505]">
            {/* Main Interactive Spotlight */}
            <motion.div
                className="absolute w-[800px] h-[800px] rounded-full opacity-20 filter blur-[120px]"
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: '-50%',
                    translateY: '-50%',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(168, 85, 247, 0.1) 50%, transparent 70%)',
                }}
            />

            {/* Ambient Fixed Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[150px] rounded-full" />

            {/* Subtle Floating Particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white/20 rounded-full"
                        initial={{ 
                            x: Math.random() * 100 + '%', 
                            y: Math.random() * 100 + '%',
                            opacity: Math.random() * 0.5 + 0.2
                        }}
                        animate={{ 
                            y: ['-10%', '110%'],
                            opacity: [0, 0.5, 0]
                        }}
                        transition={{ 
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            delay: Math.random() * 10,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>

            {/* Noise Texture Panel */}
            <div 
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
};
