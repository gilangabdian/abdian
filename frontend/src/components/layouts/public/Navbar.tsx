"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Icon } from "@iconify/react";

const menus = [
  { name: "Home", href: "/", icon: "mdi:home-variant-outline", title: "Home" },
  { name: "About", href: "/about", icon: "mdi:card-account-details-outline", title: "About" },
  { name: "Blog", href: "/blogs", icon: "material-symbols-light:post-outline", title: "Blogs" },
  { name: "Projects", href: "/projects", icon: "mdi:folder-outline", title: "Projects" },
  { name: "Certificates", href: "/certificates", icon: "mdi:certificate-outline", title: "Certificates" },
  { name: "Artworks", href: "/artworks", icon: "mdi:palette-outline", title: "Artworks" },
  { name: "Photos", href: "/photos", icon: "ri:camera-3-line", title: "Photos" },
  { name: "Contacts", href: "/contacts", icon: "mdi:email-outline", title: "Contacts" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolledToRight, setIsScrolledToRight] = useState(false);

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMenuScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.scrollWidth - Math.round(el.scrollLeft) - el.clientWidth <= 2) {
      setIsScrolledToRight(true);
    } else {
      setIsScrolledToRight(false);
    }
  };

  const playScrollHint = () => {
    const el = menuContainerRef.current;
    if (el && window.innerWidth < 1024) {
      setTimeout(() => {
        el.scrollLeft = 0;
        gsap.fromTo(
          el,
          { scrollLeft: 0 },
          {
            scrollLeft: 60,
            duration: 1.2,
            delay: 0.2,
            ease: "power2.inOut",
            yoyo: true,
            repeat: 1,
            overwrite: "auto",
          },
        );
      }, 600);
    }
  };

  const checkFooterOverlap = () => {
    const footerEl = document.querySelector("footer");
    if (!footerEl || !navRef.current) return;

    const footerRect = footerEl.getBoundingClientRect();
    const navEl = navRef.current;
    const navHeight = navEl.offsetHeight;
    const isMobile = window.innerWidth < 1024;

    if (isMobile) {
      gsap.to(navEl, {
        y: 0,
        xPercent: -50,
        left: "50%",
        duration: 0.3,
        overwrite: "auto",
        ease: "power2.out",
      });
    } else {
      const navBottom = 16 + navHeight;
      if (footerRect.top < navBottom) {
        const pushAmount = navBottom - footerRect.top;
        gsap.set(navEl, {
          y: -pushAmount,
          xPercent: -50,
          left: "50%",
          force3D: true,
        });
      } else {
        gsap.to(navEl, {
          y: 0,
          xPercent: -50,
          left: "50%",
          duration: 0.3,
          overwrite: "auto",
          ease: "power2.out",
        });
      }
    }
  };

  const resetNavbarPosition = () => {
    if (navRef.current) {
      gsap.killTweensOf(navRef.current);
      gsap.set(navRef.current, {
        y: 0,
        xPercent: -50,
        left: "50%",
        x: 0,
        clearProps: "transform",
      });
      gsap.set(navRef.current, {
        y: 0,
        xPercent: -50,
        left: "50%",
        x: 0,
      });
    }
  };

  useEffect(() => {
    resetNavbarPosition();

    if (pathname === "/") {
      setTimeout(playScrollHint, 800);
    } else {
      playScrollHint();
    }

    let rafId: number;
    const onScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(checkFooterOverlap);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    setTimeout(checkFooterOverlap, 100);
    setTimeout(checkFooterOverlap, 600);

    if (menuContainerRef.current) {
      handleMenuScroll({ currentTarget: menuContainerRef.current } as any);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    resetNavbarPosition();
    setTimeout(checkFooterOverlap, 600);
  }, [pathname]);

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @media (max-width: 1024px) {
          .scroll-fade {
            mask-image: linear-gradient(to right, black 80%, transparent 100%);
            -webkit-mask-image: linear-gradient(to right, black 80%, transparent 100%);
          }
        }
      `,
        }}
      />

      <div className="absolute top-4 right-4 z-[60] lg:hidden">
        <svg
          className="navbar-logo-svg"
          width="24"
          height="36"
          viewBox="0 0 18 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <mask
            id="mask0_3_132_mobile"
            style={{ maskType: "alpha" }}
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
          <g mask="url(#mask0_3_132_mobile)">
            <path
              className="stroke-black dark:stroke-white fill-transparent transition-colors duration-300"
              d="M6.069 10.0362L3.069 21.0362L7.569 15.0362L10.6523 11.0362L13.569 7.5362L16.069 4.5362L1.069 6.5362C1.23567 6.70286 3.669 9.5362 12.069 19.5362L10.569 10.5362L8.569 0.536199M8.569 0.536199C8.569 0.136199 7.9111 3.20287 7.9111 3.0362M3.95931 17.7717L6.069 10.0362L8.569 0.536199M5.069 18.3695L7.569 15.0362"
            />
          </g>
        </svg>
      </div>

      <nav
        ref={navRef as any}
        className="fixed bottom-4 lg:top-4 lg:bottom-auto left-1/2 -translate-x-1/2 z-[51] w-[95%] lg:max-w-fit">
        <div className="bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md border border-black/20 dark:border-white/10 rounded-2xl lg:rounded-full px-2 py-2 lg:px-6 lg:py-2 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)] overflow-hidden">
          <div
            title="Gilang Abdian"
            className="hidden lg:block font-bold text-xl tracking-tighter mr-4 border-r border-black/20 dark:border-white/20 pr-4 text-black dark:text-white">
            <svg
              className="navbar-logo-svg"
              width="20"
              height="30"
              viewBox="0 0 18 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <mask
                id="mask0_3_132"
                style={{ maskType: "alpha" }}
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
              <g mask="url(#mask0_3_132)">
                <path
                  className="stroke-black dark:stroke-white fill-transparent transition-colors duration-300"
                  d="M6.069 10.0362L3.069 21.0362L7.569 15.0362L10.6523 11.0362L13.569 7.5362L16.069 4.5362L1.069 6.5362C1.23567 6.70286 3.669 9.5362 12.069 19.5362L10.569 10.5362L8.569 0.536199M8.569 0.536199C8.569 0.136199 7.9111 3.20287 7.9111 3.0362M3.95931 17.7717L6.069 10.0362L8.569 0.536199M5.069 18.3695L7.569 15.0362"
                />
              </g>
            </svg>
          </div>

          <div
            ref={menuContainerRef}
            onScroll={handleMenuScroll}
            className={`flex gap-2 items-center w-full lg:w-auto md:justify-around lg:justify-start overflow-x-auto no-scrollbar lg:overflow-visible px-1 min-w-0 transition-all duration-300 ${!isScrolledToRight ? "scroll-fade" : ""}`}>
            {menus.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={item.title}
                  className={`group flex-shrink-0 flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-1.5 p-2 lg:px-3 lg:py-1.5 rounded-xl lg:rounded-full text-[10px] lg:text-sm font-bold transition-all duration-200 border border-transparent hover:border-black/20 dark:hover:border-white/20 active:scale-95 whitespace-nowrap text-gray-700 dark:text-gray-300 dark:hover:text-white ${
                    isActive
                      ? "active-nav-item bg-black text-white dark:!bg-[#ffffff] dark:!text-black shadow-md lg:shadow-none !border-transparent"
                      : ""
                  }`}>
                  <span className="w-5 h-5 lg:w-4 lg:h-4 flex items-center justify-center shrink-0">
                    <Icon icon={item.icon} className="w-full h-full transition-transform group-hover:scale-110" />
                  </span>
                  <span className="uppercase tracking-tighter lg:tracking-normal lg:capitalize">{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <div className="border-l border-black/20 dark:border-white/20 pl-2 ml-1 lg:pl-4 lg:ml-2 flex-shrink-0">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={mounted ? (isDark ? "Switch to light theme" : "Switch to dark theme") : "Switch theme"}
              className="cursor-pointer flex items-center justify-center p-2 rounded-full transition-all duration-300 hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 dark:hover:text-white active:scale-95"
              suppressHydrationWarning>
              <span className="w-5 h-5 lg:w-4 lg:h-4 relative flex items-center justify-center shrink-0">
                <span className="hidden dark:block w-full h-full">
                  <Icon icon="lucide:sun" className="w-full h-full" />
                </span>
                <span className="block dark:hidden w-full h-full">
                  <Icon icon="si:moon-line" className="w-full h-full" />
                </span>
              </span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
