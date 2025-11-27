import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getBlogPosts, getBlogCategories } from "@/lib/blog-data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Calendar, Tag } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Blog UMKM - Tips & Panduan Bisnis",
  description:
    "Kumpulan artikel, tips, dan panduan untuk mengembangkan bisnis UMKM Anda",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: selectedCategory } = await searchParams;

  // Cek session user
  const session = await getServerSession(authOptions);

  // Redirect jika bukan PENGUSAHA
  if (!session || session.user.role !== "PENGUSAHA") {
    redirect("/");
  }

  const allPosts = getBlogPosts();
  const categories = getBlogCategories();

  // Filter berdasarkan kategori
  const filteredPosts = selectedCategory
    ? allPosts.filter((post) => post.category === selectedCategory)
    : allPosts;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-12 sm:py-16">
          <div className="max-w-3xl">
            <Badge className="mb-4" variant="secondary">
              <BookOpen className="h-3 w-3 mr-1" />
              Khusus Pengusaha UMKM
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
              Blog UMKM
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Kumpulan artikel, tips, dan panduan untuk mengembangkan bisnis
              UMKM Anda. Baca, pelajari, dan terapkan!
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Filter Kategori */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Kategori
          </h2>
          <div className="flex flex-wrap gap-2">
            <Link href="/blog">
              <Badge
                variant={!selectedCategory ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/80"
              >
                Semua Artikel ({allPosts.length})
              </Badge>
            </Link>
            {categories.map((category) => {
              const count = allPosts.filter(
                (post) => post.category === category
              ).length;
              return (
                <Link
                  key={category}
                  href={`/blog?category=${encodeURIComponent(category)}`}
                >
                  <Badge
                    variant={
                      selectedCategory === category ? "default" : "outline"
                    }
                    className="cursor-pointer hover:bg-primary/80"
                  >
                    {category} ({count})
                  </Badge>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Grid Artikel */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
                {/* Thumbnail */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Category Badge */}
                  <Badge variant="secondary" className="mb-3">
                    {post.category}
                  </Badge>

                  {/* Title */}
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(post.publishedDate).toLocaleDateString(
                          "id-ID",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Tidak ada artikel di kategori ini
            </h3>
            <p className="text-muted-foreground mb-4">
              Coba pilih kategori lain atau lihat semua artikel
            </p>
            <Link href="/blog">
              <Badge className="cursor-pointer">Lihat Semua Artikel</Badge>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
