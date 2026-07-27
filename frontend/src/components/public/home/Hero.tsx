"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Profile } from "@/types";
import { Icon } from "@iconify/react";
import LeaveMark from "./LeaveMark";

gsap.registerPlugin(useGSAP);

interface HeroProps {
  profile?: Profile | null;
}

export default function Hero({ profile }: HeroProps) {
  const [displayedJob, setDisplayedJob] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);

  // Typewriter Effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    // Blinking cursor
    intervalId = setInterval(() => {
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
      <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-4xl gap-8 md:gap-2 mt-8">
        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start space-y-3 md:space-y-3 mt-4">
          {profile.about.is_available_for_work && (
            <div className="hero-badge inline-block bg-[#f8f8f8] dark:bg-white/5 border border-black/20 dark:border-white/10 px-3 py-1 rounded-lg shadow-sm transform -rotate-1 origin-bottom-left">
              <h5 className="font-bold text-[10px] md:text-xs tracking-wide uppercase">Available for Work</h5>
            </div>
          )}

          <div className="space-y-0.5">
            <h1 className="hero-text text-4xl md:text-5xl font-bold leading-tight font-[Inter] tracking-tight">
              Hi, I&apos;m <br className="hidden md:block" />
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
        <div className="w-full md:w-5/12 flex justify-center md:justify-end relative hero-image">
          <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-full scale-90 blur-3xl -z-10 opacity-50"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            loading="lazy"
            src={profile.about.photo_url}
            alt={profile.about.name}
            className="w-[400px] md:w-[300px] -mt-32 md:mt-0 h-auto object-cover contrast-110 border-b border-black/20 dark:border-white/20"
          />
        </div>
      </div>
    </div>
  );
}
