// src/components/animated-grid.tsx
'use client';

import { motion, Variants } from 'framer-motion';

// Varian untuk kontainer (grid)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Jarak waktu antar animasi anak (ms)
    },
  },
};

type Props = {
  children: React.ReactNode;
  className: string;
};

export default function AnimatedGrid({ children, className }: Props) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden" // Mulai dari state 'hidden'
      animate="visible" // Animasikan ke state 'visible'
    >
      {children}
    </motion.div>
  );
}