// src/app/_components/autocomplete-search.tsx
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce'; // Kita pakai library kecil ini

import { getUmkmSuggestions } from '@/lib/actions';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Loader2, Search, Store } from 'lucide-react';

type Suggestion = {
  id: number;
  name: string;
  slug: string;
};

export default function AutocompleteSearch() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Transisi untuk loading state non-blocking
  const [isPending, startTransition] = useTransition();

  // Debounce input value: Tunda eksekusi 300ms setelah user berhenti mengetik
  const [debouncedValue] = useDebounce(inputValue, 300);

  // Efek ini berjalan saat 'debouncedValue' berubah
  useEffect(() => {
    // Jangan cari jika input kosong
    if (debouncedValue.length > 1) {
      // Tampilkan loading spinner
      startTransition(async () => {
        // Panggil Server Action kita
        const results = await getUmkmSuggestions(debouncedValue);
        setSuggestions(results);
        setIsOpen(true); // Buka dropdown saat ada hasil
      });
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  }, [debouncedValue]); // <-- Dependensi ke nilai yang sudah di-debounce

  // Fungsi saat user memilih item
  const handleSelect = (slug: string) => {
    setIsOpen(false);
    setInputValue(''); // Kosongkan input
    router.push(`/umkm/${slug}`); // Navigasi ke halaman detail
  };

  // Fungsi saat user menekan Enter di search bar
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsOpen(false);
    // Navigasi ke halaman search (seperti search bar lama)
    router.push(`/?search=${inputValue}`);
  };

  return (
    // Kita tetap pakai <form> agar tombol Enter berfungsi
    <form onSubmit={handleFormSubmit} className="flex-1 relative">
      <Command className="overflow-visible">
        <CommandInput
          placeholder="Cari bakso, kopi, atau jasa..."
          value={inputValue}
          onValueChange={setInputValue} // Update state saat diketik
          onFocus={() => setIsOpen(suggestions.length > 0)} // Buka jika ada saran
          onBlur={() => setTimeout(() => setIsOpen(false), 150)} // Tutup saat fokus hilang
        />
        
        {/* Ikon Search di dalam input */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
        </div>

        {/* Dropdown Hasil Pencarian */}
        {isOpen && (
          <div className="absolute top-full z-50 w-full rounded-md border bg-popover text-popover-foreground shadow-md mt-1">
            <CommandList>
              <CommandEmpty>
                {isPending ? 'Mencari...' : 'Tidak ada hasil.'}
              </CommandEmpty>
              
              <CommandGroup heading="Saran UMKM">
                {suggestions.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelect(item.slug)} // Aksi saat diklik
                    value={item.name} // Dibutuhkan oleh Command
                    className="cursor-pointer"
                  >
                    <Store className="mr-2 h-4 w-4" />
                    <span>{item.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        )}
      </Command>
    </form>
  );
}