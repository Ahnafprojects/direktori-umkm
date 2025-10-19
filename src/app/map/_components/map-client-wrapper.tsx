// src/app/map/_components/map-client-wrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// 1. Dynamic import dalam Client Component (ini diperbolehkan)
const UmkmBulkMap = dynamic(() => import('@/components/umkm-bulk-map'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full" />,
});

type MapClientWrapperProps = {
  pins: any[];
  center: [number, number];
};

export default function MapClientWrapper({ pins, center }: MapClientWrapperProps) {
  return <UmkmBulkMap pins={pins} center={center} />;
}