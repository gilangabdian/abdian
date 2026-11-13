"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Icon } from "@iconify/react";
import { Blog } from "@/types";

interface AllBlogsClientProps {
  initialBlogs: Blog[];
}

export default function AllBlogsClient({ initialBlogs }: AllBlogsClientProps) {
  const [blogs] = useState<Blog[]>(initialBlogs);
  const [currentLang, setCurrentLang] = useState("id");

  useEffect(() => {
    const savedLang = localStorage.getItem("blogLang");
    if (savedLang) {
      setCurrentLang(savedLang);
    }
    NProgress.done();
  }, []);

  const updateLang = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLang = e.target.checked ? "en" : "id";
    setCurrentLang(newLang);
    localStorage.setItem("blogLang", newLang);
    document.cookie = `blogLang=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
  };

  const groupedBlogs = useMemo(() => {
    const groups: Record<number, Blog[]> = {};
    blogs.forEach((blog) => {
      const year = new Date(blog.created_at).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(blog);
    });

    const sortedKeys = Object.keys(groups)
      .map(Number)
      .sort((a, b) => b - a);

    return sortedKeys.reduce<{
      result: { year: number; blogs: Blog[]; startIndex: number }[];
      currentStagger: number;
    }>(
      (acc, year) => {
        const groupBlogs = groups[year];
        const startIndex = acc.currentStagger;

        acc.result.push({
          year,
          blogs: groupBlogs,
          startIndex,
        });

        acc.currentStagger += 1 + groupBlogs.length;
        return acc;
      },
      { result: [], currentStagger: 0 },
    ).result;
  }, [blogs]);

  const footerStagger = useMemo(() => {
    if (blogs.length === 0) return 3;
    let maxStagger = 2;
    groupedBlogs.forEach((group) => {
      const lastItemStagger = group.startIndex + 2 + group.blogs.length;
      if (lastItemStagger > maxStagger) {
        maxStagger = lastItemStagger;
      }
    });
    return maxStagger + 1;
  }, [blogs.length, groupedBlogs]);

  useEffect(() => {
    const footerEl = document.getElementById("public-footer");
    if (footerEl) {
      footerEl.setAttribute("data-animate", "true");
      (footerEl as HTMLElement).style.setProperty("--stagger", String(footerStagger));
    }
  }, [footerStagger]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <section className="min-h-screen flex justify-center px-6 font-sans text-black dark:text-white -mt-8 md:-mt-2 pt-16 md:pt-24 pb-20">
      <div className="container max-w-[560px] w-full flex flex-col mx-auto mt-4 md:mt-10">
        {/* Header - Ketinggian vertikal persis sama dengan nama di Home (/) */}
        <header className="mb-8 md:mb-12 flex items-center justify-between">
          <h1
            data-animate
            style={{ "--stagger": 0 } as React.CSSProperties}
            className="text-[24px] font-normal leading-snug tracking-tight text-black dark:text-white"
          >
            Blog
          </h1>

          <label
            data-animate
            style={{ "--stagger": 1 } as React.CSSProperties}
            className="flex items-center gap-2 cursor-pointer text-xs text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <input
              type="checkbox"
              checked={currentLang === "en"}
              onChange={updateLang}
              className="w-3 h-3 cursor-pointer appearance-none border border-neutral-400 dark:border-neutral-600 rounded-[2px] bg-transparent flex items-center justify-center checked:before:content-[''] checked:before:w-[3px] checked:before:h-[5.5px] checked:before:border-r-[1.4px] checked:before:border-b-[1.4px] checked:before:border-black dark:checked:before:border-white checked:before:rotate-45 checked:before:-mt-[1px]"
            />
            <span>Read in English</span>
          </label>
        </header>

        {blogs.length === 0 ? (
          <div className="text-center text-neutral-400 dark:text-neutral-500 py-16 text-xs">
            no articles yet.
          </div>
        ) : (
          <div className="space-y-12 md:space-y-14">
            {groupedBlogs.map((group) => (
              <section key={group.year} className="flex gap-4 sm:gap-8 items-start">
                {/* Sisi Kiri: Tahun (14px / text-sm) */}
                <div className="w-14 sm:w-16 shrink-0 pt-1.5">
                  <h2
                    data-animate
                    style={{ "--stagger": group.startIndex + 2 } as React.CSSProperties}
                    className="text-sm font-normal text-neutral-400 dark:text-neutral-500 select-none"
                  >
                    {group.year}
                  </h2>
                </div>

                {/* Sisi Kanan: Daftar Artikel (Title di atas, Bulan Tanggal • Menit di bawah) */}
                <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                  {group.blogs.map((blog, index) => {
                    const isExternal = blog.is_external;
                    const href = isExternal ? blog.external_url || "#" : `/blogs/${blog.slug}`;
                    const target = isExternal ? "_blank" : undefined;
                    const rel = isExternal ? "noopener noreferrer" : undefined;
                    const LinkComponent = isExternal ? "a" : Link;

                    return (
                      <LinkComponent
                        key={blog.id}
                        href={href}
                        target={target}
                        rel={rel}
                        data-animate
                        style={{ "--stagger": group.startIndex + 3 + index } as React.CSSProperties}
                        className="group block -mx-2 px-2 py-1.5 rounded-md hover:bg-neutral-100/60 dark:hover:bg-neutral-800/30 transition-colors"
                      >
                        {/* Title Blog */}
                        <div className="text-[15px] sm:text-[16px] font-normal text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors leading-snug flex items-center gap-1.5">
                          <span>{currentLang === "en" ? blog.title_en || blog.title : blog.title}</span>
                          {isExternal && (
                            <Icon
                              icon="carbon:arrow-up-right"
                              className="w-3.5 h-3.5 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                            />
                          )}
                        </div>

                        {/* Di bawah title: Bulan Tanggal • {menit} min */}
                        <div className="mt-1 flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                          <span>{formatDate(blog.created_at)}</span>
                          {!isExternal && blog.read_time ? (
                            <>
                              <span className="text-[8px]">•</span>
                              <span>{blog.read_time} min</span>
                            </>
                          ) : null}
                        </div>
                      </LinkComponent>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
