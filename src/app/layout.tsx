import type { Metadata } from "next";
import { Geist, Geist_Mono, Rye } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const rye = Rye({
  weight: "400",
  variable: "--font-rye",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "jungcollin - Portfolio",
  description: "Enter the saloon. Explore my projects.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${rye.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
