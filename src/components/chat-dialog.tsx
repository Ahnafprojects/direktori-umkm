"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

type Message = {
  id: number;
  text: string;
  sender: "user" | "umkm";
  timestamp: Date;
};

type ChatDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  umkmId: number;
  umkmName: string;
};

const AUTO_REPLIES = [
  "Terima kasih sudah menghubungi kami! Ada yang bisa kami bantu?",
  "Mohon maaf, saat ini kami sedang sibuk. Kami akan segera membalas pesan Anda.",
  "Halo! Terima kasih atas pertanyaannya. Untuk informasi lebih detail, silakan hubungi kami langsung.",
  "Baik, noted. Kami akan segera proses pesanan Anda.",
  "Untuk harga dan ketersediaan produk, silakan kunjungi halaman produk kami.",
];

export default function ChatDialog({
  isOpen,
  onClose,
  umkmId,
  umkmName,
}: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Halo! Selamat datang di ${umkmName}. Ada yang bisa kami bantu?`,
      sender: "umkm",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate UMKM reply after 1-2 seconds
    setTimeout(() => {
      const randomReply =
        AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)];
      const umkmMessage: Message = {
        id: messages.length + 2,
        text: randomReply,
        sender: "umkm",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, umkmMessage]);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="text-lg">{umkmName}</DialogTitle>
          <p className="text-xs text-muted-foreground">
            💬 Chat Simulasi - Pesan ini hanya untuk demo
          </p>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4 py-3" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 ${
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-[10px] mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t px-4 py-3">
          <div className="flex gap-2">
            <Input
              placeholder="Ketik pesan..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
