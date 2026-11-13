"use client";

import React, { useEffect, useRef } from "react";
import { Project } from "@/types";
import { formatGithubLinks } from "@/lib/github-link-formatter";

interface ProjectCardProps {
  project: Project;
  dataAnimate?: boolean;
  staggerIndex?: number;
}

const ProjectCard = React.memo(function ProjectCard({
  project,
  dataAnimate,
  staggerIndex,
}: ProjectCardProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      formatGithubLinks(contentRef.current);
    }
  }, [project.description]);

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
          preload="auto"
          className="w-full h-auto max-h-[400px] object-cover bg-black"
        />
      );
    }

    // 2. Twitter Embed priority
    if (project.twitter_url) {
      return (
        <div className="w-full flex justify-center bg-neutral-50 dark:bg-neutral-900 overflow-hidden relative z-20 min-h-[220px]">
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
          <div className="w-full aspect-video relative z-20">
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

  const hasDescription = Boolean(
    project.description &&
      project.description.trim() !== "" &&
      project.description.trim() !== "<p></p>"
  );

  const destinationUrl = project.repository_link || project.live_demo_link;

  return (
    <article
      data-animate={dataAnimate ? true : undefined}
      style={
        dataAnimate && typeof staggerIndex === "number"
          ? ({ "--stagger": staggerIndex } as React.CSSProperties)
          : undefined
      }
      className="project-card-item w-full bg-white dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800/80 rounded-xl overflow-hidden cursor-pointer relative hover:z-20 hover:scale-[1.01] transition-transform duration-300 ease-out flex flex-col justify-between shadow-xs"
    >
      {/* Native Overlay Anchor so browser displays destination URL preview at bottom-left */}
      {destinationUrl && (
        <a
          href={destinationUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.title}`}
          className="absolute inset-0 z-10"
        />
      )}

      {/* Top Media */}
      {hasMedia && (
        <div className="w-full bg-neutral-50 dark:bg-neutral-900/40 border-b border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden">
          {renderMedia()}
        </div>
      )}

      {/* Card Body */}
      <div className="p-5 md:p-6 flex flex-col flex-grow justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <h2 className="text-lg md:text-xl font-medium tracking-tight text-black dark:text-white leading-snug">
            {project.title}
          </h2>

          {hasDescription && project.description && (
            <div
              ref={contentRef}
              className="markdown-preview font-sans text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed break-words [&_a]:break-all [&_a]:relative [&_a]:z-20 prose prose-sm dark:prose-invert max-w-none [&_ul]:pl-[1.15rem] [&_ul]:ml-0 [&_ol]:pl-[1.25rem] [&_ol]:ml-0"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          )}
        </div>
      </div>
    </article>
  );
});

export default ProjectCard;
