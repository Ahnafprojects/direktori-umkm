// src/app/_components/review-summarizer.tsx
"use client";

import { useState } from "react";
import { Review } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";

type ReviewWithUser = Review & {
  user?: {
    id: string;
    name: string;
  };
};

type Props = {
  umkmName: string;
  reviews: ReviewWithUser[]; // Menerima data ulasan dengan user data
};

export default function ReviewSummarizer({ umkmName, reviews }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [summarySource, setSummarySource] = useState<"ai" | "fallback" | null>(
    null
  );

  const handleSummarize = async () => {
    setIsLoading(true);
    setIsOpen(true);

    try {
      // Prepare the review data - only send comment and rating
      const reviewsData = reviews.map((review) => ({
        comment: review.comment,
        rating: review.rating,
      }));

      console.log("Sending data to API:", { umkmName, reviews: reviewsData });

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ umkmName, reviews: reviewsData }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", errorText);
        try {
          const parsed = JSON.parse(errorText);
          setErrorDetail(parsed.details || parsed.error || errorText);
        } catch {
          setErrorDetail(errorText);
        }
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Response data:", data);
      setSummary(data.summary || "Tidak ada ringkasan.");
      if (data._source === "fallback") setSummarySource("fallback");
      else setSummarySource("ai");
    } catch (error) {
      console.error("Error in handleSummarize:", error);
      setSummary(
        "Maaf, terjadi kesalahan saat membuat ringkasan. Silakan coba lagi."
      );
      if (error instanceof Error) setErrorDetail(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Jangan tampilkan tombol jika ulasan terlalu sedikit
  if (reviews.length < 2) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Tombol Pemicu */}
      <Button variant="outline" onClick={handleSummarize} disabled={isLoading}>
        <Sparkles className="mr-2 h-4 w-4" />
        {isLoading ? "Menganalisis..." : "Ulasan"}
      </Button>

      {/* Pop-up Hasil */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center">
            Ringkasan AI untuk &ldquo;{umkmName}&rdquo;
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Dianalisis dari {reviews.length} ulasan pengguna.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <p className="text-lg italic text-center">
              " &ldquo;{summary}&rdquo;"
              {summarySource === "fallback" && (
                <span className="block text-sm mt-2 text-muted-foreground">
                  (Ringkasan dibuat menggunakan fallback lokal)
                </span>
              )}
              {errorDetail && (
                <span className="block text-sm mt-2 text-red-500">
                  Detail: {errorDetail}
                </span>
              )}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
