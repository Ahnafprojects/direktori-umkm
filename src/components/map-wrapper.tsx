'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Dynamic import untuk peta dengan ssr: false
const Map = dynamic(() => import('@/components/umkm-map'), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-64 rounded-md" />,
});

type MapWrapperProps = {
  latitude: number;
  longitude: number;
  popupText: string;
};

export default function MapWrapper({ latitude, longitude, popupText }: MapWrapperProps) {
  return (
    <div className="w-full h-64 rounded-md overflow-hidden">
      <Map
        latitude={latitude}
        longitude={longitude}
        popupText={popupText}
      />
    </div>
  );
}