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
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Homepage",
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
    label: "SALE",
    href: "/collections/sale",
    type: "simple",
    isSale: true,
    sublinks: [
      { label: "ALL SALE", href: "/collections/sale" },
      { label: "DRESSES", href: "/collections/sale-dresses" },
      { label: "TOPS", href: "/collections/sale-tops" },
      { label: "JEANS", href: "/collections/sale-jeans" },
    ],
  },
  {
    label: "CLOTHING",
    href: "/collections/women",
    type: "mega",
    columns: [
      {
        title: "TOPS & BLOUSES",
        links: [
          { label: "T-Shirts", href: "/collections/women-tshirts" },
          { label: "Tops", href: "/collections/women-tops" },
          { label: "Blouses", href: "/collections/women-blouses" },
          { label: "Crop Tops", href: "/collections/women-crop-tops" },
          { label: "Shirts", href: "/collections/women-shirts" },
          { label: "Tank Tops", href: "/collections/women-tank-tops" },
          { label: "Corset Tops", href: "/collections/women-corset-tops" },
          { label: "Bodysuits", href: "/collections/women-bodysuits" },
        ],
      },
      {
        title: "DRESSES & SKIRTS",
        links: [
          { label: "Dresses", href: "/collections/women-dresses" },
          { label: "Maxi Dresses", href: "/collections/women-maxi-dresses" },
          { label: "Mini Dresses", href: "/collections/women-mini-dresses" },
          { label: "Midi Dresses", href: "/collections/women-midi-dresses" },
          { label: "Skirts", href: "/collections/women-skirts" },
          { label: "Mini Skirts", href: "/collections/women-mini-skirts" },
          { label: "Maxi Skirts", href: "/collections/women-maxi-skirts" },
        ],
      },
      {
        title: "BOTTOMS",
        links: [
          { label: "Jeans", href: "/collections/women-jeans" },
          { label: "Pants & Trousers", href: "/collections/women-pants-trousers" },
          { label: "Shorts", href: "/collections/women-shorts" },
          { label: "Joggers", href: "/collections/women-joggers" },
          { label: "Leggings", href: "/collections/women-leggings" },
          { label: "Palazzos", href: "/collections/women-palazzos" },
        ],
      },
    ],
    image: "/women-denim-fashion.jpg",
  },
  {
    label: "JEANS",
    href: "/collections/women-jeans",
    type: "mega",
    columns: [
      {
        title: "SHOP BY FIT",
        links: [
          { label: "Baggy", href: "/collections/women-jeans-baggy" },
          { label: "Skinny", href: "/collections/women-jeans-skinny" },
          { label: "Flare", href: "/collections/women-jeans-flare" },
          { label: "Loose", href: "/collections/women-jeans-loose" },
          { label: "Straight", href: "/collections/women-jeans-straight" },
          { label: "Wide Leg", href: "/collections/women-jeans-wide-leg" },
          { label: "Bootcut", href: "/collections/women-jeans-bootcut" },
          { label: "Mom Jeans", href: "/collections/women-jeans-mom" },
        ],
      },
      {
        title: "SHOP BY RISE",
        links: [
          { label: "High Rise", href: "/collections/women-jeans-high-rise" },
          { label: "Mid Rise", href: "/collections/women-jeans-mid-rise" },
          { label: "Low Rise", href: "/collections/women-jeans-low-rise" },
        ],
      },
      {
        title: "SHOP BY STYLE",
        links: [
          { label: "Ripped Jeans", href: "/collections/women-jeans-ripped" },
          { label: "Distressed", href: "/collections/women-jeans-distressed" },
          { label: "Vintage Wash", href: "/collections/women-jeans-vintage" },
          { label: "Dark Wash", href: "/collections/women-jeans-dark" },
          { label: "Light Wash", href: "/collections/women-jeans-light" },
        ],
      },
    ],
    image: "/women-denim-fashion.jpg",
  },
  {
    label: "ETHNIC WEAR",
    href: "/collections/ethnic",
    type: "mega",
    columns: [
      {
        title: "TRADITIONAL",
        links: [
          { label: "Kurtas", href: "/collections/women-kurtas" },
          { label: "Kurtis", href: "/collections/women-kurtis" },
          { label: "Salwar Suits", href: "/collections/women-salwar-suits" },
          { label: "Anarkalis", href: "/collections/women-anarkalis" },
          { label: "Lehengas", href: "/collections/women-lehengas" },
        ],
      },
      {
        title: "FUSION",
        links: [
          { label: "Indo-Western", href: "/collections/women-indo-western" },
          { label: "Fusion Dresses", href: "/collections/women-fusion-dresses" },
          { label: "Palazzo Sets", href: "/collections/women-palazzo-sets" },
        ],
      },
    ],
    image: "/women-denim-fashion.jpg",
  },
  {
    label: "NEW ARRIVALS",
    href: "/collections/new-arrivals",
    type: "simple",
    sublinks: [
      { label: "JUST DROPPED", href: "/collections/new-arrivals" },
      { label: "TRENDING NOW", href: "/collections/trending" },
      { label: "ONLINE EXCLUSIVE", href: "/collections/online-exclusive" },
      { label: "BACK IN STOCK", href: "/collections/back-in-stock" },
    ],
  },
  {
    label: "FEATURED",
    href: "/collections/featured",
    type: "simple",
    sublinks: [
      { label: "WINTER ESSENTIALS", href: "/collections/winter-essentials" },
      { label: "PREMIUM COLLECTION", href: "/collections/premium" },
      { label: "PARTY WEAR", href: "/collections/party-wear" },
      { label: "WORKWEAR", href: "/collections/workwear" },
    ],
  },
];
