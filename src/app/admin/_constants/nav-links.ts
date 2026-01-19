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
    label: "FORMAL",
    href: "/collections/formal",
    type: "mega",
    columns: [
      {
        title: "TAILORING",
        links: [
          { label: "Beaded Blazer", href: "/products/beaded-blazer" },
          { label: "Flared Trousers", href: "/products/formal-flared-trousers" },
          { label: "Suits", href: "/collections/suits" },
          { label: "Tuxedos", href: "/collections/tuxedos" },
          { label: "Waistcoats", href: "/collections/waistcoats" },
        ],
      },
      {
        title: "COUTURE",
        links: [
          { label: "Evening Gowns", href: "/collections/evening-gowns" },
          { label: "Cocktail", href: "/collections/cocktail-dresses" },
          { label: "Atelier Line", href: "/collections/atelier-line" },
          { label: "Runway", href: "/collections/runway" },
        ],
      },
      {
        title: "TRADITION",
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
    label: "INFORMAL",
    href: "/collections/informal",
    type: "mega",
    columns: [
      {
        title: "DENIM",
        links: [
          { label: "Wide Leg", href: "/collections/women-jeans-wide-leg" },
          { label: "Flare", href: "/collections/women-jeans-flare" },
          { label: "Black Wash", href: "/collections/ultimate-black" },
          { label: "Raw Denim", href: "/collections/women-jeans-raw" },
        ],
      },
      {
        title: "LEISURE",
        links: [
          { label: "Cashmere", href: "/collections/cashmere" },
          { label: "Lounge Sets", href: "/collections/lounge" },
          { label: "Silk Camis", href: "/collections/women-tops" },
          { label: "Designer Tees", href: "/collections/women-tshirts" },
        ],
      },
      {
        title: "DAILY",
        links: [
          { label: "Linen", href: "/collections/linen-edits" },
          { label: "Blouses", href: "/collections/women-blouses" },
          { label: "Fusion Wear", href: "/collections/women-indo-western" },
          { label: "New Drops", href: "/collections/new-arrivals" },
        ],
      },
    ],
    image: "/casual-luxury.jpg",
  },
];
