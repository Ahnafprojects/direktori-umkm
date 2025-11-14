'use client';

import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Store, ChevronRight, Package } from 'lucide-react';
import Link from 'next/link';
import AnalyticsTab from './analytics-tab';
import IncomingOrdersTab from './incoming-orders-tab';

export default function DashboardTabs() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'analytics';

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-auto">
        <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 py-2">
          Analytics
        </TabsTrigger>
        <TabsTrigger value="orders" className="text-xs sm:text-sm px-2 py-2">
          Pesanan
        </TabsTrigger>
        <TabsTrigger value="products" className="text-xs sm:text-sm px-2 py-2">
          Kelola UMKM
        </TabsTrigger>
      </TabsList>
      
      {/* --- Tab Analytics --- */}
      <TabsContent value="analytics" className="mt-3 sm:mt-4 md:mt-6">
        <AnalyticsTab />
      </TabsContent>
      
      {/* --- Tab Pesanan Masuk --- */}
      <TabsContent value="orders" className="mt-3 sm:mt-4 md:mt-6">
        <div className="bg-card rounded-lg border border-border shadow-sm">
          <div className="p-3 sm:p-4 md:p-6 border-b border-border">
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground">Pesanan Masuk</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Kelola pesanan dari pelanggan UMKM Anda</p>
          </div>
          <div className="p-3 sm:p-4 md:p-6">
            <IncomingOrdersTab />
          </div>
        </div>
      </TabsContent>
      
      {/* --- Tab Kelola UMKM --- */}
      <TabsContent value="products" className="mt-3 sm:mt-4 md:mt-6">
        <div className="bg-card rounded-lg border border-border">
          <div className="p-3 sm:p-4 md:p-6 border-b border-border">
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground">Kelola UMKM</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">Kelola dan edit informasi UMKM Anda</p>
          </div>
          <div className="p-3 sm:p-4 md:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="grid gap-3 grid-cols-1">
                <Button 
                  asChild 
                  className="w-full justify-start h-auto p-3 sm:p-4 md:p-6 bg-gradient-to-r from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20 dark:border-primary/30 hover:from-primary/10 hover:to-primary/20 dark:hover:from-primary/20 dark:hover:to-primary/30 text-left transition-all duration-200"
                  variant="outline"
                >
                  <Link href="/dashboard/umkm/saya" className="w-full">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 bg-primary dark:bg-primary rounded-lg flex-shrink-0">
                        <Store className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-foreground mb-1 text-sm sm:text-base">
                          Kelola Produk & Informasi UMKM
                        </h5>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          Tambah, edit, atau hapus produk. 
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0 self-center sm:self-auto" />
                    </div>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}