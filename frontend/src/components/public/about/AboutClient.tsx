"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Profile } from "@/types";
import Image from "next/image";
import TableOfContents from "@/components/global/TableOfContents";
import { injectHeadingIds } from "@/lib/heading-utils";
import { formatGithubLinks } from "@/lib/github-link-formatter";

interface AboutClientProps {
  initialProfile: Profile | null;
  aboutContent: string | null;
  aboutUpdatedAt: string | null;
}

/**
 * Given an HTML string, inject a "Last updated on..." <span>
 * immediately after the very first <h2> (or any heading) element.
 * If no heading is found, prepend the date at the start.
 */
function injectDateAfterFirstH2(html: string, formattedDate: string): string {
  if (!html) return html;

  const dateHtml = `<span class="block text-sm md:text-base text-neutral-500 dark:text-neutral-500 -mt-4 mb-4">Last updated on ${formattedDate}</span>`;

  // Find the first closing heading tag (h1-h3) and inject date after it
  const headingMatch = html.match(/<\/(h[1-3])>/i);
  if (headingMatch && headingMatch.index !== undefined) {
    const closeTagEnd = headingMatch.index + headingMatch[0].length;
    return html.slice(0, closeTagEnd) + dateHtml + html.slice(closeTagEnd);
  }

  // Fallback: prepend date
  return dateHtml + html;
}

// Separate React.memo component for dynamic content (same pattern as BlogContent in SingleBlogClient.tsx)
// Uses injectHeadingIds to pre-compute heading IDs + ToC at HTML string level (not DOM-dependent).
const AboutContent = React.memo(
  ({
    aboutContent,
    aboutUpdatedAt,
    onTocExtracted,
    onImageClick,
  }: {
    aboutContent: string;
    aboutUpdatedAt: string | null;
    onTocExtracted: (toc: { id: string; text: string; level: string }[]) => void;
    onImageClick: (url: string) => void;
  }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    const formattedDate = aboutUpdatedAt
      ? new Date(aboutUpdatedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "July 27, 2026";

    // 1. Inject "Last updated on..." after first heading
    const htmlWithDate = injectDateAfterFirstH2(aboutContent || "", formattedDate);

    // 2. Pre-process HTML: inject heading IDs and extract ToC synchronously
    //    IDs are embedded in the HTML string BEFORE render, avoiding race conditions
    //    with React.memo caching and Turbopack's useEffect timing.
    const { processedHtml, toc } = injectHeadingIds(htmlWithDate);

    // Effect 1: Report ToC from pre-computed data (no DOM dependency)
    useEffect(() => {
      onTocExtracted(toc);
    }, [toc, onTocExtracted]);

    // Effect 2: Image click handlers and format GitHub links (requires DOM)
    useEffect(() => {
      if (!contentRef.current) return;

      // Format GitHub links
      formatGithubLinks(contentRef.current);

      const images = contentRef.current.querySelectorAll("img");
      const handleImageClick = (e: Event) => {
        onImageClick((e.target as HTMLImageElement).src);
      };
      images.forEach((img) => {
        img.addEventListener("click", handleImageClick);
      });

      return () => {
        images.forEach((img) => {
          img.removeEventListener("click", handleImageClick);
        });
      };
    }, [aboutContent, onImageClick]);

    return (
      <div
        ref={contentRef}
        suppressHydrationWarning={true}
        className="prose prose-neutral dark:text-neutral-300 max-w-none mt-4 text-sm md:text-base leading-relaxed prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-black dark:prose-headings:text-white prose-a:no-underline prose-a:text-black dark:prose-a:text-white hover:prose-a:underline prose-a:decoration-black/20 dark:prose-a:decoration-white/20 hover:prose-a:decoration-black dark:hover:prose-a:decoration-white prose-a:underline-offset-4 prose-a:transition-all prose-a:duration-300 prose-img:rounded-lg prose-img:my-4 prose-pre:bg-neutral-900 prose-pre:text-neutral-100 prose-code:text-neutral-800 dark:prose-code:text-neutral-200 prose-blockquote:border-l-4 prose-blockquote:border-neutral-300 dark:prose-blockquote:border-neutral-700 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:text-neutral-400 dark:prose-blockquote:text-neutral-500 prose-blockquote:not-italic prose-blockquote:my-6 [&_div.callout]:flex [&_div.callout]:my-6 [&_div.callout]:items-start [&_div.callout]:border-l-0 [&_div.callout]:border-neutral-300 [&_div.callout]:dark:border-neutral-700 [&_div.callout]:relative [&_div.callout]:pl-6 [&_div.callout]:py-1 [&_div.callout]:text-sm [&_div.callout]:md:text-base [&_div.callout]:text-neutral-400 [&_div.callout]:dark:text-neutral-500 [&_div.callout]:not-italic [&_p:empty]:min-h-[1.5em] [&_p:empty]:block"
        dangerouslySetInnerHTML={{
          __html: processedHtml,
        }}
      />
    );
  },
);

AboutContent.displayName = "AboutContent";

export default function AboutClient({ initialProfile, aboutContent, aboutUpdatedAt }: AboutClientProps) {
  const [profile] = useState<Profile | null>(initialProfile);
  const [imageZoom, setImageZoom] = useState<string | null>(null);
  const [showToc, setShowToc] = useState(false);
  const [toc, setToc] = useState<{ id: string; text: string; level: string }[]>([]);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowToc(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowToc(false);
    }, 150);
  }, []);

  const scrollToHeading = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    NProgress.done();
  }, []);

  const handleTocExtracted = useCallback((items: { id: string; text: string; level: string }[]) => {
    setToc(items);
  }, []);

  const handleImageClick = useCallback((url: string) => {
    setImageZoom(url);
  }, []);

  return (
    <div className="min-h-screen">
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
      `}</style>

      {/* Image Zoom Modal */}
      {imageZoom && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={() => setImageZoom(null)}>
          <img src={imageZoom} alt="Zoomed content" className="w-full h-full object-contain" />
        </div>
      )}

      {/* ToC Sidebar — Hover reveal, same as blog */}
      <TableOfContents
        toc={toc}
        show={showToc}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onScrollToHeading={scrollToHeading}
      />

      <section className="-mt-12 md:-mt-2 min-h-screen flex justify-center py-24 px-4 sm:px-6 font-sans text-black dark:text-white">
        <div className="container max-w-[650px] w-full flex flex-col space-y-12 mt-10 mx-auto">
          {/* About Section */}
          <div className="flex flex-col space-y-4" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
            {aboutContent ? (
              <AboutContent
                aboutContent={aboutContent}
                aboutUpdatedAt={aboutUpdatedAt}
                onTocExtracted={handleTocExtracted}
                onImageClick={handleImageClick}
              />
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
