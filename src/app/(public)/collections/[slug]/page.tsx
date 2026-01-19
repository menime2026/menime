import { notFound } from "next/navigation";
import { CollectionPageClient } from "./collection-page-client";
import { getCollectionWithProductsBySlug } from "@/lib/storefront/catalog";

export default async function CollectionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getCollectionWithProductsBySlug(slug);

  if (!data) {
    notFound();
  }

  return (
    <CollectionPageClient
      collection={data.collection}
      childrenCollections={data.children}
      products={data.products}
    />
  );
}
