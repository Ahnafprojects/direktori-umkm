// File: src/app/_components/login-form.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
import Link from 'next/link';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        // Jika login berhasil
        router.push('/'); // Arahkan kembali ke halaman utama
        router.refresh(); // Refresh halaman untuk memperbarui status sesi di header
      }
    } catch (error) {
      // Jika terjadi error tak terduga
      setError('Terjadi kesalahan. Silakan coba lagi nanti.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Masuk ke Akun</CardTitle>
        <CardDescription>
          Masukkan email dan password untuk melanjutkan.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="grid gap-4">
          {error && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
              <p>{error}</p>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </Button>
          <div className="text-center text-sm w-full">
            Belum punya akun?{' '}
            {/* Kita akan buat halaman register nanti */}
            <Link href="/register" className="underline">
              Daftar di sini
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}