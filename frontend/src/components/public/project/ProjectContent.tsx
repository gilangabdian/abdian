import React, { useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Project } from '@/types';
import { formatGithubLinks } from '@/lib/github-link-formatter';

interface ProjectContentProps {
  project: Project;
}

export default function ProjectContent({ project }: ProjectContentProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      formatGithubLinks(contentRef.current);
    }
  }, [project.description]);

  const formatLabel = (value?: string) => {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const renderMedia = () => {
    // 1. Video priority
    if (project.media_type === 'video' && project.thumbnail_url) {
      return (
        <video
          src={project.thumbnail_url}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-auto max-h-[70vh] object-contain bg-black"
        />
      );
    }

    // 2. Twitter Embed priority
    if (project.twitter_url) {
      return (
        <div className="w-full flex justify-center bg-neutral-50 dark:bg-neutral-900 overflow-hidden relative min-h-[300px]">
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
        return (match && match[2].length === 11) ? match[2] : null;
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
          className="w-full h-auto max-h-[70vh] object-cover"
        />
      );
    }

    // 5. No Media
    return (
      <div className="w-full aspect-video bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-center text-neutral-400">
        <Icon icon="mdi:image-off-outline" className="text-4xl" />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      {/* Media Renderer - full width */}
      <div className="w-full bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
        {renderMedia()}
      </div>

      {/* Case Study: 2-column layout after image */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">
        {/* LEFT COLUMN: Description + Tech Stack */}
        <div className="md:col-span-3 flex flex-col gap-6">
          {/* Description */}
          {project.description && (
            <div>
              <h4 className="font-bold font-sans uppercase text-sm border-b border-neutral-200 dark:border-neutral-800 inline-block text-black dark:text-white">
                Description
              </h4>
              <div
                ref={contentRef}
                className="markdown-preview font-sans text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed mt-3 break-words [&_a]:break-all prose prose-sm md:prose-base dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            </div>
          )}

          {/* Tech Stack */}
          {project.skills && project.skills.length > 0 && (
            <div>
              <h4 className="font-bold font-sans uppercase text-sm border-b border-neutral-200 dark:border-neutral-800 inline-block text-black dark:text-white">
                Tech Stack
              </h4>
              <div className="flex flex-wrap gap-2 mt-3">
                {project.skills.map((skill: any, i: number) => (
                  <div
                    key={skill.id || `skill-${i}`}
                    className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-md bg-neutral-50 dark:bg-neutral-900/50 text-xs font-bold uppercase text-neutral-600 dark:text-neutral-300"
                  >
                    {skill.identifier && (
                      <Icon icon={skill.identifier} className="text-base text-black dark:text-white" />
                    )}
                    {skill.name || skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Quick Facts + Actions */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Quick Facts */}
          <div>
            <h4 className="font-bold font-sans uppercase text-sm border-b border-neutral-200 dark:border-neutral-800 inline-block text-black dark:text-white">
              Quick Facts
            </h4>
            <div className="mt-3 space-y-3">
              {project.status && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold uppercase text-neutral-500 dark:text-neutral-500 min-w-[70px]">
                    Status:
                  </span>
                  <span className={`font-bold uppercase ${statusClass(project.status)} px-2 py-1 border-2 rounded-sm`}>
                    {formatLabel(project.status)}
                  </span>
                </div>
              )}
              {project.type && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold uppercase text-neutral-500 dark:text-neutral-500 min-w-[70px]">
                    Type:
                  </span>
                  <span className="font-bold uppercase px-2 py-1 rounded-sm text-black dark:text-white">
                    {formatLabel(project.type)}
                  </span>
                </div>
              )}
              {project.start_date && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold uppercase text-neutral-500 dark:text-neutral-500 min-w-[70px]">
                    Period:
                  </span>
                  <span className="font-mono text-neutral-600 dark:text-neutral-400">
                    <Icon icon="lucide:calendar" className="w-3 h-3 inline mr-1" />
                    {formatDate(project.start_date)} &rarr; {project.end_date ? formatDate(project.end_date) : 'Ongoing'}
                  </span>
                </div>
              )}
              {project.role && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold uppercase text-neutral-500 dark:text-neutral-500 min-w-[70px]">
                    Role:
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-black dark:text-white">
                    <Icon icon="lucide:user-cog" className="text-base" />
                    {project.role}
                  </span>
                </div>
              )}
              {project.team_size && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold uppercase text-neutral-500 dark:text-neutral-500 min-w-[70px]">
                    Team:
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-black dark:text-white">
                    <Icon icon="lucide:users" className="text-base" />
                    {project.team_size} {project.team_size > 1 ? 'People' : 'Person'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {(project.repository_link || project.live_demo_link) && (
            <div className="flex flex-col gap-2.5">
              <h4 className="font-bold font-sans uppercase text-sm border-b border-neutral-200 dark:border-neutral-800 inline-block text-black dark:text-white">
                Links
              </h4>
              <div className="mt-1 flex flex-col gap-2">
                {project.repository_link && (
                  <a
                    href={project.repository_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-black dark:text-white transition-colors"
                  >
                    <Icon icon="mdi:github" className="text-xl" />
                    View Code
                  </a>
                )}
                {project.live_demo_link && (
                  <a
                    href={project.live_demo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold border border-transparent rounded-lg bg-black hover:bg-black/80 text-white dark:bg-white dark:hover:bg-neutral-200 dark:!text-black transition-colors"
                  >
                    <Icon icon="mdi:external-link" className="text-xl" />
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function statusClass(status?: string) {
  const map: Record<string, string> = {
    completed: 'bg-green-50 text-green-700 border-green-500 dark:bg-green-950 dark:text-green-400 dark:border-green-700',
    in_development: 'bg-yellow-50 text-yellow-700 border-yellow-500 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-700',
    on_hold: 'bg-neutral-50 text-neutral-600 border-neutral-400 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-600',
    cancelled: 'bg-red-50 text-red-700 border-red-500 dark:bg-red-950 dark:text-red-400 dark:border-red-700',
  };
  return status && map[status] ? map[status] : 'bg-neutral-50 text-neutral-600 border-neutral-400 dark:bg-neutral-800 dark:text-neutral-400 dark:border-neutral-600';
}
