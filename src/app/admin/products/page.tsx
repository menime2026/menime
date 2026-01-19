import { getInternalApiUrl } from "@/lib/internal-api";
import type { Metadata } from "next";
import ProductsClient, {
    type CollectionResponse,
    type ProductResponse,
} from "./_components/products-client";

export const metadata: Metadata = {
  title: "Admin • Products",
  description: "Manage catalog items, pricing, and inventory.",
};

export const dynamic = "force-dynamic";

async function getProducts(): Promise<ProductResponse[]> {
  try {
    const res = await fetch(getInternalApiUrl("/api/admin/products"), {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("[ADMIN_PRODUCTS_PAGE]", error);
    return [];
  }
}

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

const ProductsPage = async () => {
  const [products, collections] = await Promise.all([getProducts(), getCollections()]);

  return (
    <div className="space-y-12">
      <section className="flex flex-col gap-8 rounded-[2.5rem] bg-white p-8 lg:p-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Catalog Management</p>
            <h1 className="text-4xl font-light text-slate-900 lg:text-5xl">Products</h1>
            <p className="max-w-xl text-sm text-slate-500">
              Manage your product catalog, pricing, and availability.
            </p>
          </div>
        </div>
      </section>
      <ProductsClient initialProducts={products} initialCollections={collections} />
    </div>
  );
};

export default ProductsPage;
