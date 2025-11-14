'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Package, Star, Clock, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Notification = {
  id: string;
  type: 'order' | 'review' | 'order_status' | 'review_reply';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  orderId?: number;
  reviewId?: number;
  link?: string;
  status?: string;
  umkmName?: string;
};

export default function HeaderNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
    
    // Polling setiap 30 detik untuk update notifikasi
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      
      // Untuk user biasa, ambil notifikasi user (review reply, order status)
      // Untuk pengusaha, ambil notifikasi dashboard (order masuk, review masuk)
      const response = await fetch('/api/user/notifications');
      
      if (response.ok) {
        const data = await response.json();
        const filteredNotifications = filterReadNotifications(data.notifications || []);
        setNotifications(filteredNotifications);
      } else {
        // Fallback ke array kosong jika ada error
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function untuk filter notifikasi yang sudah dibaca
  const filterReadNotifications = (notifications: Notification[]) => {
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    return notifications.map(notif => ({
      ...notif,
      isRead: readNotifications.includes(notif.id)
    }));
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update UI dulu
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
      
      // Simpan ke localStorage
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      if (!readNotifications.includes(notificationId)) {
        readNotifications.push(notificationId);
        localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
      }
      
      // Call API untuk mark as read (untuk saat ini hanya log, nanti bisa disimpan ke database)
      await fetch(`/api/user/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    markAsRead(notification.id);
    setIsOpen(false);
    
    // Route berdasarkan tipe notifikasi
    if (notification.type === 'order_status' && notification.orderId) {
      // Redirect ke halaman status pesanan
      router.push(`/status/${notification.orderId}`);
    } else if (notification.type === 'review_reply' && notification.link) {
      // Redirect ke UMKM dengan review yang dibalas
      router.push(notification.link);
    } else {
      // Default ke history untuk notifikasi lainnya
      router.push('/history');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-5"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 bg-background border border-border shadow-lg"
        sideOffset={5}
      >
        <div className="p-4 border-b bg-background border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifikasi</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {unreadCount} baru
              </Badge>
            )}
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Memuat notifikasi...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground bg-background">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Belum ada notifikasi terbaru
            </div>
          ) : (
            <div className="divide-y">
              {notifications.slice(0, 8).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent cursor-pointer transition-colors border-b border-border last:border-b-0 ${
                    !notification.isRead 
                      ? 'bg-primary/5 border-l-4 border-l-primary' 
                      : 'bg-background'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">
                      {notification.type === 'order' ? (
                        <div className="p-2 bg-green-100 dark:bg-green-800 rounded-full">
                          <Package className="h-4 w-4 text-green-700 dark:text-green-200" />
                        </div>
                      ) : (
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-800 rounded-full">
                          <Star className="h-4 w-4 text-yellow-700 dark:text-yellow-200" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <p className="text-sm font-medium truncate text-foreground">
                            {notification.title}
                          </p>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                          )}
                        </div>
                        
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-primary hover:text-primary/80 shrink-0 px-2 py-1 rounded bg-primary/10 hover:bg-primary/20 transition-colors"
                          >
                            Tandai dibaca
                          </button>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(notification.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 8 && (
          <div className="p-3 border-t bg-background border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs hover:bg-accent text-muted-foreground"
              onClick={() => {
                setIsOpen(false);
                router.push('/dashboard?tab=notifications');
              }}
            >
              Lihat Semua Notifikasi
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}