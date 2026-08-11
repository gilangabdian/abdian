"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    // { name: "Certificates", href: "/certificates" },
  ];

  // Mobile nav items — icon only
  const mobileIconLinks = [
    { name: "About", href: "/about", icon: "mdi:card-account-details-outline" },
    { name: "Blog", href: "/blogs", icon: "material-symbols-light:post-outline" },
    { name: "Projects", href: "/projects", icon: "mdi:folder-outline" },
    // { name: "Certificates", href: "/certificates", icon: "icon-park-outline:certificate" },
    { name: "Artworks", href: "/artworks", icon: "mdi:palette-outline" },
    { name: "Photos", href: "/photos", icon: "ri:camera-3-line" },
    // { name: "Github", href: "https://github.com/gilangabdian", icon: "mingcute:github-line" },
  ];

  // Desktop nav items — icon only
  const iconLinks = [
    { name: "Artworks", href: "/artworks", icon: "mdi:palette-outline" },
    { name: "Photos", href: "/photos", icon: "ri:camera-3-line" },
    { name: "Bluesky", href: "https://bsky.app/profile/enkdevur.bsky.social", icon: "ri:bluesky-line" },
    { name: "Github", href: "https://github.com/gilangabdian", icon: "mingcute:github-line" },
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

  // ─── MOBILE NAVBAR MARKUP ────────────────────────
  const mobileNavbar = (
    <div className="absolute top-2 left-0 right-0 z-50 lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-black">
      {/* Kiri: SVG Logo */}
      <Link href="/" title="Gilang Abdian">
        {renderLogoSvg("mask0_mobile", 30, 30)}
      </Link>

      {/* Kanan: Semua icon */}
      <div className="flex items-center gap-x-4">
        {mobileIconLinks.map((link) => {
          const isGithub = link.name === "Github";
          return (
            <Link
              key={`mobile-${link.name}`}
              href={link.href}
              title={link.name}
              {...(isGithub ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`transition-colors duration-200 ${
                isActive(link.href)
                  ? "text-black dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}>
              <iconify-icon icon={link.icon} height="20" width="20" />
            </Link>
          );
        })}

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Switch theme"}
          className="cursor-pointer transition-colors duration-200 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
          suppressHydrationWarning>
          <span className="hidden dark:block">
            <iconify-icon icon="lucide:sun" height="20" width="20" />
          </span>
          <span className="block dark:hidden">
            <iconify-icon icon="ri:moon-line" height="20" width="20" />
          </span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══════════════ DESKTOP NAVBAR (lg+) ═══════════════ */}

      {/* KIRI - SVG Logo (fixed) */}
      <Link href="/" className="fixed top-5 left-6 z-50 hidden lg:block" title="Gilang Abdian">
        {renderLogoSvg("mask0_desk", 40, 40)}
      </Link>

      {/* KANAN - Menu Items */}
      <div className="absolute top-7 right-8 z-50 hidden lg:flex items-center gap-x-6">
        {textLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`text-md font-[Inter] tracking-tight transition-colors duration-200 ${
              isActive(link.href)
                ? "text-black dark:text-white"
                : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
            }`}>
            {link.name}
          </Link>
        ))}
        {iconLinks.map((link) => {
          const isGithub = link.name === "Github";
          const isBluesky = link.name === "Bluesky";
          return (
            <Link
              key={link.name}
              href={link.href}
              title={link.name}
              {...(isGithub || isBluesky ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`transition-colors duration-200 ${
                isActive(link.href)
                  ? "text-black dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}>
              <iconify-icon icon={link.icon} height="20" width="20" />
            </Link>
          );
        })}

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Switch theme"}
          className="cursor-pointer transition-colors duration-200 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white active:scale-95"
          suppressHydrationWarning>
          <span className="hidden dark:block">
            <iconify-icon icon="lucide:sun" height="20" width="20" />
          </span>
          <span className="block dark:hidden">
            <iconify-icon icon="ri:moon-line" height="20" width="20" />
          </span>
        </button>
      </div>

      {/* ═══════════════ MOBILE NAVBAR — absolute pos di atas ═══════════════ */}
      {mobileNavbar}
    </>
  );
}
