// File: src/app/_components/login-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingCart, ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const redirectTo = searchParams.get('redirect') || '/';
  const fromCheckout = searchParams.get('checkout') === 'true';
  const justRegistered = searchParams.get('registered') === 'true';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (justRegistered) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [justRegistered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Menggunakan 'credentials' sesuai dengan provider yang kita buat
      const result = await signIn('credentials', {
        redirect: false, // Penting: jangan redirect otomatis agar bisa handle error
        email,
        password,
      });

      if (result?.error) {
        // Jika NextAuth mengembalikan error (misal: password salah)
        setError('Email atau password salah. Silakan coba lagi.');
        setIsLoading(false);
      } else if (result?.ok) {
        // Jika login berhasil, redirect ke URL yang diminta atau halaman utama
        let finalRedirectUrl = redirectTo;
        
        // If user just registered, add registered=true parameter to homepage
        if (justRegistered && redirectTo === '/') {
          finalRedirectUrl = '/?registered=true';
        }
        
        router.push(finalRedirectUrl);
        router.refresh(); // Refresh halaman untuk memperbarui status sesi di header
      }
    } catch (error) {
      // Jika terjadi error tak terduga
      setError('Terjadi kesalahan. Silakan coba lagi nanti.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md shadow-2xl border bg-card">
        <CardHeader className="text-center space-y-4 pb-8">
          {fromCheckout ? (
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-10 h-10 text-primary-foreground" />
            </div>
          ) : (
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <LogIn className="w-10 h-10 text-primary-foreground" />
            </div>
          )}
          <CardTitle className="text-3xl font-bold text-foreground">
            {fromCheckout ? 'Masuk untuk Checkout' : 'Masuk ke Akun'}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {fromCheckout 
              ? 'Masuk ke akun Anda untuk melanjutkan pembelian'
              : 'Masukkan email dan password untuk melanjutkan'
            }
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {showSuccessMessage && justRegistered && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Pendaftaran Berhasil!</p>
                  <p className="text-xs mt-1">Sekarang masuk dengan akun yang baru dibuat.</p>
                </div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200 pr-12"
                  placeholder="Masukkan password Anda"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-6 pt-2">
            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold shadow-lg transition-all duration-200 transform hover:scale-[1.02]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {fromCheckout ? <ShoppingCart className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {fromCheckout ? 'Masuk & Lanjut Checkout' : 'Masuk'}
                </span>
              )}
            </Button>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Belum punya akun?{' '}
                <Link 
                  href={fromCheckout 
                    ? `/checkout/register?redirect=${encodeURIComponent(redirectTo)}` 
                    : `/register?redirect=${encodeURIComponent(redirectTo)}`
                  }
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  {fromCheckout ? 'Daftar untuk Checkout' : 'Daftar di sini'}
                </Link>
              </p>
              
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
