// src/components/animated-grid-item.tsx
'use client';

import { motion, Variants } from 'framer-motion';

// Varian untuk item (kartu)
export const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 }, // Mulai dari 20px di bawah & transparan
  visible: {
    y: 0, // Pindah ke posisi 0
    opacity: 1, // Jadi terlihat
    transition: {
      type: 'spring', // Animasi pegas
      stiffness: 120,
    },
  },
};

type Props = {
  children: React.ReactNode;
};

export default function AnimatedGridItem({ children }: Props) {
  // Kita tidak perlu state initial/animate di sini
  // karena akan di-handle oleh parent (AnimatedGrid)
  return <motion.div variants={itemVariants}>{children}</motion.div>;
}