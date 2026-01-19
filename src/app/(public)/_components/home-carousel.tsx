"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { SLIDES } from "@/config/slides-constants";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

interface HomeCarouselProps {
  slides?: {
    id: number;
    src: string;
    alt: string;
  }[];
}

const HomeCarousel = ({ slides = SLIDES }: HomeCarouselProps) => {
  return (
    <div className="relative w-full">
      <Carousel
        className="lg:h-[80vh] h-[45vh] w-full"
        opts={{
          align: "center",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
          }),
        ]}
      >
        <CarouselContent className="h-full ml-0" viewportClassName="h-full">
          {slides.map((slide, index) => (
            <CarouselItem key={slide.id} className="h-full pl-0">
              <Card className="h-full w-full overflow-hidden rounded-none border-none p-0 shadow-none">
                <CardContent className="relative h-full w-full p-0">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="100vw"
                    priority={index === 0}
                    className="object-cover h-auto brightness-[0.85]"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default HomeCarousel;
