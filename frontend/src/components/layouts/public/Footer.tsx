"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isBlogsPage = pathname === "/blogs";

  return (
    <footer
      id="public-footer"
      data-animate={isBlogsPage ? true : undefined}
      style={isBlogsPage ? ({ "--stagger": 6 } as React.CSSProperties) : undefined}
      className="w-full bg-transparent text-black dark:text-white relative pb-8 lg:pb-8 px-6 flex justify-center z-50 transition-colors duration-300"
    >
      <div className="w-full max-w-[560px] mx-auto text-left">
        <div className="text-sm font-sans text-neutral-500 dark:text-neutral-600">
          &copy; {new Date().getFullYear()} Gilang Abdian
        </div>
      </div>
    </footer>
  );
}
