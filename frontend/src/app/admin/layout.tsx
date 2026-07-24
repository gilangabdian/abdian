import type { Metadata } from "next";
import { Inter, DM_Serif_Display, Playfair_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Admin Dashboard - Gilang Abdian",
  description: "Admin panel for Gilang Abdian's portfolio",
};

import AdminLayoutWrapper from "@/components/layouts/admin/AdminLayoutWrapper";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${inter.variable} ${dmSerif.variable} ${playfair.variable} flex flex-col min-h-full bg-gray-50 dark:bg-neutral-900 text-black dark:text-white w-full`}>
      <AdminLayoutWrapper>
        {children}
      </AdminLayoutWrapper>
    </div>
  );
}
