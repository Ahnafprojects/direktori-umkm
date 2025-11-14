'use client';

import { useSession } from 'next-auth/react';
import AiAssistant from './ai-assistant';

export default function AiAssistantWrapper() {
  const { data: session, status } = useSession();

  // Loading state - jangan tampilkan apa-apa
  if (status === 'loading') {
    return null;
  }

  // AI Assistant sekarang tersedia untuk semua role (guest, customer, umkm owner)
  // Sebagai sumber informasi website dan panduan penggunaan
  return <AiAssistant />;
}