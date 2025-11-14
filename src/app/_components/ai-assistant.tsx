"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, Loader2, Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: "user" | "assistant";
  content: string;
  id?: number;
  timestamp?: number;
};

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { icon: "🗺️", text: "Bagaimana cara mencari UMKM di peta?" },
    { icon: "🍽️", text: "Rekomendasi makanan dan minuman enak?" },
    { icon: "❤️", text: "Cara menambahkan UMKM ke favorit?" },
    { icon: "📍", text: "Fitur live tracking dan navigasi?" },
    { icon: "🏪", text: "Cara daftar sebagai pemilik UMKM?" },
    { icon: "⭐", text: "Sistem rating dan review UMKM?" },
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      // Kita pakai viewport-nya ScrollArea
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages]);

  const sendMessage = async (questionText?: string) => {
    const question = questionText || input.trim();
    if (question === "" || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: question,
      id: Date.now(), // Add unique ID to prevent duplicates
    };

    setMessages((prev) => {
      // Check if message already exists to prevent duplicates
      const exists = prev.some(
        (msg) => msg.content === question && msg.role === "user"
      );
      if (exists) return prev;
      return [...prev, userMessage];
    });

    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        const fallbackResponse = await getSmartFallback(question);
        const assistantMessage: Message = {
          role: "assistant",
          content: fallbackResponse,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      const data = await response.json();

      setTimeout(() => {
        setIsTyping(false);
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          id: Date.now(),
          timestamp: Date.now(),
        };
        setMessages((prev) => {
          // Prevent duplicate responses
          const lastMessage = prev[prev.length - 1];
          if (
            lastMessage?.content === data.response &&
            lastMessage?.role === "assistant"
          ) {
            return prev;
          }
          return [...prev, assistantMessage];
        });
      }, 800);
    } catch (error) {
      console.error(error);
      setIsTyping(false);

      const fallbackResponse = await getSmartFallback(question);
      const assistantMessage: Message = {
        role: "assistant",
        content: fallbackResponse,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSmartFallback = async (question: string): Promise<string> => {
    const lowerQuestion = question.toLowerCase();

    // Cek pertanyaan tentang cara daftar UMKM
    if (
      lowerQuestion.includes("daftar") &&
      (lowerQuestion.includes("umkm") || lowerQuestion.includes("pemilik"))
    ) {
      return `🏪 **Cara Daftar Sebagai Pemilik UMKM:**

1. **Login** ke akun Anda terlebih dahulu
2. **Klik menu hamburger** (☰ - 3 garis) di pojok kanan atas
3. Pilih **"Profil"** dari menu dropdown
4. Di halaman profil, klik **"UMKM Saya"**
5. Kemudian klik **"Daftarkan UMKM Saya"**
6. Isi semua data UMKM dengan lengkap (nama, kategori, alamat, foto, dll)
7. Setelah berhasil, akun Anda otomatis upgrade jadi Pemilik UMKM! 

✨ *Tips: Pastikan data yang diisi akurat agar UMKM mudah ditemukan pelanggan.*`;
    }

    // Cek pertanyaan tentang peta
    if (
      lowerQuestion.includes("peta") ||
      lowerQuestion.includes("map") ||
      lowerQuestion.includes("mencari")
    ) {
      return `🗺️ **Cara Mencari UMKM di Peta:**

✨ **Di halaman utama, ada 3 fitur unggulan:**
1. **"Buka Sekarang"** - Lihat UMKM yang sedang buka
2. **"Lokasi Terdekat"** - Temukan UMKM di sekitar Anda  
3. **"Lihat Peta UMKM"** - Buka peta interaktif lengkap

🗺️ **Cara menggunakan peta:**
- Klik **"Lihat Peta UMKM"** di halaman utama
- Pilih **filter kategori** (Makanan, Minuman, Jasa, Fashion, dll)
- Klik **marker UMKM** di peta untuk detail & navigasi
- Gunakan **"Dapatkan Arah"** untuk GPS navigation

📍 **Tips**: Aktifkan lokasi browser untuk hasil yang lebih akurat!`;
    }

    // Cek pertanyaan tentang favorit
    if (
      lowerQuestion.includes("favorit") ||
      lowerQuestion.includes("favourite") ||
      lowerQuestion.includes("menambahkan umkm")
    ) {
      return `❤️ **Cara Menambahkan UMKM ke Favorit:**

📱 **Langkah Mudah:**
1. Buka **halaman detail UMKM** atau lihat di **kartu UMKM**
2. Klik **ikon hati (♡)** yang ada di card atau halaman detail
3. Ikon akan berubah menjadi **merah (♥)** jika sudah difavoritkan
4. Klik lagi untuk menghapus dari favorit

💾 **Penyimpanan:**
• **Sudah login?** Favorit tersimpan di akun Anda
• **Belum login?** Favorit tersimpan di browser (localStorage)
• Login nanti untuk sync favorit ke akun

📂 **Akses Favorit:**
• Klik menu **"Favorit"** di navigasi atas
• Atau buka dari menu hamburger (☰)
• Semua UMKM favorit akan muncul di satu halaman

🔔 **Manfaat:**
• Akses cepat ke UMKM favorit
• Dapat notifikasi update (jika login)
• Mudah bandingkan UMKM favorit`;
    }

    // Cek pertanyaan tentang live tracking
    if (
      lowerQuestion.includes("tracking") ||
      lowerQuestion.includes("navigasi") ||
      lowerQuestion.includes("arah") ||
      lowerQuestion.includes("fitur live")
    ) {
      return `📍 **Fitur Live Tracking & Navigasi:**

🚚 **Live Tracking Pesanan:**
• Setelah checkout, buka halaman **/status**
• Lihat simulasi driver yang sedang mengantar
• Tracking real-time dengan peta interaktif
• Estimasi waktu kedatangan ditampilkan

🗺️ **Navigasi ke UMKM:**
• Klik UMKM di peta atau halaman detail
• Pilih **"Dapatkan Arah"** atau **"Navigasi"**
• Website akan buka Google Maps untuk navigasi
• Bisa pakai GPS untuk rute tercepat

📱 **Tips:**
• Aktifkan GPS untuk tracking akurat
• Gunakan mode fullscreen untuk peta yang lebih besar
• Refresh halaman jika tracking tidak update`;
    }

    // Cek pertanyaan tentang rating & review
    if (
      lowerQuestion.includes("rating") ||
      lowerQuestion.includes("review") ||
      lowerQuestion.includes("ulasan") ||
      lowerQuestion.includes("sistem rating")
    ) {
      return `⭐ **Sistem Rating & Review UMKM:**

📝 **Cara Memberikan Review:**
1. **Login** ke akun Anda
2. Buka **halaman detail UMKM**
3. Scroll ke bagian **"Review & Rating"**
4. Klik **"Tulis Review"**
5. Pilih **rating bintang** (1-5)
6. Tulis **komentar** tentang pengalaman Anda
7. Klik **"Kirim Review"**

⭐ **Sistem Rating:**
• Rating: **1-5 bintang**
• Rata-rata rating dihitung otomatis
• UMKM dengan rating tinggi muncul di **"Rekomendasi Terpopuler"**
• Review terbaru ditampilkan di atas

🤖 **Fitur AI:**
• **Ringkasan AI**: Klik tombol AI untuk meringkas semua review
• AI akan analisis sentimen positif & negatif
• Dapat insight cepat tanpa baca semua review

💡 **Tips Review Berkualitas:**
• Jelaskan pengalaman spesifik Anda
• Sebutkan menu/produk yang dipesan
• Berikan saran konstruktif untuk pemilik`;
    }

    try {
      const response = await fetch("/api/umkm?limit=10");
      if (response.ok) {
        const umkms = await response.json();

        // Filter makanan dan minuman saja
        if (
          lowerQuestion.includes("makanan") ||
          lowerQuestion.includes("makan") ||
          lowerQuestion.includes("minuman") ||
          lowerQuestion.includes("minum") ||
          lowerQuestion.includes("rekomendasi")
        ) {
          const foodDrinkUmkms = umkms.filter((u: any) => {
            const category = u.category?.name?.toLowerCase() || "";
            const name = u.name?.toLowerCase() || "";
            return (
              (category.includes("makanan") ||
                category.includes("minuman") ||
                name.includes("nasi") ||
                name.includes("sate") ||
                name.includes("ayam") ||
                name.includes("bebek") ||
                name.includes("soto") ||
                name.includes("bakso") ||
                name.includes("mie") ||
                name.includes("kopi") ||
                name.includes("teh") ||
                name.includes("juice") ||
                name.includes("ice") ||
                name.includes("drink")) &&
              !category.includes("jasa") &&
              !category.includes("laundry")
            );
          });

          if (foodDrinkUmkms.length > 0) {
            const topRecommendations = foodDrinkUmkms
              .sort(
                (a: any, b: any) =>
                  (b.averageRating || 0) - (a.averageRating || 0)
              )
              .slice(0, 3);

            let response = `🍽️ **Rekomendasi Makanan & Minuman Terbaik:**\n\n`;
            topRecommendations.forEach((umkm: any, index: number) => {
              response += `${index + 1}. **${umkm.name}** ⭐ ${
                umkm.averageRating || "Belum ada rating"
              }\n`;
              response += `   📍 ${umkm.address}\n`;
              response += `   🏷️ ${
                umkm.category?.name || "Kategori tidak diketahui"
              }\n\n`;
            });
            response += `💡 *Klik UMKM untuk lihat menu lengkap dan review!*`;
            return response;
          }
        }

        if (
          lowerQuestion.includes("kebab") ||
          lowerQuestion.includes("pizza") ||
          lowerQuestion.includes("burger")
        ) {
          const specificFoodUmkms = umkms.filter(
            (u: any) =>
              u.name.toLowerCase().includes("kebab") ||
              u.name.toLowerCase().includes("pizza") ||
              u.name.toLowerCase().includes("burger")
          );
          if (specificFoodUmkms.length > 0) {
            return `🍔 Saya menemukan ${
              specificFoodUmkms.length
            } UMKM yang menjual makanan tersebut! Coba cek: ${specificFoodUmkms
              .slice(0, 2)
              .map((u: any) => u.name)
              .join(", ")}. Klik pada UMKM untuk melihat rating dan review!`;
          }
        }

        if (
          lowerQuestion.includes("rating") ||
          lowerQuestion.includes("terbaik") ||
          lowerQuestion.includes("bagus")
        ) {
          return `⭐ **Sistem Rating & Review:**
- Setiap UMKM memiliki sistem rating bintang 1-5
- Pelanggan bisa memberikan review setelah berkunjung
- UMKM dengan rating tinggi akan muncul di "Rekomendasi Terpopuler"
- Filter berdasarkan rating tersedia di halaman pencarian`;
        }

        if (lowerQuestion.includes("buka") || lowerQuestion.includes("jam")) {
          return `🕐 Informasi jam operasional tersedia di detail setiap UMKM. Sebagian besar UMKM buka jam 10:00-21:00, tapi ada juga yang 24 jam!`;
        }
      }
    } catch (error) {
      // Fallback
    }

    return `🤖 Maaf, saya sedang belajar tentang pertanyaan ini. 

Sementara itu, coba:
- Gunakan fitur **Peta** untuk cari UMKM terdekat
- Cek **Favorit** untuk UMKM yang sudah Anda simpan
- Buka **Profil** untuk daftar UMKM atau lihat riwayat
- Gunakan **Filter Kategori** untuk cari UMKM spesifik

Ada pertanyaan lain yang bisa saya bantu? 😊`;
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
        <DialogContent className="w-[95vw] sm:max-w-2xl lg:max-w-3xl h-[90vh] sm:h-[85vh] max-h-[600px] sm:max-h-[700px] lg:max-h-[800px] flex flex-col p-0 gap-0 rounded-lg sm:rounded-2xl border shadow-xl">
          {/* Theme-Consistent Header */}
          <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-muted/30">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md ring-2 ring-primary/20">
                <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-foreground">
                  LokalKeren Assistant
                </DialogTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Smart UMKM Information Helper
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Proper Chat Area dengan Scroll */}
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea
              className="flex-1 px-3 sm:px-6 py-3 sm:py-4 min-h-0"
              ref={scrollAreaRef}
            >
              <div className="space-y-4 pb-4">
                {/* Welcome Message - Show full layout when no messages */}
                {messages.length === 0 && (
                  <div className="text-center space-y-6 py-8">
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-semibold">
                        Halo! Saya LokalKeren Assistant
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                        Tanya saya tentang fitur peta UMKM, cara favorit, live
                        tracking, registrasi pemilik UMKM, atau panduan lengkap
                        website ini.
                      </p>
                    </div>

                    {/* Quick Questions in Welcome - Vertical List */}
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Pertanyaan yang sering ditanyakan:
                      </p>
                      <div className="space-y-2 max-w-xl mx-auto">
                        {quickQuestions.map((q, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            onClick={() => sendMessage(q.text)}
                            disabled={isLoading}
                            className="w-full h-auto px-4 py-3 text-left justify-start hover:bg-primary/10 hover:border-primary/50 transition-all group border-border/60"
                          >
                            <span className="mr-3 text-xl group-hover:scale-110 transition-transform">
                              {q.icon}
                            </span>
                            <span className="text-sm">{q.text}</span>
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
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <>
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          <Bot className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1 max-w-[80%] lg:max-w-[85%]">
                          <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3 lg:px-5 lg:py-4 shadow-sm">
                            <div className="chat-markdown leading-relaxed">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  // Custom renderer untuk paragraph agar \n jadi line break
                                  p: ({ children }) => {
                                    return (
                                      <p className="my-2 whitespace-pre-line">
                                        {children}
                                      </p>
                                    );
                                  },
                                  // Strong (bold) dengan styling yang jelas
                                  strong: ({ children }) => {
                                    return (
                                      <strong className="font-bold text-foreground">
                                        {children}
                                      </strong>
                                    );
                                  },
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                          <p className="text-xs lg:text-sm text-muted-foreground mt-1 px-1">
                            AI •{" "}
                            {new Date(
                              msg.timestamp || Date.now()
                            ).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </>
                    )}

                    {msg.role === "user" && (
                      <div className="max-w-[80%] lg:max-w-[85%] flex justify-end">
                        <div className="flex items-end gap-2 lg:gap-3">
                          <div>
                            <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 lg:px-5 lg:py-4 shadow-sm">
                              <p className="text-sm lg:text-base leading-relaxed">
                                {msg.content}
                              </p>
                            </div>
                            <p className="text-xs lg:text-sm text-muted-foreground mt-1 px-1 text-right">
                              Anda •{" "}
                              {new Date(
                                msg.timestamp || Date.now()
                              ).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="w-7 h-7 lg:w-9 lg:h-9 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <div className="w-4 h-4 lg:w-5 lg:h-5 bg-primary rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading - Theme Consistent */}
                {(isLoading || isTyping) && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm animate-pulse">
                      <Bot className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" />
                    </div>
                    <div className="bg-muted/50 border border-border rounded-2xl rounded-tl-sm px-4 py-3 lg:px-5 lg:py-4 shadow-sm">
                      <div className="flex gap-1 lg:gap-1.5">
                        <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-primary rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-primary/70 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-primary/50 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <p className="text-xs lg:text-sm text-muted-foreground mt-2">
                        AI sedang menganalisis...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Theme-Consistent Input Area */}
          <div className="border-t bg-muted/30">
            {/* Quick Questions - Horizontal Scroll (Only when chat started) */}
            {messages.length > 0 && (
              <div className="px-3 sm:px-4 pt-3 pb-2">
                <p className="text-xs text-muted-foreground mb-2">
                  Mulai mengetik...
                </p>
                <div className="overflow-x-auto scrollbar-hide -mx-3 sm:-mx-4 px-3 sm:px-4">
                  <div className="flex gap-2 pb-2 min-w-max">
                    {quickQuestions.map((q, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => sendMessage(q.text)}
                        disabled={isLoading}
                        size="sm"
                        className="h-auto px-3 py-2 text-xs whitespace-nowrap hover:bg-primary/10 hover:border-primary/50 transition-all group shrink-0"
                      >
                        <span className="mr-1.5 group-hover:scale-110 transition-transform">
                          {q.icon}
                        </span>
                        <span>{q.text}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 sm:p-4">
              <div className="relative">
                <Input
                  placeholder="Tanya tentang fitur peta, favorit, live tracking, atau panduan website..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                  className="h-10 sm:h-12 lg:h-14 pr-12 sm:pr-14 lg:pr-16 rounded-lg sm:rounded-xl border-2 border-border focus:border-primary/50 focus:ring-primary/20 bg-background shadow-sm transition-all text-xs sm:text-sm lg:text-base"
                />

                <Button
                  onClick={(e) => handleSubmit(e as any)}
                  size="icon"
                  disabled={isLoading || input.trim() === ""}
                  className="absolute right-1 top-1 h-8 w-8 sm:h-9 sm:w-9 lg:h-11 lg:w-11 rounded-full bg-primary hover:bg-primary/90 transition-colors shadow-sm"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 lg:h-5 lg:w-5 animate-spin text-primary-foreground" />
                  ) : (
                    <Send className="h-4 w-4 lg:h-5 lg:w-5 text-primary-foreground" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
