"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import hljs from "highlight.js";
import "highlight.js/styles/night-owl.css";
import { Blog } from "@/types";

interface SingleBlogClientProps {
  initialBlog: Blog;
}

const BlogContent = React.memo(
  ({
    content,
    onTocExtracted,
    onImageClick,
  }: {
    content: string;
    onTocExtracted: (toc: { id: string; text: string; level: string }[]) => void;
    onImageClick: (url: string) => void;
  }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!contentRef.current) return;

      // 1. Extract ToC and apply IDs
      const headings = contentRef.current.querySelectorAll("h2, h3");
      const extractedToc: { id: string; text: string; level: string }[] = [];

      headings.forEach((el, index) => {
        let id = el.id;
        if (!id) {
          id = el.textContent
            ? el.textContent
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^\w-]/g, "")
            : `heading-${index}`;
          if (!id) id = `heading-${index}`;
          el.id = id;
        }
        extractedToc.push({
          id,
          text: el.textContent || "",
          level: el.tagName.toLowerCase(),
        });
      });
      onTocExtracted(extractedToc);

      // 2. Highlight code blocks
      // Using a tiny timeout to ensure DOM is painted before highlighting
      const t = setTimeout(() => {
        if (contentRef.current) {
          const codeBlocks = contentRef.current.querySelectorAll("pre code");
          codeBlocks.forEach((block) => {
            block.removeAttribute("data-highlighted");
            hljs.highlightElement(block as HTMLElement);
          });
        }
      }, 10);

      // 3. Image click handler
      const images = contentRef.current.querySelectorAll("img");
      const handleImageClick = (e: Event) => {
        onImageClick((e.target as HTMLImageElement).src);
      };
      images.forEach((img) => {
        img.addEventListener("click", handleImageClick);
      });

      return () => {
        clearTimeout(t);
        images.forEach((img) => {
          img.removeEventListener("click", handleImageClick);
        });
      };
    }, [content, onTocExtracted, onImageClick]);

    return (
      <div
        ref={contentRef}
        suppressHydrationWarning={true}
        className="prose prose-neutral dark:prose-invert prose-lg max-w-none font-[Inter] prose-headings:font-black prose-headings:text-black dark:prose-headings:text-white prose-img:rounded-lg"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  },
);

BlogContent.displayName = "BlogContent";

export default function SingleBlogClient({ initialBlog }: SingleBlogClientProps) {
  const [blog] = useState<Blog>(initialBlog);
  const [currentLang, setCurrentLang] = useState("id");
  const [toc, setToc] = useState<{ id: string; text: string; level: string }[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem("blogLang");
    if (savedLang) {
      setCurrentLang(savedLang);
    }
    NProgress.done();
  }, []);

  const openModal = (url: string) => setSelectedImage(url);
  const closeModal = () => setSelectedImage(null);

  const onMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowToc(true);
  };

  const onMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowToc(false);
    }, 150);
  };

  const scrollToHeading = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="pt-20 pb-20 min-h-screen bg-white dark:bg-black text-neutral-800 dark:text-neutral-300 font-[Inter]">
      <style>{`
        .prose p:empty::before { content: "\\00a0"; display: inline-block; }
        .prose p { color: #52525b !important; }
        .dark .prose p { color: #a1a1aa !important; }
        .prose a { font-weight: 600 !important; color: #000000 !important; text-decoration: underline !important; text-decoration-color: #d4d4d8 !important; text-underline-offset: 2px !important; transition: all 0.2s ease-in-out; }
        .dark .prose a { color: #e5e5e5 !important; text-decoration-color: #3f3f46 !important; }
        .prose a:hover { text-decoration-color: #171717 !important; }
        .dark .prose a:hover { text-decoration-color: #e5e5e5 !important; }
        .prose img { display: block; margin: 1.5em auto; max-width: 100%; height: auto; cursor: pointer; }
        .prose h2, .prose h3 { position: relative; }
        .prose h2::before, .prose h3::before { content: "#"; position: absolute; left: -1em; opacity: 0; color: #a3a3a3; transition: opacity 0.2s ease-in-out; }
        .prose h2:hover::before, .prose h3:hover::before { opacity: 1; }
        .prose ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .prose ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        .prose li { margin-bottom: 0.5em; }
      `}</style>

      {/* Desktop ToC Sidebar */}
      <div
        className={`hidden lg:block fixed left-0 top-0 w-[calc(50%-24rem)] h-full z-40 pointer-events-auto transition-all duration-300 ease-in-out ${
          showToc ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
        }`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}>
        <div className="absolute left-0 top-34 pl-7 xl:pl-10 mt-32">
          <ul className="flex flex-col gap-3 text-sm border-l-2 border-neutral-200 dark:border-neutral-800 pl-4 w-48 xl:w-64 select-none">
            {toc.map((item, index) => (
              <li key={`${index}-${item.id}`} className={`w-fit ${item.level === "h3" ? "ml-4 text-xs" : ""}`}>
                <span
                  onClick={(e) => scrollToHeading(e, item.id)}
                  className="cursor-pointer border-b border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all leading-snug">
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <article onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="relative mt-8">
          {/* Header */}
          <header className="mb-12">
            <h1 className="text-3xl md:text-5xl font-medium leading-none mb-3 text-black dark:text-white">
              {currentLang === "en" ? blog.title_en || blog.title : blog.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 dark:text-neutral-500">
              <span>
                {new Date(blog.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>•</span>
              <span>{blog.read_time} min</span>
            </div>
          </header>

          {/* Content (Tiptap HTML) */}
          <BlogContent
            content={currentLang === "en" ? blog.content_en || blog.content : blog.content}
            onTocExtracted={setToc}
            onImageClick={setSelectedImage}
          />

          {/* Back Button at bottom */}
          <Link
            href="/blogs"
            className="group cursor-pointer mt-16 font-medium text-neutral-500 flex items-center gap-2 w-fit">
            <span className="font-mono">{">"}</span>
            <span className="border-b border-neutral-300 dark:border-neutral-700 group-hover:border-black dark:group-hover:border-white group-hover:text-black dark:group-hover:text-white transition-all pb-[1px]">
              cd . .
            </span>
          </Link>
        </article>
      </div>

      {/* Modal Image Zoom */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeModal}>
          <img src={selectedImage} className="w-full h-full object-contain" alt="Enlarged Blog Image" />
        </div>
      )}
    </div>
  );
}
