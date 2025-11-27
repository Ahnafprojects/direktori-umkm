"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatDialog from "./chat-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

type ChatButtonProps = {
  umkmId: number;
  umkmName: string;
  isLoggedIn: boolean;
};

export default function ChatButton({
  umkmId,
  umkmName,
  isLoggedIn,
}: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling

    if (!isLoggedIn) {
      setShowLoginPrompt(true); // Tampilkan dialog login prompt
      return;
    }

    setIsOpen(true);
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 bg-background/95 backdrop-blur hover:bg-primary hover:text-primary-foreground"
        onClick={handleClick}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span className="text-xs">Chat</span>
      </Button>

      {/* Dialog Chat untuk user yang sudah login */}
      <ChatDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        umkmId={umkmId}
        umkmName={umkmName}
      />

      {/* Dialog Login Prompt untuk guest */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Login Diperlukan</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Untuk chat dengan{" "}
              <span className="font-semibold text-foreground">{umkmName}</span>,
              silakan login terlebih dahulu.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Link href="/login" className="w-full">
              <Button className="w-full" size="lg">
                Login Sekarang
              </Button>
            </Link>
            <Link href="/register" className="w-full">
              <Button variant="outline" className="w-full" size="lg">
                Daftar Akun Baru
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={() => setShowLoginPrompt(false)}
              className="mt-2"
            >
              Nanti Saja
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
