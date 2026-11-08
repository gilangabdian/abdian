"use client";

import React, { useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Project } from "@/types";
import { formatGithubLinks } from "@/lib/github-link-formatter";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      formatGithubLinks(contentRef.current);
    }
  }, [project.description]);

  const formatStartDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(Date.UTC(year, month, day));
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? ""
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  const renderMedia = () => {
    // 1. Video priority
    if (project.media_type === "video" && project.thumbnail_url) {
      return (
        <video
          src={project.thumbnail_url}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-auto max-h-[400px] object-cover bg-black"
        />
      );
    }

    // 2. Twitter Embed priority
    if (project.twitter_url) {
      return (
        <div className="w-full flex justify-center bg-neutral-50 dark:bg-neutral-900 overflow-hidden relative min-h-[220px]">
          <blockquote className="twitter-tweet" data-theme="dark">
            <a href={project.twitter_url}></a>
          </blockquote>
          <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
        </div>
      );
    }

    // 3. YouTube Embed priority
    if (project.youtube_url) {
      const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
      };
      const ytId = getYoutubeId(project.youtube_url);
      if (ytId) {
        return (
          <div className="w-full aspect-video">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${ytId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }
    }

    // 4. Image Fallback
    if (project.thumbnail_url) {
      return (
        <img
          loading="lazy"
          src={project.thumbnail_url}
          alt={project.title}
          className="w-full h-auto max-h-[400px] object-cover"
        />
      );
    }

    return null;
  };

  const hasMedia =
    Boolean(project.thumbnail_url) ||
    Boolean(project.twitter_url) ||
    Boolean(project.youtube_url);

  return (
    <article
      className="project-card-item w-full bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-[border-color,box-shadow] duration-200 flex flex-col justify-between shadow-xs hover:shadow-sm"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      {/* Top Media */}
      {hasMedia && (
        <div className="w-full bg-neutral-50 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800 overflow-hidden">
          {renderMedia()}
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 md:p-6 flex flex-col flex-grow justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <h2 className="text-xl font-bold tracking-tight text-black dark:text-white leading-snug">
            {project.title}
          </h2>

          {project.description && (
            <div
              ref={contentRef}
              className="markdown-preview font-sans text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed break-words [&_a]:break-all prose prose-sm dark:prose-invert max-w-none [&_ul]:pl-[1.15rem] [&_ul]:ml-0 [&_ol]:pl-[1.25rem] [&_ol]:ml-0"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}
        </div>

        {/* Footer: Start Date & Action Links */}
        {(project.start_date || project.repository_link || project.live_demo_link) && (
          <div className="flex items-center justify-between pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 mt-auto">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono tracking-tight">
              {formatStartDate(project.start_date)}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
              {project.repository_link && (
                <a
                  href={project.repository_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Source Code"
                  className="p-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                >
                  <Icon icon="mdi:github" className="text-xl" />
                </a>
              )}
              {project.live_demo_link && (
                <a
                  href={project.live_demo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Live Demo"
                  className="p-1.5 text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors"
                >
                  <Icon icon="mdi:external-link" className="text-xl" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
