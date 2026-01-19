import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const defaultCategories = [
  {
    id: 1,
    title: "Dresses",
    image: "https://images.unsplash.com/photo-1550614000-4b9519e02d48?auto=format&fit=crop&w=800&q=80",
    href: "/collections/women-dresses",
  },
  {
    id: 2,
    title: "Jeans",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    href: "/collections/women-jeans",
  },
  {
    id: 3,
    title: "Tops",
    image: "https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80",
    href: "/collections/women-tops",
  },
  {
    id: 4,
    title: "Ethnic Wear",
    image: "https://images.unsplash.com/photo-1551028919-30164bdc3300?auto=format&fit=crop&w=800&q=80",
    href: "/collections/ethnic",
  },
];

interface ShopByCategoryProps {
  categories?: {
    id: number;
    title: string;
    image: string;
    href: string;
  }[];
}

const ShopByCategory = ({ categories = defaultCategories }: ShopByCategoryProps) => {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
      <div className="flex flex-col gap-12">
        <div className="text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
            Explore
          </p>
          <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-slate-900 md:text-4xl">
            Shop By Category
          </h2>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {categories.map((category) => (
              <CarouselItem key={category.id} className="pl-4 basis-[60%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link
                  href={category.href}
                  className="group relative block aspect-3/4 overflow-hidden bg-slate-100"
                >
                  <Image
                    src={category.image}
                    alt={category.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/10 transition duration-500 group-hover:bg-black/20" />
                  <div className="absolute bottom-8 left-0 w-full text-center">
                    <span className="inline-block bg-white px-8 py-3 text-sm font-bold uppercase tracking-widest text-slate-900 transition duration-300 hover:bg-slate-900 hover:text-white">
                      {category.title}
                    </span>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default ShopByCategory;
