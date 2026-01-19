import { HANGERHIGHLIGHTSVIDEO } from "@/config/shop-the-look-video";
import Image from "next/image";
import Link from "next/link";
import React from "react";

interface VideoBannerProps {
  videos?: typeof HANGERHIGHLIGHTSVIDEO;
}

const VideoBanner = ({ videos = HANGERHIGHLIGHTSVIDEO }: VideoBannerProps) => {
  return (
    <section className="w-full bg-black py-24 text-white">
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
            In Motion
          </p>
          <h2 className="text-3xl font-light uppercase tracking-[0.2em] text-white md:text-4xl">
            Shop The Look
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {videos.slice(0, 2).map((item) => (
            <div key={item.id} className="flex flex-col gap-6">
              {/* Video Container */}
              <div className="group relative aspect-4/5 overflow-hidden bg-slate-900 md:aspect-video">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-60"
                >
                  <source src={item.video} type="video/mp4" />
                </video>
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                  <h3 className="mb-4 text-2xl font-light uppercase tracking-widest text-white md:text-3xl">
                    {item.title}
                  </h3>
                  <p className="mb-8 max-w-md text-sm font-medium tracking-wide text-slate-200">
                    {item.description}
                  </p>
                  <Link
                    href={`/collections/${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="border border-white px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default VideoBanner;
