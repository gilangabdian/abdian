"use client";

import React, { useMemo, useRef } from "react";
import { Icon } from "@iconify/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { marked } from "marked";
import { Experience as ExperienceType } from "@/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ExperienceProps {
  experiences: ExperienceType[];
}

// Helper Format Tanggal
function formatDate(dateString?: string) {
  if (!dateString) return "PRESENT";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date).toUpperCase();
}

// Helper Durasi (Versi Lebih Akurat)
function getDuration(start?: string, end?: string, isMounted?: boolean) {
  if (!start) return "";
  if (!isMounted) return ""; // Avoid hydration mismatch on server
  
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();

  const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  let total = totalMonths + monthDiff;

  if (total < 0) total = 0;

  const years = Math.floor(total / 12);
  const months = total % 12;

  const result = [];
  if (years > 0) result.push(`${years} ${years > 1 ? "yrs" : "yr"}`);
  if (months > 0) result.push(`${months} ${months > 1 ? "mos" : "mo"}`);

  return result.length > 0 ? result.join(" ") : "Less than a month";
}

// Tambahkan helper ini untuk merender markdown secara aman
const renderMarkdown = (text?: string) => {
  if (!text) return "";
  return marked.parse(text, { breaks: true }) as string;
};

export default function Experience({ experiences = [] }: ExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Logic Sort: Terbaru di atas
  const sortedExperiences = useMemo(() => {
    return [...experiences].sort((a, b) => {
      return new Date(b.start_date || "").getTime() - new Date(a.start_date || "").getTime();
    });
  }, [experiences]);

  useGSAP(
    () => {
      // 1. Header Animation (Judul & Deskripsi)
      gsap.fromTo(
        ".journey-header",
        { y: 50, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: "power2.out",
        }
      );

      // 2. The Line Animation (Menggambar garis ke bawah sesuai scroll)
      gsap.fromTo(
        ".journey-line",
        { scaleY: 0 },
        {
          scaleY: 1,
          transformOrigin: "top center",
          ease: "none",
          scrollTrigger: {
            trigger: ".experience-list",
            start: "top 60%",
            end: "bottom 90%",
            scrub: 1,
          },
        }
      );

      // 3. Items Animation (Dot & Content)
      const items = gsap.utils.toArray(".experience-item");

      items.forEach((item: any) => {
        // Animasi Titik (Dot) - Pop up Elastis
        const dot = item.querySelector(".timeline-dot");
        gsap.fromTo(
          dot,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.6,
            ease: "elastic.out(1, 0.5)",
            scrollTrigger: {
              trigger: item,
              start: "top 75%",
              once: true,
            },
          }
        );

        // Animasi Kartu & Tanggal (Fade Up)
        const content = item.querySelectorAll(".experience-content, .experience-date");
        gsap.fromTo(
          content,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 75%",
              once: true,
            },
          }
        );
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-black overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="journey-header inline-block">
            <h2 className="text-4xl font-black text-black dark:text-white mb-6 font-sans tracking-wider inline-block relative border-b border-black/20 dark:border-white/20 pb-2">
              <span className="relative z-10">My Journey</span>
            </h2>
          </div>
          <p className="journey-header mt-4 font-sans text-neutral-700 dark:text-neutral-400 text-sm md:text-base lowercase tracking-tight max-w-xl mx-auto"></p>
        </div>

        <div className="experience-list relative" ref={containerRef}>
          <div className="journey-line absolute left-4 md:left-1/2 top-0 bottom-0 w-[1px] md:-ml-[0.5px] bg-black/20 dark:bg-white/20 z-0 origin-top"></div>

          <div className="relative z-10 mb-12 flex items-center md:justify-center pl-4 md:pl-0">
            <div className="journey-header bg-white dark:bg-neutral-800 text-black dark:text-white font-bold px-4 py-1 uppercase text-sm border border-black/20 dark:border-neutral-600 shadow-sm animate-pulse-slow">
              NOW / FUTURE
            </div>
          </div>

          <div className="space-y-12 md:space-y-0">
            {sortedExperiences.map((exp, index) => (
              <div
                key={exp.id}
                className={`experience-item relative flex flex-col md:flex-row items-start group ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="timeline-dot absolute left-4 md:left-1/2 w-3 h-3 -ml-[5px] md:-ml-[6px] bg-white dark:bg-black border-2 border-black/40 dark:border-white/40 rounded-full z-20 top-8 group-hover:scale-150 group-hover:border-black dark:group-hover:border-white group-hover:bg-black dark:group-hover:bg-white transition-all duration-300"></div>

                <div
                  className={`experience-date hidden md:block w-1/2 px-10 pt-6 text-black dark:text-white ${
                    index % 2 === 0 ? "text-left" : "text-right"
                  }`}
                >
                  <div className="font-black text-2xl uppercase italic">{formatDate(exp.start_date)}</div>
                  <div className="font-mono text-neutral-500 dark:text-neutral-400 font-bold text-sm">
                    {exp.end_date ? formatDate(exp.end_date) : "PRESENT"}
                  </div>
                  <div className="mt-2 inline-block bg-neutral-50 dark:bg-neutral-800/50 border border-black/10 dark:border-white/10 px-2 py-0.5 text-xs font-bold font-mono">
                    {getDuration(exp.start_date, exp.end_date, mounted)}
                  </div>
                </div>

                <div className="w-full md:w-1/2 pl-12 md:pl-0 pr-0 md:px-10">
                  <div className="experience-content relative bg-white dark:bg-neutral-800 border border-black/10 dark:border-neutral-600 p-6 shadow-md dark:shadow-[0_4px_20px_rgba(255,255,255,0.05)] group-hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:group-hover:shadow-[0_8px_30px_rgba(255,255,255,0.1)] group-hover:border-black/20 dark:group-hover:border-neutral-400 group-hover:-translate-y-1 transition-all duration-300 text-black dark:text-white">
                    <div className="md:hidden mb-4 border-b border-dashed border-neutral-200 dark:border-neutral-700 pb-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="bg-black text-white dark:bg-white dark:text-black text-xs font-bold px-2 py-1 uppercase">
                          {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : "NOW"}
                        </span>
                      </div>
                      <span className="inline-block bg-[#E7E7E7] dark:bg-neutral-800 border border-black dark:border-white/20 px-2 py-0.5 text-[10px] font-bold font-mono dark:text-neutral-300">
                        {getDuration(exp.start_date, exp.end_date, mounted)}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-black uppercase leading-tight mb-2">{exp.role}</h3>

                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-black dark:text-white font-bold flex items-center gap-1.5 border-b border-transparent hover:border-black/40 dark:hover:border-white/40 transition-colors">
                        <iconify-icon                          icon={exp.status === "Education" ? "lucide:graduation-cap" : "lucide:building-2"}
                          className="w-4 h-4"
                        />
                        {exp.company_name}
                      </span>

                      <span className="text-[10px] font-black font-mono border border-black/10 dark:border-white/10 px-2 py-0.5 bg-neutral-50 dark:bg-neutral-800 uppercase text-neutral-600 dark:text-neutral-400">
                        {exp.status}
                      </span>
                    </div>

                    {exp.location && (
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 uppercase mb-4">
                        <iconify-icon icon="lucide:map-pin" className="text-black dark:text-white w-3.5 h-3.5" />
                        {exp.location}
                      </div>
                    )}

                    <div
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(exp.description) }}
                      className="markdown-content font-mono text-sm leading-relaxed text-neutral-700 dark:text-neutral-300 mb-6"
                    />

                    {!exp.end_date && (
                      <div className="absolute -top-3 -right-3 rotate-3">
                        <span className="bg-neutral-50 dark:bg-neutral-800 border border-black/10 dark:border-white/10 px-3 py-1 text-xs font-black uppercase shadow-sm">
                          {exp.status === "Education" ? "Ongoing" : "Current"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative z-10 mt-12 flex items-center md:justify-center pl-4 md:pl-0">
            <div className="journey-header bg-white dark:bg-neutral-800 text-black dark:text-white font-black px-4 py-2 uppercase text-sm border border-black/20 dark:border-neutral-600 flex items-center gap-2 shadow-sm hover:shadow-md transition-shadow">
              <iconify-icon icon="lucide:flag" />
              START JOURNEY
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
