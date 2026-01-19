import {
  LayoutDashboard,
  PackageSearch,
  Tags,
  Users2,
  ShoppingCart,
  BarChart3,
  LayoutTemplate,
} from "lucide-react";

export const ADMIN_NAV_LINKS = [
  {
    label: "Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Storefront",
    href: "/admin/homepage",
    icon: LayoutTemplate,
  },
  {
    label: "Products",
    href: "/admin/products",
    icon: PackageSearch,
  },
  {
    label: "Collections",
    href: "/admin/collections",
    icon: Tags,
  },
  {
    label: "Customers",
    href: "/admin/customer",
    icon: Users2,
  },
  {
    label: "Orders",
    href: "/admin/order",
    icon: ShoppingCart,
  },
  {
    label: "Reports",
    href: "/admin/report",
    icon: BarChart3,
  },
] as const;

export type MenuSublink = {
  label: string;
  href: string;
};

export type MegaMenuColumn = {
  title: string;
  links: MenuSublink[];
};

export type MenuItem =
  | {
      label: string;
      href: string;
      type: "simple";
      sublinks?: MenuSublink[];
      isSale?: boolean;
    }
  | {
      label: string;
      href: string;
      type: "mega";
      columns: MegaMenuColumn[];
      image?: string;
      isSale?: boolean;
    };

export const MENUITEMS: MenuItem[] = [
  {
    label: "Formal",
    href: "/collections/formal",
    type: "mega",
    columns: [
      {
        title: "Tailoring",
        links: [
          { label: "Beaded blazer", href: "/products/beaded-blazer" },
          { label: "Flared trousers", href: "/products/formal-flared-trousers" },
          { label: "Executive suits", href: "/collections/suits" },
          { label: "Tuxedo jackets", href: "/collections/tuxedos" },
          { label: "Velvet blazers", href: "/collections/velvet" },
          { label: "Structured waistcoats", href: "/collections/waistcoats" },
          { label: "Double-breasted coats", href: "/collections/coats" },
        ],
      },
      {
        title: "Couture",
        links: [
          { label: "Evening gowns", href: "/collections/evening-gowns" },
          { label: "Cocktail dresses", href: "/collections/cocktail-dresses" },
          { label: "Silk slip dresses", href: "/collections/silk-dresses" },
          { label: "Tiered maxi dresses", href: "/collections/maxi-dresses" },
          { label: "Atelier line", href: "/collections/atelier-line" },
          { label: "Runway pieces", href: "/collections/runway" },
          { label: "Bridal edit", href: "/collections/bridal" },
        ],
      },
      {
        title: "Heritage",
        links: [
          { label: "Hand-worked kurtas", href: "/collections/women-kurtas" },
          { label: "Designer lehengas", href: "/collections/women-lehengas" },
          { label: "Embellished anarkalis", href: "/collections/women-anarkalis" },
          { label: "Banarasi silk sets", href: "/collections/banarasi" },
          { label: "Fusion occasion wear", href: "/collections/fusion" },
          { label: "Chiffon saris", href: "/collections/saris" },
        ],
      },
    ],
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Informal",
    href: "/collections/informal",
    type: "mega",
    columns: [
      {
        title: "Denim atelier",
        links: [
          { label: "Wide leg denim", href: "/collections/women-jeans-wide-leg" },
          { label: "Flare jeans", href: "/collections/women-jeans-flare" },
          { label: "Ultimate black wash", href: "/collections/ultimate-black" },
          { label: "Raw selvedge", href: "/collections/women-jeans-raw" },
          { label: "Straight cut", href: "/collections/straight-denim" },
          { label: "Denim jackets", href: "/collections/denim-jackets" },
          { label: "Mom fit classics", href: "/collections/mom-jeans" },
        ],
      },
      {
        title: "Leisure",
        links: [
          { label: "Cashmere knits", href: "/collections/cashmere" },
          { label: "Lounge sets", href: "/collections/lounge" },
          { label: "Silk camisoles", href: "/collections/women-tops" },
          { label: "Designer tees", href: "/collections/women-tshirts" },
          { label: "Premium hoodies", href: "/collections/leisurewear" },
          { label: "Knit co-ords", href: "/collections/knits" },
        ],
      },
      {
        title: "Daily",
        links: [
          { label: "Linen separates", href: "/collections/linen-edits" },
          { label: "Cotton poplin shirts", href: "/collections/shirts" },
          { label: "Resort wear", href: "/collections/resort" },
          { label: "Summer sun dresses", href: "/collections/summer-dresses" },
          { label: "Winter outerwear", href: "/collections/outerwear" },
          { label: "Utility trousers", href: "/collections/utility" },
        ],
      },
    ],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
  },
  {
    label: "Collections",
    href: "/collections/curated",
    type: "mega",
    columns: [
      {
        title: "The boutique",
        links: [
          { label: "New arrivals", href: "/collections/new-arrivals" },
          { label: "Best sellers", href: "/collections/trending" },
          { label: "Limited edition", href: "/collections/limited" },
          { label: "Back in stock", href: "/collections/restock" },
          { label: "Private sale", href: "/collections/sale" },
        ],
      },
      {
        title: "Global edits",
        links: [
          { label: "Parisian series", href: "/collections/parisian" },
          { label: "Milan essentials", href: "/collections/milan" },
          { label: "London collection", href: "/collections/london" },
          { label: "Heritage prints", href: "/collections/heritage-prints" },
          { label: "Monogram line", href: "/collections/monogram" },
        ],
      },
    ],
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop",
  },
];
