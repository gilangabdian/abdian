"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isBlogsPage = pathname === "/blogs";

  return (
    <footer
      id="public-footer"
      data-animate={isBlogsPage ? true : undefined}
      style={isBlogsPage ? ({ "--stagger": 11 } as React.CSSProperties) : undefined}
      className="bg-transparent text-black dark:text-white relative pb-8 lg:pb-8 px-8 flex flex-col items-center justify-end z-50 transition-colors duration-300"
    >
      <div className="text-sm font-sans text-neutral-500 dark:text-neutral-600">
        &copy; {new Date().getFullYear()} Gilang Abdian
      </div>
    </footer>
  );
}
