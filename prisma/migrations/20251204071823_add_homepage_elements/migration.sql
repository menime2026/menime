-- AlterTable
ALTER TABLE "collection" RENAME CONSTRAINT "category_pkey" TO "collection_pkey";

-- CreateTable
CREATE TABLE "home_page_element" (
    "id" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "title" TEXT,
    "subtitle" TEXT,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "home_page_element_pkey" PRIMARY KEY ("id")
);

-- RenameIndex
ALTER INDEX "wishlist_item_wishlistId_productId_selectedSize_selectedColor_k" RENAME TO "wishlist_item_wishlistId_productId_selectedSize_selectedCol_key";
