// src/components/client-hydrator.tsx
'use client';

import { useState, useEffect } from 'react';

// Komponen ini bertugas "menunggu" sampai client siap
// sebelum merender komponen client-side lainnya
export default function ClientHydrator({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Jika belum di-mount (masih di server atau baru render), jangan render apa-apa
  if (!isMounted) {
    return null;
  }

  // Jika sudah di-mount (sudah di client), render children
  return <>{children}</>;
}