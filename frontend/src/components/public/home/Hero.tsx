"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Profile } from "@/types";
import { Icon } from "@iconify/react";
import LeaveMark from "./LeaveMark";

type Decoration = {
  src: string;
  position: string;
  size: string;
  hoverEffect?: string;
  animation?: string;
  slideFrom?: string;
  delay?: string;
};

type ConfigItem = {
  static: Decoration[];
  hoverOnly: Decoration[];
};

const DECORATIONS_CONFIG: Record<number, ConfigItem> = {
  0: {
    static: [
      {
        src: "/decorations/deco0-1.png",
        position: "-top-[-30px] left-[-1px]",
        size: "w-8",
        hoverEffect: "scale-110 -rotate-12 translate-x-2",
      },
      {
        src: "/decorations/deco0-1.png",
        position: "md:-top-[-240px] top-[310px] left-[70px] md:left-[50px]",
        size: "w-4",
        hoverEffect: "scale-110 translate-x-2",
      },
      {
        src: "/decorations/deco0-1.png",
        position: "bottom-[10px] right-[20px]",
        size: "w-6",
        hoverEffect: "scale-125 rotate-12",
      },
    ],
    hoverOnly: [
      {
        src: "/decorations/deco0-hover.png",
        position: "-top-[35px] -right-[2px]",
        size: "w-20",
        animation: "scale-110",
        slideFrom: "translate-y-5",
      },
    ],
  },
  1: {
    static: [
      {
        src: "/decorations/deco1-1.png",
        position: "-bottom-[-85px] right-[30px]",
        size: "w-8",
        hoverEffect: "rotate-15",
      },
      {
        src: "/decorations/deco1-1.png",
        position: "-top-[-10px] left-[10px]",
        size: "w-8",
        hoverEffect: "scale-105 rotate-20",
      },
    ],
    hoverOnly: [
      {
        src: "/decorations/deco1-hover.png",
        position: "-top-[25px] right-[0px] rotate-16",
        size: "w-30",
        hoverEffect: "rotate-15",
        slideFrom: "translate-x-10",
      },
    ],
  },
  2: {
    static: [
      {
        src: "/decorations/deco2-1.png",
        position: "md:-top-[-230px] top-[300px] left-[30px] md:left-[1px]",
        size: "w-16",
        hoverEffect: "rotate-[120deg] transition-transform duration-700 custom-bounce",
      },
      {
        src: "/decorations/deco2-2.png",
        position: "md:-bottom-[-100px] -bottom-[-110px] right-[30px] md:right-[2px]",
        size: "w-14",
        hoverEffect: "rotate-[-40deg] transition-transform duration-700 custom-bounce",
      },
    ],
    hoverOnly: [
      {
        src: "/decorations/deco2-hover.png",
        position: "-top-[50px] right-[20px]",
        size: "w-14",
        animation: "",
        slideFrom: "-translate-y-10",
      },
    ],
  },
  3: {
    static: [
      {
        src: "/decorations/deco3-2.png",
        position: "-bottom-[-100px] right-[26px]",
        size: "w-8",
        hoverEffect: "scale-125 ",
      },
      {
        src: "/decorations/deco3-1.png",
        position: "md:top-[234px] top-[300px] left-[50px] md:left-[35px]",
        size: "w-8",
        hoverEffect: "scale-125 rotate-20",
      },
    ],
    hoverOnly: [
      {
        src: "/decorations/deco3-hover.png",
        position: "md:top-[-55px] top-[-50px] left:-[60px] md:left-[-6px]",
        size: "w-16",
        hoverEffect: "scale-125 rotate-110",
        slideFrom: "translate-y-2",
        delay: "delay-0",
      },
    ],
  },
  4: { static: [], hoverOnly: [] },
  5: { static: [], hoverOnly: [] },
  6: { static: [], hoverOnly: [] },
  7: { static: [], hoverOnly: [] },
  8: { static: [], hoverOnly: [] },
  9: { static: [], hoverOnly: [] },
};

gsap.registerPlugin(useGSAP);

interface HeroProps {
  profile?: Profile | null;
}

