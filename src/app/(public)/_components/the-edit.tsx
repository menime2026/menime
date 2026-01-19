"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const videoCache = new Map<string, string>();

interface TheEditProps {
  items: {
    id: number;
    title: string;
    video: string;
    alt: string;
    badge: string;
    description: string;
    products: {
      name: string;
      price: string;
      image: string;
    }[];
  }[];
}

const TheEdit = ({ items }: TheEditProps) => {
  const [cachedVideos, setCachedVideos] = useState<Record<string, string>>(
    () => Object.fromEntries(videoCache.entries()),
  );
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    if (!items) return;

    const uncachedVideos = items.filter((item) => !videoCache.has(item.video));

    if (uncachedVideos.length === 0) {
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const preloadVideos = async () => {
      await Promise.all(
        uncachedVideos.map(async ({ video }) => {
          if (videoCache.has(video)) {
            return;
          }

          try {
            const response = await fetch(video, {
              signal: controller.signal,
              mode: "cors",
            });

            if (!response.ok) {
              console.warn(`Failed to preload video: ${video}`);
              return;
            }

            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            videoCache.set(video, objectURL);
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
              return;
            }

            console.warn("Video preload error", error);
          }
        }),
      );

      if (isMounted) {
        setCachedVideos(Object.fromEntries(videoCache.entries()));
      }
    };

    void preloadVideos();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [items]);

  useEffect(() => {
    if (!items) return;

    items.forEach(({ video }) => {
      const element = videoRefs.current[video];

      if (!element) {
        return;
      }

      const resolvedSrc = cachedVideos[video] ?? video;

      if (element.src !== resolvedSrc) {
        element.src = resolvedSrc;
      }
    });
  }, [items, cachedVideos]);

  if (!items || items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
      <div className="flex flex-col gap-12">
        <div className="text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">Behind the Scenes</p>
          <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-slate-900 md:text-4xl">
            The Edit
          </h2>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="pl-4 basis-[60%] sm:basis-1/2 md:basis-1/3 lg:basis-1/3"
              >
                <div className="flex flex-col gap-4">
                  <Link href={`/collections/${item.title.toLowerCase().replace(/\s+/g, '-')}`} className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 block">
                    <video
                      ref={(node) => {
                        if (node) {
                          videoRefs.current[item.video] = node;
                        }
                      }}
                      src={cachedVideos[item.video] ?? item.video}
                      aria-label={item.alt}
                      className="h-full w-full object-cover"
                      muted
                      autoPlay
                      loop
                      playsInline
                      preload="auto"
                      disablePictureInPicture
                      controlsList="nodownload noremoteplayback"
                    />
                  </Link>

                  {/* Products */}
                  <div className="grid grid-cols-2 gap-3 px-4">
                    {item.products?.map((product, index) => (
                      <Link
                        key={index}
                        href={`/products/${product.name.toLowerCase().replace(/\s+/g, '-')}`}
                        className="group/product flex flex-col gap-2"
                      >
                        <div className="relative aspect-3/4 w-full overflow-hidden bg-slate-100">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover transition duration-500 group-hover/product:scale-105"
                          />
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-900 group-hover/product:underline truncate">
                            {product.name}
                          </h4>
                          <p className="text-[10px] text-slate-500">{product.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default TheEdit;
