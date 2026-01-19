import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getUserCommerceCounts } from "@/server/storefront-service";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getCurrentUser();
  const userId = typeof currentUser?.id === "string" ? currentUser.id : null;

  let initialCartCount: number | undefined;
  let initialWishlistCount: number | undefined;

  if (userId) {
    const counts = await getUserCommerceCounts(userId);
    initialCartCount = counts.cartCount;
    initialWishlistCount = counts.wishlistCount;
  }

  return (
    <>
      <Navbar
        initialCartCount={initialCartCount}
        initialWishlistSize={initialWishlistCount}
      />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
