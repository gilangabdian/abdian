"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";

const mobileMenus = [
  { name: "About", href: "/about", icon: "mdi:card-account-details-outline" },
  { name: "Blog", href: "/blogs", icon: "material-symbols-light:post-outline" },
  { name: "Projects", href: "/projects", icon: "mdi:folder-outline" },
  { name: "Artworks", href: "/artworks", icon: "mdi:palette-outline" },
  { name: "Photos", href: "/photos", icon: "ri:camera-3-line" },
  { name: "Contacts", href: "/contacts", icon: "mdi:email-outline" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolledPast, setScrolledPast] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect scroll to hide right nav items
  useEffect(() => {
    const onScroll = () => {
      setScrolledPast(window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = resolvedTheme === "dark";

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Desktop nav items — text only
  const textLinks = [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blogs" },
    { name: "Projects", href: "/projects" },
  ];

  // Desktop nav items — icon only
  const iconLinks = [
    { name: "Artworks", href: "/artworks", icon: "mdi:palette-outline" },
    { name: "Photos", href: "/photos", icon: "ri:camera-3-line" },
    { name: "Contacts", href: "/contacts", icon: "mdi:email-outline" },
  ];

  // ─── SVG mask helper ───────────────────────────────
  const renderLogoSvg = (id: string, width: number, height: number) => (
    <svg
      className="navbar-logo-svg"
      width={width}
      height={height}
      viewBox="0 0 18 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <mask
        id={id}
        style={{ maskType: "alpha" } as React.CSSProperties}
        maskUnits="userSpaceOnUse"
        x="-2"
        y="-2"
        width="22"
        height="25">
        <path
          d="M18.069 4.0362L11.0853 11.4006L13.4629 21.0362L7.6713 15.0007L1.94779 21.0362L4.70141 11.9058L-0.931 6.0362L6.71431 5.23143L8.28112 0.0362015L9.49094 4.93916L18.069 4.0362Z"
          fill="#D9D9D9"
        />
        <path
          d="M18.069 4.0362L1.94779 21.0362L8.28112 0.0362015L13.4629 21.0362L-0.931 6.0362L18.069 4.0362Z"
          stroke="white"
        />
      </mask>
      <g mask={`url(#${id})`}>
        <path
          className="stroke-black dark:stroke-white fill-transparent transition-colors duration-300"
          d="M6.069 10.0362L3.069 21.0362L7.569 15.0362L10.6523 11.0362L13.569 7.5362L16.069 4.5362L1.069 6.5362C1.23567 6.70286 3.669 9.5362 12.069 19.5362L10.569 10.5362L8.569 0.536199M8.569 0.536199C8.569 0.136199 7.9111 3.20287 7.9111 3.0362M3.95931 17.7717L6.069 10.0362L8.569 0.536199M5.069 18.3695L7.569 15.0362"
        />
      </g>
    </svg>
  );

  return (
    <>
      {/* ═══════════════ DESKTOP NAVBAR (lg+) ═══════════════ */}

      {/* KIRI - SVG Logo (fixed — selalu terlihat saat di-scroll) */}
      <Link href="/" className="fixed top-5 left-6 z-50 hidden lg:block" title="Gilang Abdian">
        {renderLogoSvg("mask0_desk", 40, 40)}
      </Link>

      {/* KANAN - Menu Items (fixed tp ilang saat di-scroll > 60px) */}
      <div
        className={`fixed top-7 right-8 z-50 hidden lg:flex items-center gap-x-6 transition-opacity duration-500 ${
          scrolledPast ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}>
        {/* Text links (About, Blog, Projects) */}
        {textLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`text-lg font-[Inter] tracking-tight transition-colors duration-200 ${
              isActive(link.href)
                ? "text-black dark:text-white"
                : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}>
            {link.name}
          </Link>
        ))}
        {/* Icon links (Artworks, Photos, Contacts) */}
        {iconLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            title={link.name}
            className={`transition-colors duration-200 ${
              isActive(link.href)
                ? "text-black dark:text-white"
                : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}>
            <Icon icon={link.icon} className="w-5 h-5" />
          </Link>
        ))}

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Switch theme"}
          className="cursor-pointer transition-colors duration-200 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white active:scale-95"
          suppressHydrationWarning>
          <span className="hidden dark:block">
            <Icon icon="lucide:sun" className="w-6 h-6" />
          </span>
          <span className="block dark:hidden">
            <Icon icon="si:moon-line" className="w-6 h-6" />
          </span>
        </button>
      </div>

      {/* ═══════════════ MOBILE NAVBAR (< lg) ═══════════════ */}

      {/* Mobile SVG Logo (top left) */}
      <Link href="/" className="fixed top-4 left-4 z-50 lg:hidden" title="Go to Home">
        {renderLogoSvg("mask0_mobile_nav", 20, 30)}
      </Link>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border-t border-black/10 dark:border-white/10">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileMenus.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors duration-200 ${
                  active ? "text-black dark:text-white" : "text-neutral-500 dark:text-neutral-400"
                }`}>
                <Icon icon={item.icon} className="w-5 h-5" />
                <span className="text-[10px] font-semibold uppercase tracking-tight">{item.name}</span>
              </Link>
            );
          })}

          {/* Mobile Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            title="Toggle theme"
            className="flex flex-col items-center gap-0.5 px-2 py-1 text-neutral-500 dark:text-neutral-400 transition-colors duration-200"
            suppressHydrationWarning>
            <span className="hidden dark:block">
              <Icon icon="lucide:sun" className="w-5 h-5" />
            </span>
            <span className="block dark:hidden">
              <Icon icon="si:moon-line" className="w-5 h-5" />
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
