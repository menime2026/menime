import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { HANGERHIGHLIGHTS } from "@/config/hanger-highlight-constants";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface CuratedForYouProps {
  items?: typeof HANGERHIGHLIGHTS;
}

const CuratedForYou = ({ items = HANGERHIGHLIGHTS }: CuratedForYouProps) => {
  // Default to first 3 items if no specific items provided, or use provided items
  const displayItems = items.length > 0 ? items : HANGERHIGHLIGHTS.slice(0, 3);

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
      <div className="flex flex-col gap-12">
        <div className="text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Handpicked</p>
          <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-slate-900 md:text-4xl">
            Curated For You
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
            {displayItems.map((item) => (
              <CarouselItem key={item.id} className="pl-4 basis-[60%] sm:basis-1/2 md:basis-1/3">
                <Link
                  href={`/collections/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="relative block aspect-3/4 overflow-hidden bg-slate-100"
                >
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-700 hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-black/60 to-transparent p-8">
                    <h3 className="text-xl font-light uppercase tracking-widest text-white">{item.title}</h3>
                    <button className="mt-4 text-xs font-bold uppercase tracking-widest text-white underline decoration-2 underline-offset-4 hover:text-slate-200">
                      Shop Now
                    </button>
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

export default CuratedForYou;
