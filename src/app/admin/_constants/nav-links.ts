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
          { label: "Suits", href: "/collections/suits" },
          { label: "Tuxedos", href: "/collections/tuxedos" },
          { label: "Waistcoats", href: "/collections/waistcoats" },
        ],
      },
      {
        title: "Couture",
        links: [
          { label: "Evening gowns", href: "/collections/evening-gowns" },
          { label: "Cocktail dresses", href: "/collections/cocktail-dresses" },
          { label: "Atelier line", href: "/collections/atelier-line" },
          { label: "Runway pieces", href: "/collections/runway" },
        ],
      },
      {
        title: "Tradition",
        links: [
          { label: "Kurtas", href: "/collections/women-kurtas" },
          { label: "Lehengas", href: "/collections/women-lehengas" },
          { label: "Anarkalis", href: "/collections/women-anarkalis" },
        ],
      },
    ],
    image: "/formal-luxury.jpg",
  },
  {
    label: "Informal",
    href: "/collections/informal",
    type: "mega",
    columns: [
      {
        title: "Denim",
        links: [
          { label: "Wide leg", href: "/collections/women-jeans-wide-leg" },
          { label: "Flare jeans", href: "/collections/women-jeans-flare" },
          { label: "Black wash", href: "/collections/ultimate-black" },
          { label: "Raw denim", href: "/collections/women-jeans-raw" },
        ],
      },
      {
        title: "Leisure",
        links: [
          { label: "Cashmere", href: "/collections/cashmere" },
          { label: "Lounge sets", href: "/collections/lounge" },
          { label: "Silk camis", href: "/collections/women-tops" },
          { label: "Designer tees", href: "/collections/women-tshirts" },
        ],
      },
      {
        title: "Daily",
        links: [
          { label: "Linen edits", href: "/collections/linen-edits" },
          { label: "Blouses", href: "/collections/women-blouses" },
          { label: "Fusion wear", href: "/collections/women-indo-western" },
          { label: "New drops", href: "/collections/new-arrivals" },
        ],
      },
    ],
    image: "/casual-luxury.jpg",
  },
  {
    label: "Collections",
    href: "/collections/curated",
    type: "mega",
    columns: [
      {
        title: "Featured",
        links: [
          { label: "New arrivals", href: "/collections/new-arrivals" },
          { label: "Best sellers", href: "/collections/trending" },
          { label: "Limited edition", href: "/collections/limited" },
          { label: "Private sale", href: "/collections/sale" },
        ],
      },
      {
        title: "Shop by brand",
        links: [
          { label: "Parisian series", href: "/collections/parisian" },
          { label: "Milan edits", href: "/collections/milan" },
          { label: "Heritage prints", href: "/collections/heritage-prints" },
          { label: "Designer collabs", href: "/collections/collabs" },
        ],
      },
    ],
    image: "/branded-collections.jpg",
  },
];
