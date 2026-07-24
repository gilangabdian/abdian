import type { Metadata } from "next";
import "@/app/globals.css";
import "highlight.js/styles/night-owl.css";
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
