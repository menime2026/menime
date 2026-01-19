import React from "react";

const NewsletterSection = () => {
  return (
    <section className="w-full bg-slate-50 py-24">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <h2 className="mb-4 text-2xl font-light uppercase tracking-[0.2em] text-slate-900 md:text-3xl">
          Join The Family
        </h2>
        <p className="mb-8 max-w-lg text-sm text-slate-500">
          Sign up for exclusive access to new drops, special offers, and behind-the-scenes content. Plus, get 15% off your first order.
        </p>

        <form className="flex w-full max-w-md flex-col gap-4 sm:flex-row">
          <input
            type="email"
            placeholder="ENTER YOUR EMAIL"
            className="flex-1 border-b border-slate-300 bg-transparent px-4 py-3 text-sm uppercase tracking-wider text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-slate-900 px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-slate-800"
          >
            Subscribe
          </button>
        </form>

        <p className="mt-6 text-[10px] text-slate-400">
          By signing up, you agree to our Privacy Policy and Terms of Service.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
