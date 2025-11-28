import { Metadata } from "next";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Heart,
  Star,
  Target,
  Sparkles,
  ShoppingBag,
  Map,
  Search,
  MessageSquare,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  BookOpen,
  LayoutDashboard,
} from "lucide-react";
import CountUpStats from "./_components/count-up-stats";
import Testimonials from "./_components/testimonials";

export const metadata: Metadata = {
  title: "Tentang Kami - LokalKeren",
  description:
    "Platform direktori UMKM digital yang menghubungkan konsumen dengan usaha lokal terbaik di sekitar Anda",
};

export default function TentangPage() {
  const features = [
    {
      icon: Search,
      title: "Pencarian UMKM",
      description:
        "Temukan UMKM terdekat berdasarkan kategori, rating, dan lokasi Anda",
    },
    {
      icon: Map,
      title: "Peta Interaktif",
      description:
        "Lihat lokasi UMKM di peta dan dapatkan rute tercepat menuju toko",
    },
    {
      icon: ShoppingBag,
      title: "Keranjang & Checkout",
      description: "Pesan produk dari berbagai UMKM dalam satu transaksi mudah",
    },
    {
      icon: Heart,
      title: "Favorit & Wishlist",
      description:
        "Simpan UMKM favorit Anda untuk akses cepat di kemudian hari",
    },
    {
      icon: Star,
      title: "Review & Rating",
      description:
        "Baca dan tulis ulasan untuk membantu UMKM meningkatkan kualitas",
    },
    {
      icon: MessageSquare,
      title: "AI Assistant",
      description:
        "Chatbot cerdas yang membantu Anda menemukan UMKM sesuai kebutuhan",
    },
    {
      icon: MessageCircle,
      title: "Chat dengan UMKM",
      description:
        "Komunikasi langsung dengan pemilik UMKM untuk tanya produk dan layanan",
    },
    {
      icon: BookOpen,
      title: "Blog UMKM",
      description:
        "Artikel, tips, dan panduan bisnis eksklusif untuk pengusaha UMKM berkembang",
    },
    {
      icon: LayoutDashboard,
      title: "Dashboard UMKM",
      description:
        "Panel kontrol lengkap untuk kelola toko, produk, pesanan, dan analitik penjualan",
    },
  ];

  const team = [
    {
      name: "Muhammad Ahnaf",
      role: "Product Owner",
      role2: "Developer",
      photo: "/img/Muhammad Ahnaf.png",
      bio: "Memimpin visi produk dan strategi pengembangan LokalKeren",
      github: "https://github.com/ahnaf",
      linkedin: "https://linkedin.com/in/ahnaf",
      email: "ahnaf@lokalkeren.com",
    },
    {
      name: "Septareno Nugroho Aji",
      role: "Developer",
      photo: "/img/Septareno Nugrho aji.png",
      bio: "Spesialis Frontend Development dengan fokus pada UX/UI yang optimal",
      github: "https://github.com/septareno",
      linkedin: "https://linkedin.com/in/septareno",
      email: "septareno@lokalkeren.com",
    },
    {
      name: "Saydina Rakha Maulana",
      role: "Developer",
      photo: "/img/Saydina Rakha maulana.png",
      bio: "Expert Frontend Developer yang menghadirkan pengalaman pengguna terbaik",
      github: "https://github.com/rakha",
      linkedin: "https://linkedin.com/in/rakha",
      email: "rakha@lokalkeren.com",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b -mt-20 pt-24 sm:pt-28">
        <div className="container mx-auto px-4 py-16 sm:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4" variant="secondary">
              <Building2 className="h-3 w-3 mr-1" />
              Tentang Platform
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Tentang LokalKeren
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Platform direktori UMKM digital yang menghubungkan konsumen dengan
              usaha mikro, kecil, dan menengah (UMKM) terbaik di sekitar Anda.
              Kami hadir untuk mendukung ekonomi lokal dan mempermudah akses ke
              produk berkualitas dari UMKM Indonesia.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-16">
        <CountUpStats />
      </div>

      {/* Visi Misi */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                <Target className="h-8 w-8 text-primary" />
                Visi & Misi
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Visi */}
              <Card className="p-8 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Visi</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Menjadi platform digital terdepan yang memberdayakan UMKM
                  Indonesia untuk berkembang dan bersaing di era digital, serta
                  menjadi jembatan utama antara konsumen dan produk lokal
                  berkualitas.
                </p>
              </Card>

              {/* Misi */}
              <Card className="p-8 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Misi</h3>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>
                      Menyediakan platform yang mudah diakses untuk UMKM
                      memasarkan produk mereka
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>
                      Meningkatkan visibilitas dan jangkauan pasar UMKM lokal
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>
                      Memberikan pengalaman belanja yang seamless bagi konsumen
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>
                      Mendukung pertumbuhan ekonomi lokal melalui teknologi
                      digital
                    </span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <Testimonials />

      {/* Features */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-muted-foreground text-lg">
              Platform lengkap untuk menemukan dan berinteraksi dengan UMKM
              lokal
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tim Pengembang */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                <Users className="h-8 w-8 text-primary" />
                Tim Pengembang
              </h2>
              <p className="text-muted-foreground text-lg">
                Dibangun oleh tim yang passionate untuk memberdayakan UMKM
                Indonesia
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <Card
                  key={index}
                  className="p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Photo */}
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-primary/20">
                    <Image
                      src={member.photo}
                      alt={member.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  </div>

                  {/* Info */}
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Badge variant="secondary">{member.role}</Badge>
                    {member.role2 && (
                      <Badge variant="secondary">{member.role2}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {member.bio}
                  </p>

                  {/* Social Links */}
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={member.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-muted hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Github className="h-4 w-4" />
                    </a>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-muted hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="w-9 h-9 bg-muted hover:bg-primary/10 rounded-full flex items-center justify-center transition-colors"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Bergabunglah dengan Kami
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Dukung UMKM lokal dan nikmati produk berkualitas dari lingkungan
            sekitar Anda. Mari bersama memajukan ekonomi Indonesia!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="/?section=directory"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Jelajahi UMKM
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/10 transition-colors"
            >
              Daftar Sekarang
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
