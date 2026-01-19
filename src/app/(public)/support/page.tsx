import { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = {
  title: "Support | Meni-me",
  description: "Contact our concierge team for assistance.",
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1600px] px-6 py-12 lg:px-12 lg:py-20">
        <div className="mb-16 border-b border-slate-100 pb-6">
          <h1 className="text-xs font-bold uppercase tracking-widest text-slate-900">
            Customer Care
          </h1>
        </div>

        <div className="grid gap-12 lg:grid-cols-2 xl:gap-24">
          {/* Contact Information */}
          <div className="space-y-12">
            <div className="space-y-6">
              <h2 className="text-3xl font-light text-slate-900">
                How can we help?
              </h2>
              <p className="max-w-md text-slate-600">
                Our concierge team is available Monday through Friday, 9am to 6pm EST. We aim to respond to all inquiries within 24 hours.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50">
                  <Mail className="h-4 w-4 text-slate-900" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Email Us</h3>
                  <p className="text-sm text-slate-500">For general inquiries and order support</p>
                  <a href="mailto:test@menime.com" className="block text-lg font-medium text-slate-900 hover:underline">
                    test@menime.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50">
                  <Phone className="h-4 w-4 text-slate-900" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Call Us</h3>
                  <p className="text-sm text-slate-500">Speak directly with a stylist</p>
                  <a href="tel:0123456789" className="block text-lg font-medium text-slate-900 hover:underline">
                    0123456789
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50">
                  <MessageSquare className="h-4 w-4 text-slate-900" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Live Chat</h3>
                  <p className="text-sm text-slate-500">Available during business hours</p>
                  <Button variant="link" className="h-auto p-0 text-lg font-medium text-slate-900 hover:underline">
                    Start a conversation
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-8">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">FAQ</h3>
              <ul className="space-y-4">
                <li>
                  <Link href="#" className="group flex items-center justify-between text-sm text-slate-600 hover:text-slate-900">
                    <span>Shipping & Delivery</span>
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
                <li>
                  <Link href="#" className="group flex items-center justify-between text-sm text-slate-600 hover:text-slate-900">
                    <span>Returns & Exchanges</span>
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
                <li>
                  <Link href="#" className="group flex items-center justify-between text-sm text-slate-600 hover:text-slate-900">
                    <span>Size Guide</span>
                    <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2rem border border-slate-200 bg-white p-8 shadow-sm lg:p-12">
            <h3 className="mb-8 text-xl font-semibold text-slate-900">Send a message</h3>
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</Label>
                  <Input id="firstName" placeholder="Jane" className="border-slate-200 bg-slate-50 focus:border-slate-900 focus:ring-slate-900" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" className="border-slate-200 bg-slate-50 focus:border-slate-900 focus:ring-slate-900" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</Label>
                <Input id="email" type="email" placeholder="jane@example.com" className="border-slate-200 bg-slate-50 focus:border-slate-900 focus:ring-slate-900" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderNumber" className="text-xs font-bold uppercase tracking-wider text-slate-500">Order Number (Optional)</Label>
                <Input id="orderNumber" placeholder="#12345" className="border-slate-200 bg-slate-50 focus:border-slate-900 focus:ring-slate-900" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-500">Message</Label>
                <Textarea
                  id="message"
                  placeholder="How can we help you today?"
                  className="min-h-[150px] border-slate-200 bg-slate-50 focus:border-slate-900 focus:ring-slate-900"
                />
              </div>

              <Button type="submit" className="w-full rounded-full bg-slate-900 py-6 text-xs font-bold uppercase tracking-widest hover:bg-slate-800">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
