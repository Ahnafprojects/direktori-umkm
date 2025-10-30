// src/components/live-tracking-map.tsx
"use client";

type Props = {
  restoCoords: [number, number];
  userCoords: [number, number];
};

export default function LiveTrackingMap({ restoCoords, userCoords }: Props) {
  return (
    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
      <p className="text-gray-500">
        Live Tracking Map - Restaurant: {restoCoords[0]?.toFixed(4)},{" "}
        {restoCoords[1]?.toFixed(4)} | User: {userCoords[0]?.toFixed(4)},{" "}
        {userCoords[1]?.toFixed(4)}
      </p>
    </div>
  );
}
