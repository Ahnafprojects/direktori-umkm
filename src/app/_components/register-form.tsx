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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PELANGGAN'); // Default role
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
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Jika API mengembalikan error, tampilkan pesannya
        throw new Error(data.message || 'Gagal mendaftar.');
      }

      // Jika pendaftaran berhasil, redirect ke login dengan parameter
      router.push(`/login?redirect=${encodeURIComponent(redirectTo)}&registered=true`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-muted">
      <Card className="w-full max-w-sm shadow-2xl border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Buat Akun Baru</CardTitle>
          <CardDescription>
            Isi data di bawah ini untuk mendaftar.
          </CardDescription>
        </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="bg-destructive/15 p-3 rounded-md text-sm text-destructive">
              <p>{error}</p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
          </div>
          <div className="grid gap-2">
            <Label>Daftar sebagai</Label>
            <RadioGroup defaultValue="PELANGGAN" onValueChange={setRole} className="grid grid-cols-2 gap-3 pt-2" disabled={isLoading}>
              <div className="relative">
                <RadioGroupItem value="PELANGGAN" id="r1" className="peer sr-only" />
                <Label 
                  htmlFor="r1" 
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-border bg-card p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-foreground">Pelanggan</span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="PENGUSAHA" id="r2" className="peer sr-only" />
                <Label 
                  htmlFor="r2" 
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-border bg-card p-4 hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 peer-data-[state=checked]:text-primary cursor-pointer transition-all shadow-sm"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-foreground">Pengusaha UMKM</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg transition-all duration-200" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Daftar'}
          </Button>
          <div className="text-center text-sm w-full">
            Sudah punya akun?{' '}
            <Link href={`/login?redirect=${encodeURIComponent(redirectTo)}`} className="underline text-primary hover:text-primary/80 font-semibold transition-colors">
              Masuk di sini
            </Link>
          </div>
        </CardFooter>
      </form>
      </Card>
    </div>
  );
}