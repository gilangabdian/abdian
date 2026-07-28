"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import hljs from "highlight.js";
import "highlight.js/styles/night-owl.css";
import { Blog } from "@/types";
import TableOfContents from "@/components/global/TableOfContents";
import { injectHeadingIds } from "@/lib/heading-utils";

interface SingleBlogClientProps {
  initialBlog: Blog;
  initialLang: string;
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

    // Pre-process HTML: inject heading IDs and extract ToC synchronously
    // IDs are embedded in the HTML string BEFORE render, avoiding race conditions
    // with React.memo caching and Turbopack's useEffect timing.
    const { processedHtml, toc } = injectHeadingIds(content);

    // Effect 1: Report ToC from pre-computed data (no DOM dependency)
    useEffect(() => {
      onTocExtracted(toc);
    }, [toc, onTocExtracted]);

    // Effect 2: Highlight code blocks and image click handlers
    useEffect(() => {
      if (!contentRef.current) return;

      // Highlight code blocks
      const t = setTimeout(() => {
        if (contentRef.current) {
          const codeBlocks = contentRef.current.querySelectorAll("pre code");
          codeBlocks.forEach((block) => {
            block.removeAttribute("data-highlighted");
            hljs.highlightElement(block as HTMLElement);
          });
        }
      }, 10);

      // Image click handler
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
    }, [content, onImageClick]);

    return (
      <div
        ref={contentRef}
        suppressHydrationWarning={true}
        className="prose prose-neutral dark:prose-invert prose-lg max-w-none font-[Inter] prose-headings:font-black prose-headings:text-black dark:prose-headings:text-white prose-img:rounded-lg [&_div.callout]:flex [&_div.callout]:my-6 [&_div.callout]:items-start [&_div.callout]:border-l-0 [&_div.callout]:border-neutral-300 [&_div.callout]:dark:border-neutral-700 [&_div.callout]:relative [&_div.callout]:pl-6 [&_div.callout]:py-1 [&_div.callout]:text-sm [&_div.callout]:md:text-base [&_div.callout]:text-neutral-400 [&_div.callout]:dark:text-neutral-500 [&_div.callout]:not-italic"
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    );
  },
);

BlogContent.displayName = "BlogContent";

export default function SingleBlogClient({ initialBlog, initialLang }: SingleBlogClientProps) {
  const [blog] = useState<Blog>(initialBlog);
  const [currentLang, setCurrentLang] = useState(initialLang);
  const [toc, setToc] = useState<{ id: string; text: string; level: string }[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    NProgress.done();
  }, []);

  // Sync language preference from localStorage (set by AllBlogsClient toggle)
  // Overrides the server-provided initialLang with the actual user preference
  useEffect(() => {
    const savedLang = localStorage.getItem("blogLang");
    if (savedLang) {
      setCurrentLang(savedLang);
    }
  }, []);

  // On mount, check if cursor is already over the content area
  // (happens when navigating directly to a blog post — cursor is already inside the article)
  useEffect(() => {
    if (articleRef.current && articleRef.current.matches(":hover")) {
      setShowToc(true);
    }
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
      div.callout {
          position: relative !important;
        }
        div.callout::before {
          content: '';
          position: absolute;
          left: 0;
          top:1.5em;
          bottom: 1.5em;
          width: 4px;
          background: #d4d4d8;
          border-radius: 2px;
        }
        .dark div.callout::before {
          background: #404040;
        }
        /* Links: underline only on hover */
        .prose a {
          text-decoration: none !important;
        }
        .prose a:hover {
          text-decoration: underline !important;
          text-decoration-color: inherit !important;
        }
        .prose p:empty::before { content: "\\00a0"; display: inline-block; }
        .prose p { color: #52525b !important; font-size: 16px; line-height: 28px }
        .dark .prose p { color: #a1a1aa !important; }
        .prose a { font-weight: 600 !important; color: #000000 !important; text-decoration: underline !important; text-decoration-color: #d4d4d8 !important; text-underline-offset: 2px !important; transition: all 0.2s ease-in-out; }
        .dark .prose a { color: #e5e5e5 !important; text-decoration-color: #3f3f46 !important; }
        .prose a:hover { text-decoration-color: #171717 !important; }
        .dark .prose a:hover { text-decoration-color: #e5e5e5 !important; }
        .prose img { display: block; margin: 1.5em auto; max-width: 100%; height: auto; }
        .prose h2, .prose h3 { position: relative;  font-weight:normal; }
        .prose h2::before, .prose h3::before { content: "#"; position: absolute; left: -1em; opacity: 0; color: #a3a3a3; transition: opacity 0.2s ease-in-out; }
        .prose h2:hover::before, .prose h3:hover::before { opacity: 1; }
        .prose ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .prose ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        .prose li { margin-bottom: 0.5em; }
      `}</style>

      {/* Desktop ToC Sidebar */}
      <TableOfContents
        toc={toc}
        show={showToc}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onScrollToHeading={scrollToHeading}
      />

      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <article ref={articleRef} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="relative mt-8">
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
