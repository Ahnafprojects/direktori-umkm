// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import Header from "./_components/header";
import Footer from "./_components/footer";
import { cn } from "@/lib/utils";
import PageTransitionWrapper from "./page-transition-wrapper";
import AuthProvider from "./auth-provider";
import { ThemeProvider } from "./theme-provider";
import FloatingCartButton from "./_components/floating-cart-button";
import FavoritesProvider from "./_components/favorites-provider";
import ClientHydrator from "@/components/client-hydrator";
import WelcomeModal from "./_components/welcome-modal";
import AiAssistantWrapper from "./_components/ai-assistant-wrapper";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Direktori UMKM LokalKeren",
  description: "Bikin Keren UMKM Lokal: Direktori Digital Lingkungan Sekitar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.className
        )}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <FavoritesProvider>
              <ClientHydrator>
                <WelcomeModal />
                <AiAssistantWrapper />
              </ClientHydrator>

              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <PageTransitionWrapper>{children}</PageTransitionWrapper>
                </main>
                <Footer />
              </div>

              <FloatingCartButton />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 2000,
                }}
              />
            </FavoritesProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
