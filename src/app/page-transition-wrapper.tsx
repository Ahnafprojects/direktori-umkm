// src/app/page-transition-wrapper.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Untuk mendapatkan key unik setiap halaman

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // WAJIB ada agar AnimatePresence mendeteksi pergantian
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }} // Animasi saat halaman keluar
        transition={{
          type: 'spring',
          stiffness: 100,
          damping: 20,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}