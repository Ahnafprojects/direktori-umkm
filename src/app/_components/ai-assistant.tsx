'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Send, Sparkles, Loader2, Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  id?: number;
  timestamp?: number;
};

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { icon: "❓", text: "Gimana cara kerja website ini?" },
    { icon: "🍜", text: "Rekomendasi makanan enak?" },
    { icon: "💳", text: "Cara pesan dan bayar?" },
    { icon: "📍", text: "UMKM terdekat dari lokasi saya?" }
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Kita pakai viewport-nya ScrollArea
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  const sendMessage = async (questionText?: string) => {
    const question = questionText || input.trim();
    if (question === '' || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: question,
      id: Date.now() // Add unique ID to prevent duplicates
    };
    
    setMessages((prev) => {
      // Check if message already exists to prevent duplicates
      const exists = prev.some(msg => msg.content === question && msg.role === 'user');
      if (exists) return prev;
      return [...prev, userMessage];
    });
    
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const fallbackResponse = await getSmartFallback(question);
        const assistantMessage: Message = { role: 'assistant', content: fallbackResponse };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      const data = await response.json();
      
      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.response,
          id: Date.now(),
          timestamp: Date.now()
        };
        setMessages((prev) => {
          // Prevent duplicate responses
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.content === data.response && lastMessage?.role === 'assistant') {
            return prev;
          }
          return [...prev, assistantMessage];
        });
      }, 800);

    } catch (error) {
      console.error(error);
      setIsTyping(false);
      
      const fallbackResponse = await getSmartFallback(question);
      const assistantMessage: Message = { role: 'assistant', content: fallbackResponse };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSmartFallback = async (question: string): Promise<string> => {
    const lowerQuestion = question.toLowerCase();
    
    try {
      const response = await fetch('/api/umkm?limit=10');
      if (response.ok) {
        const umkms = await response.json();
        
        if (lowerQuestion.includes('kebab') || lowerQuestion.includes('pizza') || lowerQuestion.includes('burger')) {
          const foodUmkms = umkms.filter((u: any) => 
            u.name.toLowerCase().includes('kebab') || 
            u.name.toLowerCase().includes('pizza') ||
            u.name.toLowerCase().includes('burger')
          );
          if (foodUmkms.length > 0) {
            return `🍔 Saya menemukan ${foodUmkms.length} UMKM yang menjual makanan tersebut! Coba cek: ${foodUmkms.slice(0,2).map((u: any) => u.name).join(', ')}. Klik pada UMKM untuk melihat rating dan review!`;
          }
        }
        
        if (lowerQuestion.includes('rating') || lowerQuestion.includes('terbaik') || lowerQuestion.includes('bagus')) {
          return `⭐ Untuk melihat UMKM dengan rating tertinggi, cek bagian 'Rekomendasi Terpopuler' di halaman utama. UMKM disortir berdasarkan jumlah favorit dan review positif!`;
        }
        
        if (lowerQuestion.includes('buka') || lowerQuestion.includes('jam')) {
          return `🕐 Informasi jam buka tersedia di detail setiap UMKM. Sebagian besar buka jam 10:00-21:00, tapi ada juga yang 24 jam!`;
        }
      }
    } catch (error) {
      // Fallback
    }
    
    return "💡 Maaf AI sedang maintenance. Coba explore halaman utama atau gunakan fitur pencarian untuk menemukan UMKM yang Anda cari!";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <>
      {/* Theme-Consistent Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 hover:shadow-xl hover:scale-105 transition-all duration-200"
        size="icon"
      >
        <Sparkles className="h-5 w-5 text-primary-foreground" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse"></div>
      </Button>

      {/* Minimalist Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg w-[95vw] h-[85vh] max-h-[700px] flex flex-col p-0 gap-0 rounded-2xl border shadow-xl">
          
          {/* Theme-Consistent Header */}
          <DialogHeader className="px-6 py-4 border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-md ring-2 ring-primary/20">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">
                  🎯 Keren Assistant
                </DialogTitle>
                <p className="text-sm text-muted-foreground">✨ Your Smart UMKM Companion</p>
              </div>
            </div>
          </DialogHeader>

          {/* Proper Chat Area dengan Scroll */}
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 px-6 py-4 min-h-0" ref={scrollAreaRef}>
              <div className="space-y-4 pb-4">
                
                {/* Welcome Message */}
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="text-center space-y-2 py-8">
                      <h3 className="text-lg font-semibold">🎯 Halo! Saya Keren Assistant</h3>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Tanya saya tentang UMKM, tempat nongkrong, atau rekomendasi apa saja! Saya siap membantu Anda. 
                      </p>
                    </div>
                    
                    {/* Quick Questions - Responsive */}
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground text-center">
                        � Pertanyaan yang sering ditanyakan:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {quickQuestions.map((q, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            onClick={() => sendMessage(q.text)}
                            disabled={isLoading}
                            className="h-auto p-3 justify-start text-left hover:bg-muted/80 hover:border-primary/50 transition-all duration-200 group"
                          >
                            <span className="text-sm mr-2 group-hover:scale-110 transition-transform">{q.icon}</span>
                            <span className="text-xs leading-tight font-medium">{q.text}</span>
                          </Button>
                        ))}
                      </div>
                  </div>
                </div>
              )}

              {/* Messages - Clean Design */}
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <>
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 max-w-[80%]">
                        <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                          <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1">
                          AI • {new Date(msg.timestamp || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </>
                  )}

                  {msg.role === 'user' && (
                    <div className="max-w-[80%] flex justify-end">
                      <div className="flex items-end gap-2">
                        <div>
                          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm">
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 px-1 text-right">
                            Anda • {new Date(msg.timestamp || Date.now()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-4 h-4 bg-primary rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading - Theme Consistent */}
              {(isLoading || isTyping) && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm animate-pulse">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">AI sedang berpikir...</p>
                  </div>
                </div>
              )}
              </div>
            </ScrollArea>
          </div>

          {/* Theme-Consistent Input Area */}
          <div className="p-4 border-t bg-muted/30">
            <div className="relative">
              <Input
                placeholder="💭 Tanya sesuatu tentang UMKM..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                  }
                }}
                className="h-12 pr-14 rounded-xl border-2 border-border focus:border-primary/50 focus:ring-primary/20 bg-background shadow-sm transition-all"
              />
              
              <Button 
                onClick={(e) => handleSubmit(e as any)}
                size="icon"
                disabled={isLoading || input.trim() === ''}
                className="absolute right-1 top-1 h-9 w-9 rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" />
                ) : (
                  <Send className="h-4 w-4 text-primary-foreground" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
