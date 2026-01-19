import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/providers/query-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { NotificationProvider } from "@/components/providers/notification-provider";
import { AuthModalProvider } from "@/components/providers/auth-modal-provider";
import { DelayedLoginPopup } from "@/components/auth/delayed-login-popup";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meni-me - Fashion & Style",
  description: "Discover tailored silhouettes and modern staples at Meni-me",
  icons: {
    icon: {
      url: "/icon.png",
      type: "image/png",
      sizes: "16x16",
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <QueryProvider>
            <ToastProvider>
              <NotificationProvider>
                <AuthModalProvider>
                  <DelayedLoginPopup />
                  {children}
                </AuthModalProvider>
              </NotificationProvider>
            </ToastProvider>
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
