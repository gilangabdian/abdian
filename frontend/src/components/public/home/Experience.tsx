"use client";

import React, { useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { marked } from "marked";
import { Experience as ExperienceType } from "@/types";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface ExperienceProps {
  experiences: ExperienceType[];
}

function formatDate(dateString?: string) {
  if (!dateString) return "Present";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(date);
}

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

const renderMarkdown = (text?: string) => {
  if (!text) return "";
  return marked.parse(text, { breaks: true }) as string;
};

export default function Experience({ experiences = [] }: ExperienceProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const sortedExperiences = useMemo(() => {
    return [...experiences].sort((a, b) => {
      return new Date(b.start_date || "").getTime() - new Date(a.start_date || "").getTime();
    });
  }, [experiences]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".journey-header",
        { y: 30, opacity: 0 },
        {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            once: true,
          },
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
        },
      );

      const items = gsap.utils.toArray(".experience-item");
      items.forEach((item: any) => {
        gsap.fromTo(
          item,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: item,
              start: "top 85%",
              once: true,
            },
          },
        );
      });
    },
    { scope: sectionRef },
  );

  return (
    <section ref={sectionRef} className="py-20 bg-white dark:bg-black overflow-hidden relative z-0">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="mb-14 journey-header text-left">
          <h2 className="text-3xl md:text-4xl text-black font-bold dark:text-white tracking-tight">Work Experience</h2>
        </div>

        <div className="space-y-12 md:space-y-14">
          {sortedExperiences.map((exp) => (
            <div key={exp.id} className="experience-item flex flex-col group relative">
              <div className="mb-1">
                <h3 className="text-xl md:text-2xl leading-snug">
                  <span className="text-black font-semibold dark:text-white mr-2">{exp.company_name}</span>
                  <span className="block md:inline font-normal text-neutral-500 dark:text-neutral-400 text-base md:text-lg mt-1 md:mt-0">
                    {exp.role}
                  </span>
                </h3>
              </div>

              <div className="flex flex-wrap items-center text-[13px] text-neutral-500 dark:text-neutral-400 mb-2 gap-x-2 gap-y-1 font-normal">
                <span>
                  {formatDate(exp.start_date)} — {exp.end_date ? formatDate(exp.end_date) : "Present"}
                  <span className="ml-1">({getDuration(exp.start_date, exp.end_date, mounted)})</span>
                </span>

                {(exp.location || exp.status) && (
                  <span className="text-neutral-300 dark:text-neutral-600 hidden md:inline">|</span>
                )}

                <span className="flex items-center gap-1">
                  {exp.location && <span>{exp.location}</span>}
                  {exp.status && <span className="opacity-80">({exp.status})</span>}
                </span>
              </div>

              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdown(exp.description) }}
                className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300 prose-p:my-2 prose-ul:my-2 prose-li:my-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
