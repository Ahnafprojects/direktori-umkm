'use client';

import { useSession } from 'next-auth/react';
import AiAssistant from './ai-assistant';

export default function AiAssistantWrapper() {
  const { data: session, status } = useSession();

  // Loading state - jangan tampilkan apa-apa
  if (status === 'loading') {
    return null;
  }

  // User belum login (guest) - tampilkan AI Assistant
  if (!session) {
    return <AiAssistant />;
  }

  // User sudah login - cek role
  if (session.user) {
    // Jika user adalah owner UMKM - jangan tampilkan AI Assistant
    if (session.user.role === 'UMKM_OWNER') {
      return null;
    }

    // Jika user adalah customer biasa - tampilkan AI Assistant
    if (session.user.role === 'CUSTOMER') {
      return <AiAssistant />;
    }
  }

  // Default: jangan tampilkan
  return null;
}