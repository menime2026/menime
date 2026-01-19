import {
  LayoutDashboard,
  PackageSearch,
  Tags,
  Users2,
  ShoppingCart,
  BarChart3,
  LayoutTemplate,
  Home,
} from "lucide-react";

export const ADMIN_NAV_LINKS = [
  {
    label: "Executive Overview",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Storefront Experience",
    href: "/admin/homepage",
    icon: LayoutTemplate,
  },
  {
    label: "Global Inventory",
    href: "/admin/products",
    icon: PackageSearch,
  },
  {
    label: "Curated Collections",
    href: "/admin/collections",
    icon: Tags,
  },
  {
    label: "Clientele",
    href: "/admin/customer",
    icon: Users2,
  },
  {
    label: "Order Fulfillment",
    href: "/admin/order",
    icon: ShoppingCart,
  },
  {
    label: "Analytics & Insights",
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
    label: "HOME",
    href: "/",
    type: "simple",
  },
  {
    label: "THE ARCHIVE",
    href: "/collections/sale",
    type: "simple",
    isSale: true,
    sublinks: [
      { label: "SEASONAL CLEARANCE", href: "/collections/sale" },
      { label: "SIGNATURE DRESSES", href: "/collections/sale-dresses" },
      { label: "PREMIUM TOPS", href: "/collections/sale-tops" },
      { label: "ARCHIVE DENIM", href: "/collections/sale-jeans" },
    ],
  },
  {
    label: "READY-TO-WEAR",
    href: "/collections/women",
    type: "mega",
    columns: [
      {
        title: "FORMAL & SUITING",
        links: [
          { label: "Embroidered Beaded Blazer", href: "/products/beaded-blazer" },
          { label: "Formal Flared Trousers", href: "/products/formal-flared-trousers" },
          { label: "Tailored Waistcoats", href: "/collections/waistcoats" },
          { label: "Structured Tuxedos", href: "/collections/tuxedos" },
          { label: "Executive Silk Blouses", href: "/collections/women-blouses" },
          { label: "Three-Piece Suits", href: "/collections/suits" },
        ],
      },
      {
        title: "DRESSES & GOWNS",
        links: [
          { label: "Evening Couture", href: "/collections/evening-gowns" },
          { label: "Cocktail Classics", href: "/collections/cocktail-dresses" },
          { label: "Silk Maxi Dresses", href: "/collections/women-maxi-dresses" },
          { label: "Satin Mini Dresses", href: "/collections/women-mini-dresses" },
          { label: "Midi Sculpture Dresses", href: "/collections/women-midi-dresses" },
          { label: "Tiered Occasion Gowns", href: "/collections/tiered-dresses" },
        ],
      },
      {
        title: "INFORMAL LUXURY",
        links: [
          { label: "Cashmere Knitwear", href: "/collections/cashmere" },
          { label: "Premium Lounge Sets", href: "/collections/lounge" },
          { label: "Designer T-Shirts", href: "/collections/women-tshirts" },
          { label: "Silk Camisoles", href: "/collections/women-tops" },
          { label: "Linen Separates", href: "/collections/linen-edits" },
          { label: "Relaxed Fit Shirts", href: "/collections/women-shirts" },
        ],
      },
    ],
    image: "/premium-rtw-collection.jpg",
  },
  {
    label: "THE DENIM ATELIER",
    href: "/collections/women-jeans",
    type: "mega",
    columns: [
      {
        title: "ARCHITECTURAL FITS",
        links: [
          { label: "Sculpted Wide Leg", href: "/collections/women-jeans-wide-leg" },
          { label: "Classic Flare", href: "/collections/women-jeans-flare" },
          { label: "Tailored Straight", href: "/collections/women-jeans-straight" },
          { label: "Precision Slim", href: "/collections/women-jeans-skinny" },
          { label: "Modern Loose Fit", href: "/collections/women-jeans-loose" },
        ],
      },
      {
        title: "CURATED WASHES",
        links: [
          { label: "Ultimate Black", href: "/collections/ultimate-black" },
          { label: "Midnight Indigo", href: "/collections/women-jeans-dark" },
          { label: "Vintage Arctic", href: "/collections/women-jeans-light" },
          { label: "Raw Selvedge", href: "/collections/women-jeans-raw" },
        ],
      },
      {
        title: "DENIM BY RISE",
        links: [
          { label: "High-Rise Sculpt", href: "/collections/women-jeans-high-rise" },
          { label: "Mid-Rise Classic", href: "/collections/women-jeans-mid-rise" },
        ],
      },
    ],
    image: "/luxury-denim-atelier.jpg",
  },
  {
    label: "HERITAGE COUTURE",
    href: "/collections/ethnic",
    type: "mega",
    columns: [
      {
        title: "TRADITIONAL PIECES",
        links: [
          { label: "Hand-Embroidered Kurtas", href: "/collections/women-kurtas" },
          { label: "Couture Anarkalis", href: "/collections/women-anarkalis" },
          { label: "Silk Salwar Suits", href: "/collections/women-salwar-suits" },
          { label: "Heritage Lehengas", href: "/collections/women-lehengas" },
        ],
      },
      {
        title: "MODERN FUSION",
        links: [
          { label: "Indo-Western Gowns", href: "/collections/women-indo-western" },
          { label: "Fusion Evening-wear", href: "/collections/women-fusion-dresses" },
          { label: "Palazzo Co-ords", href: "/collections/women-palazzo-sets" },
        ],
      },
    ],
    image: "/heritage-couture.jpg",
  },
  {
    label: "BRANDED COLLECTIONS",
    href: "/collections/branded",
    type: "mega",
    columns: [
      {
        title: "DESIGNER EDITS",
        links: [
          { label: "THE ATELIER LINE", href: "/collections/atelier-line" },
          { label: "PARISIAN SERIES", href: "/collections/parisian" },
          { label: "MILAN EDITS", href: "/collections/milan" },
          { label: "HERITAGE PRINTS", href: "/collections/heritage-prints" },
        ],
      },
      {
        title: "LIMITED RELEASES",
        links: [
          { label: "RUNWAY EXCLUSIVES", href: "/collections/runway" },
          { label: "COLLECTOR PIECES", href: "/collections/collectors" },
          { label: "DESIGNER COLLABS", href: "/collections/collabs" },
        ],
      },
    ],
    image: "/branded-collections.jpg",
  },
  {
    label: "NEW ARRIVALS",
    href: "/collections/new-arrivals",
    type: "simple",
    sublinks: [
      { label: "JUST DROPPED", href: "/collections/new-arrivals" },
      { label: "TRENDING EDITS", href: "/collections/trending" },
      { label: "BOUTIQUE EXCLUSIVE", href: "/collections/online-exclusive" },
      { label: "RESTOCKED ICONS", href: "/collections/back-in-stock" },
    ],
  },
];
