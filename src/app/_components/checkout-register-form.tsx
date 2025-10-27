// File: src/app/_components/checkout-register-form.tsx
'use client';

import { useState } from 'react';
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
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/checkout';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: 'PELANGGAN' // OTOMATIS PELANGGAN untuk checkout
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mendaftar.');
      }

      // Redirect ke login dengan parameter redirect dan registered
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}&registered=true&checkout=true`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-md shadow-2xl border bg-card">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-10 h-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Daftar untuk Checkout
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Buat akun pelanggan untuk melanjutkan pembelian Anda
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>{error}</p>
              </div>
            )}
            
            {/* Info Box */}
            <div className="bg-muted border border-border p-4 rounded-xl text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium text-foreground">Akun Pelanggan</p>
                  <p className="text-xs mt-1">Anda akan terdaftar sebagai pelanggan untuk dapat berbelanja di platform UMKM kami.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Nama Lengkap
              </Label>
              <Input 
                id="name" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                disabled={isLoading}
                className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Email Address
              </Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={isLoading}
                className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200"
                placeholder="nama@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                disabled={isLoading}
                className="h-12 border-border focus:border-primary focus:ring-primary/20 rounded-xl transition-all duration-200"
                placeholder="Masukkan password yang kuat"
              />
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
                  <ShoppingCart className="w-5 h-5" />
                  Daftar & Lanjut Checkout
                </span>
              )}
            </Button>
            
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <Link 
                  href={`/login?redirect=${encodeURIComponent(redirectTo)}&checkout=true`}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Masuk di sini
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