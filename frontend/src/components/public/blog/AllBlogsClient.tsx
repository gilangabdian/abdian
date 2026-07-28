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

    return sortedKeys.map((year) => ({
      year,
      blogs: groups[year],
    }));
  }, [blogs]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    return `${month.toLowerCase()} ${day}`;
  };

  return (
    <div className="pt-24 md:pt-40 pb-16 min-h-screen flex flex-col items-center font-[Inter]">
      <style>{`
        .year-watermark {
          color: transparent;
          -webkit-text-stroke: 1px rgba(0, 0, 0, 0.1);
          background-image: repeating-linear-gradient(45deg, rgba(0, 0, 0, 0.04) 0px, rgba(0, 0, 0, 0.04) 2px, transparent 2px, transparent 8px);
          -webkit-background-clip: text;
          background-clip: text;
        }
        .dark .year-watermark {
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
          background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.06) 0px, rgba(255, 255, 255, 0.06) 2px, transparent 2px, transparent 8px);
        }
      `}</style>

      <div className="w-full max-w-3xl px-4 md:px-8">
        {blogs.length === 0 && <div className="text-center text-neutral-500 py-12">no article yet!</div>}

        {blogs.length > 0 && (
          <div className="w-full flex flex-col gap-24 relative">
            {/* Language Toggle */}
            <div className="absolute -top-10 left-2 md:left-8 flex items-center justify-start z-20">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-black/30 dark:text-white/30">
                <input
                  type="checkbox"
                  checked={currentLang === "en"}
                  onChange={updateLang}
                  className="w-[13px] h-[13px] cursor-pointer appearance-none border-[1.4px] border-black/30 dark:border-white/30 rounded-[1px] bg-transparent flex items-center justify-center checked:before:content-[''] checked:before:w-[4px] checked:before:h-[6.5px] checked:before:border-r-[1.4px] checked:before:border-b-[1.4px] checked:before:border-black/30 dark:checked:before:border-white/30 checked:before:rotate-45 checked:before:-mt-[1px]"
                />
                <span>Read in English</span>
              </label>
            </div>

            {groupedBlogs.map((group) => (
              <div key={group.year} className="relative w-full mt-10 md:mt-16">
                {/* Background Year (Hollow Text) */}
                <div className="absolute top-0 -left-2 md:-left-4 -translate-y-6 md:-translate-y-15 text-[7rem] md:text-[8rem] font-black select-none z-0 leading-none pointer-events-none year-watermark">
                  {group.year}
                </div>

                {/* Articles List */}
                <div className="relative z-10 w-full flex flex-col items-start px-2 pt-6 md:pt-0 md:px-8">
                  {group.blogs.map((blog) => {
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
                        className="blog-row cursor-pointer group flex flex-col sm:flex-row justify-start items-start sm:items-center w-full py-2 transition-colors gap-3 md:gap-4">
                        <h2 className="text-lg md:text-xl font-small text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors leading-tight flex items-center gap-[2px]">
                          {currentLang === "en" ? blog.title_en || blog.title : blog.title}
                          {isExternal && (
                            <Icon
                              icon="carbon:arrow-up-right"
                              className="w-3 h-4 -mt-1 opacity-50 transition-opacity"
                            />
                          )}
                        </h2>

                        <div className="flex items-center gap-2 mt-1 sm:mt-0 text-sm text-neutral-400 dark:text-neutral-500 whitespace-nowrap group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors">
                          <span>{formatDate(blog.created_at)}</span>
                          {!isExternal && <span className="text-[10px]">•</span>}
                          {!isExternal && <span>{blog.read_time} min</span>}
                        </div>
                      </LinkComponent>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
