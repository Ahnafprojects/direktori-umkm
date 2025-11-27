"use client";

import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Building2, Users, Heart, Star } from "lucide-react";

type StatItem = {
  icon: any;
  value: number;
  label: string;
  suffix?: string;
};

export default function CountUpStats() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const stats: StatItem[] = [
    {
      icon: Building2,
      value: 150,
      label: "UMKM Terdaftar",
      suffix: "+",
    },
    {
      icon: Users,
      value: 500,
      label: "Pengguna Aktif",
      suffix: "+",
    },
    {
      icon: Heart,
      value: 1200,
      label: "Favorit Disimpan",
      suffix: "+",
    },
    {
      icon: Star,
      value: 98,
      label: "Kepuasan Pengguna",
      suffix: "%",
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="p-4 lg:p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* Hide icon on mobile */}
            <div className="hidden lg:flex w-14 h-14 bg-primary/10 rounded-full items-center justify-center mx-auto mb-4">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
              {isVisible ? (
                <CountUpAnimation
                  end={stat.value}
                  duration={2000}
                  suffix={stat.suffix}
                />
              ) : (
                "0"
              )}
            </div>
            <p className="text-sm lg:text-sm text-muted-foreground font-medium">
              {stat.label}
            </p>
          </Card>
        );
      })}
    </div>
  );
}

function CountUpAnimation({
  end,
  duration,
  suffix = "",
}: {
  end: number;
  duration: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }, [end, duration]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}
