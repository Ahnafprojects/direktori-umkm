'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EditableReview from "@/app/_components/editable-review";
import EditableOwnerReply from "@/app/_components/editable-owner-reply";
import OwnerReplyForm from "@/app/_components/owner-reply-form";
import ClientHydrator from "@/components/client-hydrator";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
  ownerReply?: string | null;
  ownerReplyAt?: string | null;
  user: {
    id: string;
    name: string;
  };
}

interface ReviewSectionProps {
  initialReviews: Review[];
  currentUserId: string | null;
  umkmOwnerId: string | null;
}

export default function ReviewSection({ 
  initialReviews, 
  currentUserId, 
  umkmOwnerId 
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const handleReviewUpdate = (updatedReview: Review) => {
    setReviews(prev => 
      prev.map(review => 
        review.id === updatedReview.id ? updatedReview : review
      )
    );
  };

  const handleReviewDelete = (reviewId: string) => {
    setReviews(prev => prev.filter(review => review.id !== reviewId));
  };

  const handleReplyUpdate = (reviewId: string, updatedReply: { ownerReply: string; ownerReplyAt?: string | null }) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { ...review, ...updatedReply }
          : review
      )
    );
  };

  const handleReplyDelete = (reviewId: string) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { ...review, ownerReply: null, ownerReplyAt: null }
          : review
      )
    );
  };

  const handleNewReply = (reviewId: string, ownerReply: string) => {
    setReviews(prev =>
      prev.map(review =>
        review.id === reviewId
          ? { 
              ...review, 
              ownerReply, 
              ownerReplyAt: new Date().toISOString() 
            }
          : review
      )
    );
  };

  return (
    <div className="space-y-8">
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id} className="border-b border-border/50 pb-6 mb-6 last:border-b-0 last:pb-0 last:mb-0">
            {/* Customer Review */}
            <div className="flex gap-3 sm:gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="text-sm font-medium">
                  {review.user?.name
                    ? review.user.name.substring(0, 2).toUpperCase()
                    : "AN"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <EditableReview
                  review={review}
                  currentUserId={currentUserId}
                  onReviewUpdate={handleReviewUpdate}
                  onReviewDelete={handleReviewDelete}
                />

                {/* Owner Reply (jika ada) */}
                {review.ownerReply && (
                  <div className="mt-4 pl-4 border-l-2 border-primary/20">
                    <EditableOwnerReply
                      reviewId={review.id}
                      reply={{
                        ownerReply: review.ownerReply,
                        ownerReplyAt: review.ownerReplyAt
                      }}
                      currentUserId={currentUserId}
                      umkmOwnerId={umkmOwnerId}
                      onReplyUpdate={(updatedReply) => handleReplyUpdate(review.id, updatedReply)}
                      onReplyDelete={() => handleReplyDelete(review.id)}
                    />
                  </div>
                )}

                {/* Owner Reply Form - hanya tampil untuk owner dan belum ada reply */}
                <ClientHydrator>
                  {currentUserId && currentUserId === umkmOwnerId && !review.ownerReply && (
                    <OwnerReplyForm 
                      reviewId={review.id} 
                      onReplyAdded={(ownerReply) => handleNewReply(review.id, ownerReply)}
                    />
                  )}
                </ClientHydrator>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-muted-foreground">
          Jadilah yang pertama memberi ulasan!
        </p>
      )}
    </div>
  );
}