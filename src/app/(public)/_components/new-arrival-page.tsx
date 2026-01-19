import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { HANGERHIGHLIGHTS } from "@/config/hanger-highlight-constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface NewArrivalsProps {
  items?: typeof HANGERHIGHLIGHTS;
}

const NewArrivals = ({ items = HANGERHIGHLIGHTS }: NewArrivalsProps) => {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
      <div className="flex flex-col gap-32">
        {/* Just Landed */}
        <div className="flex flex-col gap-12">
          <div className="flex items-end justify-between">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Fresh Drops</p>
              <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-slate-900 md:text-4xl">
                Just Landed
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
                <Link href={`/products/${item.title.toLowerCase().replace(/\s+/g, '-')}`} className="group cursor-pointer space-y-4 block">
                  <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100">
                    <Image
                      src={item.image}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                      priority={item.id === 1}
                    />
                    {item.badge && (
                      <div className="absolute left-4 top-4 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-900">
                        {item.badge}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-sm font-medium uppercase tracking-wide text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-500">New Season</p>
                    </div>
                    <p className="text-sm font-medium text-slate-900">$129.00</p>
                  </div>
                </Link>
              </CarouselItem>
            ))}
            </CarouselContent>
          </Carousel>
        </div>
      </div>
    </section>
  );
};export default NewArrivals;
