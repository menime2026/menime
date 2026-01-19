import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface TrendingNowProps {
  items: {
    id: number;
    title: string;
    image: string;
    alt: string;
    badge: string;
    description: string;
  }[];
}

const TrendingNow = ({ items }: TrendingNowProps) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
      <div className="flex flex-col gap-12">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">This Week&apos;s Favorites</p>
            <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-slate-900 md:text-4xl">
              Trending Now
            </h2>
          </div>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-4 basis-[60%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
              >
                <Link href={`/products/${item.title.toLowerCase().replace(/\s+/g, '-')}`} className="group relative cursor-pointer block">
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                      priority={item.id === 1}
                    />
                    <div className="absolute inset-0 bg-black/0 transition duration-500 group-hover:bg-black/10" />
                  </div>
                  <div className="mt-4 space-y-1">
                    <h3 className="text-sm font-medium uppercase tracking-wide text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500">{item.badge}</p>
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

export default TrendingNow;
