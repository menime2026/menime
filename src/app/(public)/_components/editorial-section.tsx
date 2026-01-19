import Image from "next/image";
import Link from "next/link";
import React from "react";

interface EditorialSectionProps {
  items: {
    id: number;
    images: string;
    alt: string;
  }[];
}

const EditorialSection = ({ items }: EditorialSectionProps) => {
  if (!items || items.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
      <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
        <div className="flex flex-col justify-center space-y-6 p-8 md:p-12 lg:p-20">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Editorial</p>
          <h2 className="text-4xl font-light uppercase leading-tight tracking-0.1em text-slate-900 lg:text-6xl">
            Modern <br /> Minimalism
          </h2>
          <p className="max-w-md text-lg font-light text-slate-600">
            Clean lines, neutral tones, and premium fabrics. Discover the essence of modern style.
          </p>
          <Link href="/collections/editorial" className="w-fit border-b border-slate-900 pb-1 text-sm font-bold uppercase tracking-widest text-slate-900 transition hover:border-slate-500 hover:text-slate-500">
            Read the story
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {items.slice(0, 4).map((item) => (
            <Link
              key={item.id}
              href={`/products/${item.alt.toLowerCase().replace(/\s+/g, '-')}`}
              className="relative aspect-3/4 w-full overflow-hidden bg-slate-100 block"
            >
              <Image
                src={item.images}
                alt={item.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition duration-700 hover:scale-105"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditorialSection;
