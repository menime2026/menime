"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import type { StorefrontImage } from "@/lib/storefront/catalog";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

const FALLBACK_GRADIENT = "bg-linear-to-br from-slate-200 via-slate-100 to-slate-300";

export type ProductGalleryProps = {
  title: string;
  images: StorefrontImage[];
};

const ProductGallery = ({ title, images }: ProductGalleryProps) => {
  const normalizedImages = useMemo(() => images.filter((image) => Boolean(image?.url)), [images]);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleThumbnailClick = (index: number) => {
    api?.scrollTo(index);
  };

  if (normalizedImages.length === 0) {
     return (
        <div className="relative aspect-3/4 overflow-hidden bg-slate-100">
             <div className={cn("flex h-full w-full items-center justify-center", FALLBACK_GRADIENT)}>
                <span className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Meni-me</span>
             </div>
        </div>
     )
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <Carousel setApi={setApi} className="w-full group">
        <CarouselContent className="ml-0">
          {normalizedImages.map((image, index) => (
            <CarouselItem key={`${image.fileId ?? image.url}-${index}`} className="pl-0">
              <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100">
                <Image
                  src={image.url}
                  alt={`${title} - View ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority={index === 0}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows - Visible on hover for desktop */}
        <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100 hidden lg:block">
            <CarouselPrevious className="left-4 bg-white/80 hover:bg-white border-none shadow-sm" />
            <CarouselNext className="right-4 bg-white/80 hover:bg-white border-none shadow-sm" />
        </div>

        {/* Mobile Dots / Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 lg:hidden">
             {normalizedImages.map((_, index) => (
                <div
                    key={index}
                    className={cn(
                        "h-1.5 rounded-full transition-all duration-300 shadow-sm",
                        current === index ? "w-6 bg-white" : "w-1.5 bg-white/60 backdrop-blur-sm"
                    )}
                />
             ))}
        </div>
      </Carousel>

      {/* Thumbnails - Desktop Only or if multiple images */}
      {normalizedImages.length > 1 && (
        <div className="hidden lg:grid grid-cols-6 gap-4">
          {normalizedImages.map((image, index) => {
            const isActive = index === current;
            return (
              <button
                key={`thumb-${index}`}
                type="button"
                onClick={() => handleThumbnailClick(index)}
                className={cn(
                  "relative aspect-3/4 overflow-hidden transition-all duration-300",
                  isActive ? "opacity-100 ring-1 ring-slate-900 ring-offset-2" : "opacity-60 hover:opacity-100"
                )}
              >
                <Image
                  src={image.url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
