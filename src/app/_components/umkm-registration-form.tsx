"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category } from "@prisma/client";
import { PlusCircle, Trash2, Search, Loader2, LocateFixed } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import LocationPicker from "./location-picker";
import CloudinaryUpload from "@/components/cloudinary-upload";
import { toast } from "react-hot-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { createUmkm, updateUmkm } from "@/lib/actions";

type ProductInput = {
  name: string;
  description: string;
  price: string;
  photo?: string; // Tambahkan field photo
};
type Position = { lat: number; lng: number };

type UmkmInitialData = {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string | null;
  openingHours: string | null;
  categoryId: string | number;
  latitude: number | null;
  longitude: number | null;
  photos: string[];
  products: {
    name: string;
    description: string | null;
    price: number | string;
    photo?: string | null; // Tambahkan field photo di initial data
  }[];
};

interface UmkmRegistrationFormProps {
  categories: Category[];
  initialData?: UmkmInitialData | null;
}

const formatRupiah = (value: string) => {
  const numericValue = value.replace(/[^0-9]/g, "");
  if (numericValue === "") return "";
  return new Intl.NumberFormat("id-ID").format(Number(numericValue));
};

const unformatRupiah = (value: string) => {
  return value.replace(/\./g, "");
};

export default function UmkmRegistrationForm({
  categories,
  initialData,
}: UmkmRegistrationFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;

  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [address, setAddress] = useState(initialData?.address || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [openingHours, setOpeningHours] = useState(
    initialData?.openingHours || ""
  );
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId ? String(initialData.categoryId) : ""
  );
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [products, setProducts] = useState<ProductInput[]>(
    initialData?.products && initialData.products.length > 0
      ? initialData.products.map((p) => ({
          name: p.name,
          description: p.description || "",
          price: formatRupiah(String(p.price)),
          photo: p.photo || "", // Tambahkan photo dari initial data
        }))
      : [{ name: "", description: "", price: "", photo: "" }]
  );
  const [location, setLocation] = useState<Position | null>(
    initialData?.latitude && initialData?.longitude
      ? { lat: initialData.latitude, lng: initialData.longitude }
      : null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const debouncedAddress = useDebounce(address, 1500);

  const handleProductChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const values = [...products];
    if (name === "price") {
      values[index][name as keyof ProductInput] = formatRupiah(value);
    } else {
      values[index][name as keyof ProductInput] = value;
    }
    setProducts(values);
  };

  const handleAddProduct = () => {
    setProducts([
      ...products,
      { name: "", description: "", price: "", photo: "" },
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    const values = [...products];
    values.splice(index, 1);
    setProducts(values);
  };

  const handlePhotoUpload = (url: string) => {
    setPhotos((prevPhotos) => [...prevPhotos, url]);
  };

  const handleRemovePhoto = (urlToRemove: string) => {
    setPhotos(photos.filter((url) => url !== urlToRemove));
  };

  // Handler untuk upload foto produk
  const handleProductPhotoUpload = (index: number, url: string) => {
    const values = [...products];
    values[index].photo = url;
    setProducts(values);
  };

  const handleRemoveProductPhoto = (index: number) => {
    const values = [...products];
    values[index].photo = "";
    setProducts(values);
  };

  // ... (sisa fungsi lainnya tidak berubah)

  const handleGeocode = async (addr: string) => {
    if (!addr || addr.length < 5) return;
    setIsGeocoding(true);
    const toastId = toast.loading("Mencari alamat...");
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          addr
        )}&countrycodes=id`
      );
      const data = await response.json();
      toast.dismiss(toastId);
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setLocation({ lat: parseFloat(lat), lng: parseFloat(lon) });
        toast.success("Lokasi ditemukan!");
      } else {
        toast.error("Alamat tidak ditemukan di peta.");
      }
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("Gagal menghubungi server peta.");
    } finally {
      setIsGeocoding(false);
    }
  };

  useEffect(() => {
    if (debouncedAddress && debouncedAddress !== initialData?.address) {
      handleGeocode(debouncedAddress);
    }
  }, [debouncedAddress, initialData?.address]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung oleh browser Anda.");
      return;
    }
    setIsLocating(true);
    const toastId = toast.loading("Mendapatkan lokasi Anda...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss(toastId);
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude });
        toast.success("Lokasi saat ini ditemukan!");
        setIsLocating(false);

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        )
          .then((res) => res.json())
          .then((data) => {
            if (data && data.display_name) {
              setAddress(data.display_name);
            }
          })
          .catch(() => {});
      },
      (error) => {
        toast.dismiss(toastId);
        toast.error(`Gagal mendapatkan lokasi: ${error.message}`);
        setIsLocating(false);
      }
    );
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const productsToSubmit = products
      .filter((p) => p.name && p.price)
      .map((p) => ({
        ...p,
        price: unformatRupiah(p.price),
      }));

    const finalData = {
      name,
      description,
      address,
      phone,
      openingHours,
      categoryId,
      latitude: location?.lat,
      longitude: location?.lng,
      products: productsToSubmit,
      photos: photos,
    };

    const successMessage = isEditMode
      ? "UMKM berhasil diperbarui!"
      : "UMKM berhasil didaftarkan!";
    const loadingMessage = isEditMode
      ? "Menyimpan perubahan..."
      : "Mendaftarkan...";
    const toastId = toast.loading(loadingMessage);

    try {
      let responseData;
      if (isEditMode && initialData) {
        responseData = await updateUmkm(
          parseInt(initialData.id, 10),
          finalData
        );
      } else {
        responseData = await createUmkm(finalData);
      }

      toast.dismiss(toastId);

      if (!responseData.success) {
        throw new Error(responseData.message || "Terjadi kesalahan di server.");
      }

      toast.success(successMessage);

      setTimeout(() => {
        router.push("/dashboard/umkm/saya");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message || "Oops! Terjadi kesalahan tak terduga.");
    } finally {
      setIsLoading(false);
    }
  }

  // JSX di bawah ini tidak perlu diubah sama sekali
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Informasi Dasar</h3>
        <div className="space-y-2">
          <Label htmlFor="name">Nama UMKM</Label>
          <Input
            id="name"
            name="name"
            placeholder="Bakso Caknan"
            required
            disabled={isLoading}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi Singkat</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="deskripsi singkat..."
            required
            disabled={isLoading}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Foto UMKM (Maks. 5 foto)</Label>
          {photos.length < 5 && (
            <CloudinaryUpload onUpload={handlePhotoUpload} className="mb-4" />
          )}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {photos.map((url, index) => (
                <CloudinaryUpload
                  key={url}
                  currentImage={url}
                  onUpload={(newUrl) => {
                    const newPhotos = [...photos];
                    newPhotos[index] = newUrl;
                    setPhotos(newPhotos);
                  }}
                  onRemove={() => handleRemovePhoto(url)}
                  className="aspect-square"
                />
              ))}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Foto pertama akan menjadi foto utama. Klik pada foto untuk
            menggantinya.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Alamat Lengkap</Label>
          <div className="flex gap-2">
            <Input
              id="address"
              name="address"
              placeholder="Ketik alamat atau gunakan lokasi saat ini"
              required
              disabled={isLoading}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <Button
              type="button"
              onClick={() => handleGeocode(address)}
              disabled={isGeocoding || isLoading || isLocating}
              aria-label="Cari Alamat"
            >
              {isGeocoding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="pt-1">
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm text-muted-foreground hover:text-primary"
              onClick={handleGetCurrentLocation}
              disabled={isLocating || isGeocoding || isLoading}
            >
              <LocateFixed className="mr-2 h-4 w-4" />
              {isLocating ? "Mencari..." : "Gunakan Lokasi Saya Saat Ini"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon (Opsional)</Label>
            <Input
              id="phone"
              name="phone"
              placeholder="085707040566"
              type="tel"
              disabled={isLoading}
              value={phone || ""}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openingHours">Jam Buka (Opsional)</Label>
            <Input
              id="openingHours"
              placeholder="08.00 - 12.00"
              name="openingHours"
              disabled={isLoading}
              value={openingHours || ""}
              onChange={(e) => setOpeningHours(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Kategori Bisnis</Label>
          <Select
            name="categoryId"
            required
            disabled={isLoading}
            value={categoryId}
            onValueChange={setCategoryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori bisnis" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Pilih Lokasi di Peta</h3>
        <p className="text-sm text-muted-foreground">
          Ketik alamat di atas dan klik &lsquo;Cari&rsquo;, atau klik langsung
          pada peta untuk menyempurnakan lokasi.
        </p>
        <LocationPicker position={location} onLocationChange={setLocation} />
        {location && (
          <div className="text-sm text-muted-foreground mt-2">
            Koordinat Terpilih: Lat: {location.lat.toFixed(6)}, Lng:{" "}
            {location.lng.toFixed(6)}
          </div>
        )}
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Menu / Daftar Produk</h3>
        {products.map((product, index) => (
          <div key={index} className="p-4 border rounded-md space-y-4 relative">
            <Label className="font-semibold">Produk #{index + 1}</Label>

            {/* Foto Produk */}
            <div className="space-y-2">
              <Label>Foto Produk (Opsional)</Label>
              <CloudinaryUpload
                currentImage={product.photo}
                onUpload={(url) => handleProductPhotoUpload(index, url)}
                onRemove={() => handleRemoveProductPhoto(index)}
                className="max-w-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`product-name-${index}`}>Nama Produk</Label>
                <Input
                  id={`product-name-${index}`}
                  name="name"
                  value={product.name}
                  onChange={(e) => handleProductChange(index, e)}
                  placeholder="Bakso Jumbo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`product-price-${index}`}>Harga</Label>
                <Input
                  id={`product-price-${index}`}
                  name="price"
                  type="text"
                  inputMode="numeric"
                  value={product.price}
                  onChange={(e) => handleProductChange(index, e)}
                  placeholder="25.000"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`product-description-${index}`}>
                Deskripsi Produk (Opsional)
              </Label>
              <Textarea
                id={`product-description-${index}`}
                name="description"
                value={product.description}
                onChange={(e) => handleProductChange(index, e)}
                placeholder="Bakso super besar..."
              />
            </div>
            {products.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => handleRemoveProduct(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button type="button" variant="outline" onClick={handleAddProduct}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Produk Lain
        </Button>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || isGeocoding || isLocating}
      >
        {isLoading
          ? isEditMode
            ? "Menyimpan..."
            : "Mendaftarkan..."
          : isEditMode
          ? "Simpan Perubahan"
          : "Daftarkan UMKM Saya"}
      </Button>
    </form>
  );
}
