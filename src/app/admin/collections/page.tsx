import type { Metadata } from "next";
import { getInternalApiUrl } from "@/lib/internal-api";
import CollectionsClient, { type CollectionResponse } from "./_components/collections-client";

export const metadata: Metadata = {
  title: "Admin • Collections",
  description: "Organize products into curated collections and sections.",
};

export const dynamic = "force-dynamic";

async function getCollections(): Promise<CollectionResponse[]> {
  try {
    const res = await fetch(getInternalApiUrl("/api/admin/collections"), {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("[ADMIN_COLLECTIONS_PAGE]", error);
    return [];
  }
}

const CollectionsPage = async () => {
  const collections = await getCollections();

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-8 rounded-[2.5rem] bg-white p-8 lg:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Store Organization</p>
            <h1 className="text-4xl font-light text-slate-900 lg:text-5xl">Collections</h1>
            <p className="max-w-xl text-sm text-slate-500">
              Curate collection groups to guide shoppers through your store.
            </p>
          </div>
        </div>
      </section>
      <CollectionsClient initialCollections={collections} />
    </div>
  );
};

export default CollectionsPage;
