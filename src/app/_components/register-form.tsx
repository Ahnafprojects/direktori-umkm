// File: src/app/_components/register-form.tsx
'use client';

import { useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Link from 'next/link';

export default function RegisterForm() {
  const router = useRouter();
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

      // Jika pendaftaran berhasil
      alert('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
      router.push('/login'); // Arahkan ke halaman login
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
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
            <RadioGroup defaultValue="PELANGGAN" onValueChange={setRole} className="flex gap-4 pt-1" disabled={isLoading}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PELANGGAN" id="r1" />
                <Label htmlFor="r1">Pelanggan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PENGUSAHA" id="r2" />
                <Label htmlFor="r2">Pengusaha UMKM</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Daftar'}
          </Button>
          <div className="text-center text-sm w-full">
            Sudah punya akun?{' '}
            <Link href="/login" className="underline">
              Masuk di sini
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}