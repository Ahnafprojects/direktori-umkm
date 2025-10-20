-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Umkm" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(20),
    "openingHours" VARCHAR(100),
    "photos" TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "rating" DECIMAL(2,1) DEFAULT 4.0,
    "hasPromo" BOOLEAN DEFAULT false,
    "isRecommended" BOOLEAN DEFAULT false,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "Umkm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "author" VARCHAR(100) NOT NULL DEFAULT 'Pengunjung',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "umkmId" INTEGER NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "idx_category_slug" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Umkm_slug_key" ON "Umkm"("slug");

-- CreateIndex
CREATE INDEX "idx_umkm_name" ON "Umkm"("name");

-- CreateIndex
CREATE INDEX "idx_umkm_slug" ON "Umkm"("slug");

-- CreateIndex
CREATE INDEX "Review_umkmId_idx" ON "Review"("umkmId");

-- AddForeignKey
ALTER TABLE "Umkm" ADD CONSTRAINT "Umkm_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "Umkm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
