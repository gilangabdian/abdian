"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { motion, Variants } from "motion/react";

import { Profile } from "@/types";

interface HeroProps {
  profile?: Profile | null;
}

export default function Hero({ profile }: HeroProps) {
  const [displayedJob, setDisplayedJob] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

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
    const jobTitleText = profile?.about?.job_title || "";
    if (!jobTitleText) return;

    let i = 0;
    setDisplayedJob("");

    const startTypewriter = () => {
      const typeChar = () => {
        if (i < jobTitleText.length) {
          setDisplayedJob((prev) => prev + jobTitleText.charAt(i));
          i++;
          setTimeout(typeChar, 100);
        }
      };
      typeChar();
    };

    // Start after 1s (matching GSAP delay)
    const timeoutId = setTimeout(startTypewriter, 1000);

    return () => clearTimeout(timeoutId);
  }, [profile?.about?.job_title]);

  if (!profile || !profile.about) {
    return null;
  }

  // Animation variants
  const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0, rotate: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: -1,
      transition: { duration: 0.6, type: "spring", bounce: 0.5 },
    },
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const imageVariants: Variants = {
    hidden: { opacity: 0, y: 100, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 1.2, type: "spring", bounce: 0.4 },
    },
  };

  return (
    <div className="container mx-auto px-6 pt-26 pb-6 md:pt-8 md:pb-0 min-h-screen flex items-center justify-center overflow-hidden">
      <div className="flex flex-col-reverse md:flex-row items-center justify-between w-full max-w-4xl gap-8 md:gap-2 mt-8">
        {/* Left Content */}
        <div className="flex-1 flex flex-col items-start space-y-3 md:space-y-3 mt-4">
          {profile.about.is_available_for_work && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={badgeVariants}
              className="inline-block bg-[#f8f8f8] dark:bg-white/5 border border-black/20 dark:border-white/10 px-3 py-1 rounded-lg shadow-sm origin-bottom-left">
              <h5 className="font-bold text-[10px] md:text-xs tracking-wide uppercase">Available for Work</h5>
            </motion.div>
          )}

          <div className="space-y-0.5">
            <motion.h1 
              initial="hidden" animate="visible" variants={textVariants} transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-bold leading-tight font-[Inter] tracking-tight"
            >
              Hi, I&apos;m
              <br className="hidden md:block" />
              <span className="underline decoration-4 underline-offset-4 decoration-black dark:decoration-white">
                {profile.about.name}
              </span>
            </motion.h1>

            <motion.h2
              initial="hidden"
              animate="visible"
              variants={textVariants}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl lg:text-3xl font-[Playfair_Display] italic text-gray-800 dark:text-gray-200 pt-1 min-h-[1.5em] flex items-center">
              <span>{displayedJob}</span>
              <span
                className={`inline-block w-[2px] h-[24px] md:h-[32px] bg-black dark:bg-white ml-1 align-middle transition-opacity duration-100 ${
                  cursorVisible ? "opacity-100" : "opacity-0"
                }`}></span>
            </motion.h2>
          </div>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={contentVariants}
            transition={{ delay: 0.8 }}
            className="text-sm text-justify leading-relaxed max-w-lg font-[Inter] text-gray-700 dark:text-gray-300">
            {profile.about.about_description}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={contentVariants}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-2 font-medium text-xs">
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
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={contentVariants}
            transition={{ delay: 1.0 }}
            className="flex gap-3 pt-1 w-full md:w-auto">
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
              } flex items-center justify-center gap-2 bg-white text-black dark:bg-[#121212] dark:text-white py-2 rounded-xl border border-black/20 dark:border-white/20 font-bold text-sm shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] dark:shadow-[0_4px_14px_0_rgba(255,255,255,0.05)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] hover:bg-gray-50 dark:hover:bg-white/5 active:scale-95 transition-all`}>
              <Icon icon="mdi:file-download-outline" className="w-4 h-4 md:w-5 md:h-5" />
              <span>Download CV</span>
            </a>
          </motion.div>

          <motion.hr
            initial="hidden"
            animate="visible"
            variants={contentVariants}
            transition={{ delay: 1.1 }}
            className="w-full border-t border-black/20 dark:border-white/20"
          />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={contentVariants}
            transition={{ delay: 1.2 }}
            className="flex flex-col md:flex-row items-start md:items-center gap-2 text-xs font-bold">
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
          </motion.div>
        </div>

        {/* Right Content - Profile Image */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={imageVariants}
          transition={{ delay: 0.4 }}
          className="w-full md:w-5/12 flex justify-center md:justify-end relative">
          <div className="absolute inset-0 bg-gray-100 dark:bg-white/5 rounded-full scale-90 blur-3xl -z-10 opacity-50"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            loading="lazy"
            src={profile.about.photo_url}
            alt={profile.about.name}
            className="w-[400px] md:w-[300px] -mt-32 md:mt-0 h-auto object-cover contrast-110 border-b border-black/20 dark:border-white/20"
          />
        </motion.div>
      </div>
    </div>
  );
}