export default function Hero({ profile }: HeroProps) {
  const [displayedJob, setDisplayedJob] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const heroPhotos = profile?.about?.hero_photo_urls || [];

  const currentDecorations = DECORATIONS_CONFIG[currentIndex] || { static: [], hoverOnly: [] };

  useEffect(() => {
    // Check mobile screen
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);

    // Load saved index from localStorage
    const savedIndex = localStorage.getItem("hero_last_index");
    if (savedIndex !== null) {
      const idx = parseInt(savedIndex, 10);
      if (!isNaN(idx) && heroPhotos.length > 0 && idx < heroPhotos.length) {
        setCurrentIndex(idx);
      }
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [heroPhotos.length]);

  const showDecorations = isHovered || isMobile;

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleClick = () => {
    if (heroPhotos.length <= 1 || isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= heroPhotos.length) {
        nextIndex = 0;
      }
      setCurrentIndex(nextIndex);
      localStorage.setItem("hero_last_index", nextIndex.toString());
      setTimeout(() => setIsAnimating(false), 200);
    }, 150);
  };

  // Typewriter Effect
  useEffect(() => {
    // Blinking cursor
    const intervalId = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const text = profile?.about?.job_title || "";
    if (!text) return;

    let i = 0;
    setDisplayedJob("");
    let typingTimer: NodeJS.Timeout;

    const typeChar = () => {
      if (i < text.length) {
        // Gunakan substring agar tidak ada race condition pada previous state
        setDisplayedJob(text.substring(0, i + 1));
        i++;
        typingTimer = setTimeout(typeChar, 100);
      }
    };

    // Start after 1s (matching GSAP delay)
    const startTimer = setTimeout(typeChar, 1000);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(typingTimer);
    };
  }, [profile?.about?.job_title]);

  useGSAP(
    () => {
      if (!profile || !profile.about) return;
      const tl = gsap.timeline();

      tl.from(".hero-badge", {
        scale: 0,
        rotation: -20,
        opacity: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
      })
        .from(
          ".hero-text",
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
          },
          "-=0.4",
        )
        .from(
          ".hero-content",
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.6",
        )
        .from(
          ".hero-image",
          {
            y: 100,
            opacity: 0,
            scale: 0.9,
            duration: 1.2,
            ease: "elastic.out(1, 0.75)",
          },
          "-=1.0",
        );
    },
    { scope: heroRef, dependencies: [profile] },
  );

  if (!profile || !profile.about) {
    return null;
  }

  return (
    <div
      ref={heroRef}
      className="container mx-auto px-6 pt-26 pb-6 md:pt-8 md:pb-0 min-h-screen flex items-center justify-center overflow-hidden">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-4xl gap-2 mt-8">
        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start space-y-3 md:space-y-3 mt-4">
          {profile.about.is_available_for_work && (
            <div className="hero-badge inline-block bg-[#f8f8f8] dark:bg-white/5 border border-black/20 dark:border-white/10 px-3 py-1 rounded-lg shadow-sm transform -rotate-1 origin-bottom-left">
              <h5 className="font-bold text-[10px] md:text-xs tracking-wide uppercase">Available for Work</h5>
            </div>
          )}

          <div className="space-y-0.5">
            <h1 className="hero-text text-4xl md:text-5xl font-bold leading-tight font-[Inter] tracking-tight">
              Hi, I&apos;m{" "}
              <span className="underline decoration-4 underline-offset-4 decoration-black dark:decoration-white">
                {profile.about.name}
              </span>
            </h1>

            <h2 className="hero-text text-xl md:text-2xl lg:text-3xl font-[Inter] font-medium text-gray-800 dark:text-gray-200 pt-1 min-h-[1.5em] flex items-center">
              <span>{displayedJob}</span>
              <span
                className={`inline-block w-[2px] h-[24px] md:h-[32px] bg-black dark:bg-white ml-1 align-middle transition-opacity duration-100 ${
                  cursorVisible ? "opacity-100" : "opacity-0"
                }`}></span>
            </h2>
          </div>

          <p className="hero-content text-sm text-justify leading-relaxed max-w-lg font-[Inter] text-gray-700 dark:text-gray-300">
            {profile.about.about_description}
          </p>

          <div className="hero-content flex flex-wrap gap-2 font-medium text-xs">
            <div className="flex items-center gap-1.5 py-1">
              <Icon icon="mdi:map-marker" />
              <span>Based in Indonesia</span>
            </div>
            {profile.about.is_available_for_work && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 text-black dark:text-white">
                <div className="w-2 h-2 bg-black dark:bg-white rounded-full animate-pulse"></div>
                <span>Available Now</span>
              </div>
            )}
          </div>

          <div className="hero-content flex gap-3 pt-1 w-full md:w-auto">
            {profile.about.is_available_for_work && (
              <a
                href="mailto:qbdian@gmail.com?subject=Hi Gilang Abdian Anggara, I want to hire you!"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-white dark:bg-white dark:text-black px-0 md:px-5 py-2 rounded-xl border border-transparent font-bold text-sm shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:bg-black/90 dark:hover:bg-gray-200 active:scale-95 transition-all">
                <Icon icon="mdi:handshake-outline" className="w-4 h-4 md:w-5 md:h-5" />
                <span>Hire Me</span>
              </a>
            )}

            <a
              href={profile.about.cv_url}
              target="_blank"
              rel="noreferrer"
              className={`${
                profile.about.is_available_for_work ? "flex-1 md:flex-none px-0 md:px-5" : "flex-none px-6"
              } flex items-center justify-center gap-2 bg-white text-black dark:bg-dark-bg dark:text-white py-2 rounded-xl border border-black/20 dark:border-white/20 font-bold text-sm shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(255,255,255,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all`}>
              <Icon icon="mdi:file-download-outline" className="w-4 h-4 md:w-5 md:h-5" />
              <span>View Resume</span>
            </a>
          </div>

          <hr className="hero-content w-full border-t border-black/20 dark:border-white/20" />

          <div className="hero-content flex flex-col md:flex-row items-start md:items-center gap-2 text-xs font-bold">
            <span className="whitespace-nowrap">Find me on:</span>
            <div className="flex flex-wrap gap-2">
              {profile.social_media?.map((social: any, index) => (
                <a
                  key={`${index}-${social.name}`}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 border border-black/20 dark:border-white/20 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 hover:shadow-sm transition-all duration-200"
                  title={social.name}>
                  <Icon icon={social.icon} className="w-4 h-4 text-black dark:text-white" />
                </a>
              ))}
            </div>
          </div>

          <div className="hero-content mt-4 w-full flex justify-start">
            <LeaveMark />
          </div>
        </div>

        {/* Right Content - Profile Image */}
        {heroPhotos.length > 0 && (
          <div className="w-full md:w-5/12 flex justify-center md:justify-end hero-image">
            <div className="relative inline-block w-[400px] md:w-[300px] -mt-18 md:-mt-32">
              <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-full scale-90 blur-3xl -z-10 opacity-50"></div>

              {/* Decorations Container */}
              <div
                className={`absolute inset-0 z-20 pointer-events-none transition-all duration-300 ${isAnimating ? "blur-md opacity-50" : "blur-0 opacity-100"}`}>
                {currentDecorations.static.map((deco, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`static-${currentIndex}-${idx}`}
                    src={deco.src}
                    alt="decoration"
                    className={`absolute ${deco.position} ${deco.size} transition-all duration-300 ease-out ${isHovered ? deco.hoverEffect || "" : ""}`}
                  />
                ))}
                {currentDecorations.hoverOnly.map((deco, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={`hover-${currentIndex}-${idx}`}
                    src={deco.src}
                    alt="decoration hover"
                    className={`absolute ${deco.position} ${deco.size} transition-all duration-300 ease-out ${deco.delay || ""} ${showDecorations ? "opacity-100 translate-x-0 translate-y-0 scale-100 " + (deco.animation || "") : "opacity-0 " + (deco.slideFrom || "scale-50")}`}
                  />
                ))}
              </div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                loading="lazy"
                src={heroPhotos[currentIndex]}
                alt={profile.about.name}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
                className={`w-full h-full object-cover border-b border-black/20 dark:border-white/20 transition-all duration-300 ${
                  isHovered ? "scale-105" : "scale-100"
                } ${isAnimating ? "blur-md opacity-50" : "blur-0 opacity-100"}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
