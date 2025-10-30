// File: src/app/profil/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, User } from 'lucide-react';
import Link from 'next/link';

export default function ProfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync name state with session when it loads
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-8 w-32 rounded bg-gray-200 animate-pulse" />
          <div className="h-64 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }

    console.log('[PROFIL] Updating name to:', name.trim());
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      console.log('[PROFIL] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[PROFIL] Error response:', errorData);
        throw new Error(errorData.error || 'Gagal mengupdate profil');
      }

      const data = await response.json();
      console.log('[PROFIL] Success response:', data);

      // Update session dengan nama baru
      await update({ name: data.user.name });

      toast.success('Profil berhasil diupdate!');
      
      // Refresh page to show updated name everywhere
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('[PROFIL] Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Gagal mengupdate profil');
    } finally {
      setIsLoading(false);
    }
  };

  const user = session.user;
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </Link>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.image ?? ''} alt={user?.name ?? ''} />
                <AvatarFallback className="text-2xl">{userInitial}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Profil Saya</CardTitle>
                <CardDescription>
                  Kelola informasi profil Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateName} className="space-y-6">
              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email tidak dapat diubah
                </p>
              </div>

              {/* Name (Editable) */}
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  required
                />
              </div>

              {/* Role (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="role">Peran</Label>
                <Input
                  id="role"
                  type="text"
                  // @ts-ignore
                  value={user?.role === 'PENGUSAHA' ? 'Pengusaha UMKM' : 'Pelanggan'}
                  disabled
                  className="bg-muted"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setName(session?.user?.name || '')}
                  disabled={isLoading}
                >
                  Reset
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || name === session?.user?.name}
                  className="gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
