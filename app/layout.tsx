import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Binder - Group Chat App",
  description: "Connect with your community smarter",
  icons: {
    icon: "/binder_logo.png",
    shortcut: "/binder_logo.png",
    apple: "/binder_logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <div className="flex flex-col md:flex-row h-screen">
          <Nav />
          <main className="flex-1 bg-white">{children}</main>
        </div>
      </body>
    </html>
  );
}
