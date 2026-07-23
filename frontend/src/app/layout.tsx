import type { Metadata } from "next";
import "@/app/globals.css";
import Provider from "./provider";

export const metadata: Metadata = {
  title: "Gilang Abdian",
  description: "Personal Portfolio of Gilang Abdian",
  icons: {
    icon: [{ url: "/abdian.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased h-full">
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
