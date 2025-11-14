'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Package, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Notification = {
  id: number;
  type: 'order' | 'review';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  orderId?: number;
  reviewId?: number;
};

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/dashboard/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await fetch(`/api/dashboard/notifications/${notificationId}/read`, {
        method: 'PATCH'
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Memuat notifikasi...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifikasi
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada notifikasi terbaru
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                  notification.isRead 
                    ? 'bg-muted/20 border-muted' 
                    : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">
                    {notification.type === 'order' ? (
                      <Package className="h-4 w-4 text-green-600" />
                    ) : (
                      <Star className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
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
        
        {notifications.length > 5 && (
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full" asChild>
              <Link href="/dashboard/notifications">
                Lihat Semua Notifikasi
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}