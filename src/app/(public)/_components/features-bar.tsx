import { Truck, RefreshCw, ShieldCheck, Headphones } from "lucide-react";
import React from "react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders over $150",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    description: "100% secure checkout",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Dedicated support team",
  },
];

const FeaturesBar = () => {
  return (
    <section className="border-t border-slate-100 bg-white py-16">
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-900">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesBar;
