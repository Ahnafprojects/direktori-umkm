// src/components/location-accuracy-tips.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronDown,
  ChevronUp,
  MapPin,
  Smartphone,
  Wifi,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function LocationAccuracyTips() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTestingLocation, setIsTestingLocation] = useState(false);

  const handleTestLocation = () => {
    setIsTestingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Browser tidak mendukung geolokasi", { icon: "❌" });
      setIsTestingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        setIsTestingLocation(false);

        if (accuracy < 25) {
          toast.success(`🎯 GPS sangat akurat! (±${Math.round(accuracy)}m)`, {
            duration: 4000,
            style: { background: "#10b981", color: "white" },
          });
        } else if (accuracy < 100) {
          toast.success(`📍 GPS cukup akurat (±${Math.round(accuracy)}m)`, {
            duration: 4000,
            style: { background: "#059669", color: "white" },
          });
        } else if (accuracy < 500) {
          toast(`⚠️ GPS kurang akurat (±${Math.round(accuracy)}m)`, {
            duration: 4000,
            icon: "⚠️",
            style: { background: "#f59e0b", color: "white" },
          });
        } else {
          toast(`❌ GPS tidak akurat (±${Math.round(accuracy)}m)`, {
            duration: 5000,
            icon: "❌",
            style: { background: "#ef4444", color: "white" },
          });
        }
      },
      (error) => {
        setIsTestingLocation(false);
        let message = "Gagal test GPS";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Akses lokasi ditolak - Izinkan di pengaturan browser";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "GPS tidak tersedia - Coba keluar ke area terbuka";
            break;
          case error.TIMEOUT:
            message =
              "GPS timeout - Coba lagi dengan koneksi yang lebih stabil";
            break;
        }

        toast.error(message, { duration: 4000, icon: "❌" });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-0 h-auto"
        >
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Tips Akurasi Lokasi
          </CardTitle>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Smartphone className="h-4 w-4 mt-0.5 text-blue-500" />
              <div>
                <p className="font-medium">Aktifkan GPS</p>
                <p className="text-muted-foreground">
                  Pastikan GPS/Location Services aktif di pengaturan ponsel
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Wifi className="h-4 w-4 mt-0.5 text-green-500" />
              <div>
                <p className="font-medium">Keluar ke Area Terbuka</p>
                <p className="text-muted-foreground">
                  GPS lebih akurat di luar ruangan dengan langit terbuka
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <RefreshCw className="h-4 w-4 mt-0.5 text-orange-500" />
              <div>
                <p className="font-medium">Tunggu 10-15 Detik</p>
                <p className="text-muted-foreground">
                  GPS butuh waktu untuk mendapatkan sinyal yang akurat
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestLocation}
              disabled={isTestingLocation}
              className="flex-1"
            >
              {isTestingLocation ? (
                <>
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Testing GPS...
                </>
              ) : (
                <>
                  <MapPin className="h-3 w-3 mr-1" />
                  Test GPS
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh Halaman
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
