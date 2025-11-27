"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

type ShareButtonProps = {
  title: string;
  excerpt: string;
};

export default function ShareButton({ title, excerpt }: ShareButtonProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        text: excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link berhasil disalin!");
    }
  };

  return (
    <Button variant="outline" onClick={handleShare}>
      <Share2 className="h-4 w-4 mr-2" />
      Bagikan
    </Button>
  );
}
