import Link from "next/link";
import { getFeaturedProducts, getStorefrontCollections, type StorefrontProduct } from "@/lib/storefront/catalog";
import StorefrontProductCard from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

type ProductsPageProps = {
	searchParams: Promise<{
		search?: string;
		sort?: string;
		onSale?: string;
		gender?: string;
	}>;
};

const ProductsPage = async ({ searchParams }: ProductsPageProps) => {
	const params = await searchParams;
	const search = params.search ?? "";
	const sort = params.sort ?? "";
	const onSale = params.onSale === "true";
	const gender = params.gender ?? "";

	const [products, collections] = await Promise.all([
		getFeaturedProducts({ limit: 24 }),
		getStorefrontCollections(),
	]);

	// Filter products based on search and parameters
	let filteredProducts = products;

	if (search.trim().length > 0) {
		const searchLower = search.toLowerCase();
		filteredProducts = filteredProducts.filter(
			(p: StorefrontProduct) =>
				p.name.toLowerCase().includes(searchLower) ||
				p.description?.toLowerCase().includes(searchLower) ||
				p.collections.some((c: { name: string }) => c.name.toLowerCase().includes(searchLower))
		);
	}

	if (onSale) {
		filteredProducts = filteredProducts.filter((p: StorefrontProduct) => p.compareAtPrice && p.compareAtPrice > p.price);
	}

	if (sort === "newest") {
		filteredProducts = [...filteredProducts].sort((a: StorefrontProduct, b: StorefrontProduct) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
	}

	if (gender.trim().length > 0) {
		const genderLower = gender.toLowerCase();
		filteredProducts = filteredProducts.filter((p: StorefrontProduct) =>
			p.collections.some((c: { name: string }) => c.name.toLowerCase().includes(genderLower))
		);
	}

	const hasProducts = filteredProducts.length > 0;
	const featuredCollections = collections.filter((collection: any) => !collection.parent).slice(0, 6);

	return (
		<div className="flex min-h-screen flex-col bg-white">
			<section className="bg-slate-50 py-20">
				<div className="mx-auto max-w-7xl px-6">
					<div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
						<div className="max-w-2xl space-y-6">
							<p className="text-xs font-bold uppercase tracking-widest text-slate-500">The Collection</p>
							<h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
								Curated Essentials
							</h1>
							<p className="text-lg text-slate-600">
								Discover our latest arrivals, featuring premium materials and timeless silhouettes designed for the modern wardrobe.
							</p>
						</div>
						<div className="flex gap-3">
							<Button asChild variant="outline" className="border-slate-200 bg-white text-slate-900 hover:bg-slate-50">
								<Link href="/collections">Collections</Link>
							</Button>
						</div>
					</div>

					{featuredCollections.length > 0 && (
						<div className="mt-10 flex flex-wrap gap-3">
						{featuredCollections.map((collection: { id: string; slug: string; name: string }) => (
								<Link
									key={collection.id}
									href={`/collections/${collection.slug}`}
									className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-900 hover:text-slate-900"
								>
									{collection.name}
								</Link>
							))}
						</div>
					)}
				</div>
			</section>

			<section id="catalog" className="mx-auto w-full max-w-7xl flex-1 px-6 py-16">
				{/* Active filters display */}
				{(search || sort || onSale || gender) && (
					<div className="mb-10">
						<div className="flex flex-wrap items-center gap-3">
							<span className="text-sm font-medium text-slate-500">Active Filters:</span>
							{search && (
								<div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-900">
									<span>&ldquo;{search}&rdquo;</span>
									<Link href="/products" className="ml-1 text-slate-400 hover:text-slate-900">×</Link>
								</div>
							)}
							{sort === "newest" && (
								<div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-900">
									<span>Newest</span>
									<Link href="/products" className="ml-1 text-slate-400 hover:text-slate-900">×</Link>
								</div>
							)}
							{onSale && (
								<div className="flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
									<span>On Sale</span>
									<Link href="/products" className="ml-1 text-rose-400 hover:text-rose-900">×</Link>
								</div>
							)}
							{gender && (
								<div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-900">
									<span className="capitalize">{gender}&rsquo;s</span>
									<Link href="/products" className="ml-1 text-slate-400 hover:text-slate-900">×</Link>
								</div>
							)}
							<Link href="/products" className="text-sm text-slate-500 hover:text-slate-900 hover:underline">
								Clear all
							</Link>
						</div>
					</div>
				)}

				{hasProducts ? (
					<div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
						{filteredProducts.map((product: StorefrontProduct) => (
							<StorefrontProductCard key={product.id} product={product} />
						))}
					</div>
				) : (
					<div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-center">
						<h2 className="text-xl font-semibold text-slate-900">
							{search ? "No matches found" : "Collection coming soon"}
						</h2>
						<p className="mt-2 max-w-md text-slate-500">
							{search
								? `We couldn't find any products matching "${search}". Try adjusting your search or filters.`
								: "We're currently curating this collection. Check back shortly for new arrivals."}
						</p>
						{(search || sort || onSale || gender) && (
							<Button asChild variant="link" className="mt-4 text-slate-900">
								<Link href="/products">Clear all filters</Link>
							</Button>
						)}
					</div>
				)}
			</section>
		</div>
	);
};

export default ProductsPage;
