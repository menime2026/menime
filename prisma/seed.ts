import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLIDES = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80",
    alt: "Model in streetwear leaning on a wall",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80",
    alt: "Woman in patterned outfit sitting on stool",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1600&q=80",
    alt: "Fashion model walking down runway",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80",
    alt: "Person in brown coat standing by city street",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80",
    alt: "Minimalist fashion portrait against blue background",
  },
];

const CATEGORIES = [
  {
    id: 1,
    title: "Women",
    image: "https://images.unsplash.com/photo-1550614000-4b9519e02d48?auto=format&fit=crop&w=800&q=80",
    href: "/collections/women",
  },
  {
    id: 2,
    title: "Men",
    image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
    href: "/collections/men",
  },
  {
    id: 3,
    title: "Denim",
    image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80",
    href: "/collections/denim",
  },
  {
    id: 4,
    title: "Outerwear",
    image: "https://images.unsplash.com/photo-1551028919-30164bdc3300?auto=format&fit=crop&w=800&q=80",
    href: "/collections/outerwear",
  },
];

const HANGERHIGHLIGHTS = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1600&q=80",
    alt: "Model wearing denim jacket and jeans",
    badge: "XL STRAIGHT",
    title: "Denim Remix",
    description:
      "Sun-faded washes meet relaxed tailoring in our latest indigo capsule.",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=1600&q=80",
    alt: "Woman in pastel coat posing against wall",
    badge: "BARREL LEG",
    title: "Soft Statements",
    description:
      "Powder pastels crafted in brushed cotton and plush wool blends.",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
    alt: "Woman wearing floral dress",
    badge: "FLORAL",
    title: "Garden Party",
    description:
      "Lightweight fabrics and blooming prints for sunny afternoon gatherings.",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80",
    alt: "Couple wearing matching outfits",
    badge: "568 LOOSE FIT",
    title: "Match Play",
    description:
      "Coordinated pieces built for layering and long weekend escapes.",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80",
    alt: "Man wearing leather jacket",
    badge: "EDITOR'S PICK",
    title: "Edge Revival",
    description:
      "Heritage leather reimagined with contrast stitching and sheer lining.",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80",
    alt: "Group of friends wearing casual outfits",
    badge: "WEEKEND",
    title: "City Stroll",
    description:
      "Breathable knits and lightweight denim ready for every outing.",
  },
];

const SHOPIMAGE = [
    {
        id: 1,
        images: "https://levi.in/cdn/shop/files/Artboard_1_5f1b5ec5-ca54-4f98-9c34-54eac07a4abd.png?v=1759225915&width=1500",
        alt: "Women's Tailored Bustier Denim Top"
    },
    {
        id: 2,
        images: "https://levi.in/cdn/shop/files/Artboard_6_861f2c48-2e30-43a5-a282-61bc6580d068.png?v=1759226119&width=1500",
        alt: "Women 90's shift dress"
    },
    {
        id: 3,
        images: "https://levi.in/cdn/shop/files/Artboard_2_22981c42-9bec-4432-8563-d6091cc4d2d7.png?v=1759226217&width=1500",
        alt: "Men's 578 Dark Blue Loose Fit Mid Rise jeans"
    },
    {
        id: 4,
        images: "https://levi.in/cdn/shop/files/Artboard_4_6ff82c8f-f90b-483e-a72d-49d3c0e068e7.png?v=1759226273&width=1500",
        alt: "Men's Brand Logo Navy Crew Neck T-shirt"
    },
];

const HANGERHIGHLIGHTSVIDEO = [
  {
    id: 1,
    video:
      "https://levi.in/cdn/shop/videos/c/vp/7a04859566974366b8284ff0461e3517/7a04859566974366b8284ff0461e3517.HD-1080p-7.2Mbps-60092802.mp4?v=0",
    alt: "Model wearing denim jacket and jeans",
    badge: "XL STRAIGHT",
    title: "Denim Remix",
    description:
      "Sun-faded washes meet relaxed tailoring in our latest indigo capsule.",
    products: [
      {
        name: "XL Straight Jeans",
        price: "$98.00",
        image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Trucker Jacket",
        price: "$128.00",
        image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    id: 2,
    video:
      "https://levi.in/cdn/shop/videos/c/vp/5b180c3024694649b597bc471965b116/5b180c3024694649b597bc471965b116.HD-1080p-7.2Mbps-60092789.mp4?v=0",
    alt: "Woman in pastel coat posing against wall",
    badge: "BARREL LEG",
    title: "Soft Statements",
    description:
      "Powder pastels crafted in brushed cotton and plush wool blends.",
    products: [
      {
        name: "Wool Blend Coat",
        price: "$248.00",
        image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Barrel Leg Trousers",
        price: "$118.00",
        image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
  {
    id: 4,
    video:
      "https://levi.in/cdn/shop/videos/c/vp/5b180c3024694649b597bc471965b116/5b180c3024694649b597bc471965b116.HD-1080p-7.2Mbps-60092789.mp4?v=0",
    alt: "Couple wearing matching outfits",
    badge: "568 LOOSE FIT",
    title: "Match Play",
    description:
      "Coordinated pieces built for layering and long weekend escapes.",
    products: [
      {
        name: "Loose Fit Chino",
        price: "$88.00",
        image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80"
      },
      {
        name: "Oversized Shirt",
        price: "$78.00",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
      }
    ]
  },
];

const PROMO_BANNER = {
  title: "The Denim Icon",
  subtitle: "Limited Time Only",
  description: "Discover the collection that started it all. Timeless cuts, premium fabrics, and the perfect fit for every body.",
  image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80",
  link: "/collections/new-arrivals",
  linkText: "Shop Collection",
  secondaryLink: "/about",
  secondaryLinkText: "Read The Story",
};

async function main() {
  console.log("Seeding homepage elements...");

  // Clear existing elements
  await prisma.homePageElement.deleteMany();

  // 1. Hero Section
  await prisma.homePageElement.create({
    data: {
      sectionType: "HERO",
      title: "Hero Carousel",
      order: 0,
      isActive: true,
      content: {
        slides: SLIDES,
      },
    },
  });

  // 2. Shop By Category
  await prisma.homePageElement.create({
    data: {
      sectionType: "CATEGORY",
      title: "Shop By Category",
      order: 1,
      isActive: true,
      content: {
        categories: CATEGORIES,
      },
    },
  });

  // 3. New Arrivals
  await prisma.homePageElement.create({
    data: {
      sectionType: "NEW_ARRIVALS",
      title: "New Arrivals",
      order: 2,
      isActive: true,
      content: {
        items: HANGERHIGHLIGHTS,
      },
    },
  });

  // 4. Promo Banner
  await prisma.homePageElement.create({
    data: {
      sectionType: "PROMO",
      title: "Promo Banner",
      order: 3,
      isActive: true,
      content: PROMO_BANNER,
    },
  });

  // 5. Trending (Hot of the Hanger)
  await prisma.homePageElement.create({
    data: {
      sectionType: "TRENDING",
      title: "Trending Now",
      order: 4,
      isActive: true,
      content: {
        trendingItems: HANGERHIGHLIGHTS,
        editItems: HANGERHIGHLIGHTSVIDEO,
        editorialItems: SHOPIMAGE,
      },
    },
  });

  // 6. Video Banner
  await prisma.homePageElement.create({
    data: {
      sectionType: "VIDEO_BANNER",
      title: "Video Banner",
      order: 5,
      isActive: true,
      content: {
        videos: HANGERHIGHLIGHTSVIDEO,
      },
    },
  });

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
