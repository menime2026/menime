import Link from "next/link";
import React from "react";

interface PromoBannerProps {
  title?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  link?: string;
  linkText?: string;
  secondaryLink?: string;
  secondaryLinkText?: string;
}

const PromoBanner = ({
  title = "The Denim Icon",
  subtitle = "Limited Time Only",
  description = "Discover the collection that started it all. Timeless cuts, premium fabrics, and the perfect fit for every body.",
  image = "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80",
  link = "/collections/new-arrivals",
  linkText = "Shop Collection",
  secondaryLink = "/about",
  secondaryLinkText = "Read The Story",
}: PromoBannerProps) => {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${image}')`,
        }}
      >
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative flex h-full w-full flex-col items-center justify-center px-6 text-center text-white">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-white/90">
          {subtitle}
        </p>
        <h2 className="mb-6 max-w-4xl text-4xl font-light uppercase tracking-[0.2em] md:text-6xl lg:text-7xl">
          {title}
        </h2>
        <p className="mb-10 max-w-xl text-sm font-medium leading-relaxed tracking-wide text-white/90 md:text-base">
          {description}
        </p>
        <div className="flex gap-4">
          <Link
            href={link}
            className="bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 transition hover:bg-slate-100"
          >
            {linkText}
          </Link>
          <Link
            href={secondaryLink}
            className="border border-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-slate-900"
          >
            {secondaryLinkText}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
