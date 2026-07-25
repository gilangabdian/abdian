import React from 'react';
import { marked } from 'marked';
import { Icon } from '@iconify/react';
import { Project } from '@/types';

interface ProjectContentProps {
  project: Project;
}

export default function ProjectContent({ project }: ProjectContentProps) {
  const formatLabel = (value?: string) => {
    if (!value) return '';
    return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const statusClass = (status?: string) => {
    const map: Record<string, string> = {
      completed: 'bg-green-100 text-green-800 border-green-600',
      in_development: 'bg-yellow-100 text-yellow-800 border-yellow-600',
      on_hold: 'bg-neutral-100 text-neutral-700 border-neutral-500',
      cancelled: 'bg-red-100 text-red-800 border-red-600',
    };
    return status && map[status] ? map[status] : 'bg-neutral-100 text-neutral-700 border-neutral-500';
  };

  const renderMarkdown = (text?: string) => {
    if (!text) return '';
    return marked.parse(text, { breaks: true }) as string;
  };

  return (
    <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
      {/* Thumbnail */}
      {project.thumbnail_url && (
        <div className="w-full max-w-2xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <img
            loading="lazy"
            src={project.thumbnail_url}
            alt={project.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}
      {!project.thumbnail_url && (
        <div className="w-full max-w-2xl aspect-video bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden flex items-center justify-center text-neutral-400">
          <Icon icon="mdi:image-off-outline" className="text-4xl" />
        </div>
      )}

      {/* Meta Info (Status, Type, Date) */}
      <div className="flex flex-wrap gap-2">
        {project.status && (
          <span className={`text-xs font-bold uppercase px-2 py-1 border-2 rounded-sm flex items-center gap-1.5 ${statusClass(project.status)}`}>
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono font-normal">
              Status:
            </span>
            {formatLabel(project.status)}
          </span>
        )}
        {project.type && (
          <span className="text-xs font-bold uppercase px-2 py-1 border border-neutral-200 dark:border-neutral-800 rounded-sm bg-neutral-50 dark:bg-neutral-900/50 flex items-center gap-1.5 text-black dark:text-white">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-mono font-normal">
              Type:
            </span>
            {formatLabel(project.type)}
          </span>
        )}
        {project.start_date && (
          <span className="text-xs font-mono text-neutral-500 flex items-center gap-1 px-2 py-1">
            <span className="text-[10px] uppercase tracking-wider font-mono font-normal">
              Period:
            </span>
            <Icon icon="lucide:calendar" className="w-3.5 h-3.5" />
            {formatDate(project.start_date)} &rarr; {project.end_date ? formatDate(project.end_date) : 'Ongoing'}
          </span>
        )}
      </div>

      {/* Role & Team Size */}
      {(project.role || project.team_size) && (
        <div className="flex flex-wrap gap-6 text-neutral-600 dark:text-neutral-300">
          {project.role && (
            <div>
              <h4 className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">
                Role:
              </h4>
              <div className="flex items-center gap-2 font-bold text-sm uppercase text-black dark:text-white">
                <Icon icon="lucide:user-cog" className="text-lg" />
                {project.role}
              </div>
            </div>
          )}
          {project.team_size && (
            <div>
              <h4 className="text-[10px] font-black uppercase text-neutral-400 dark:text-neutral-500 mb-1">
                Team Size:
              </h4>
              <div className="flex items-center gap-2 font-bold text-sm uppercase text-black dark:text-white">
                <Icon icon="lucide:users" className="text-lg" />
                {project.team_size} {project.team_size > 1 ? 'People' : 'Person'}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tech Stack */}
      {project.skills && project.skills.length > 0 && (
        <div>
          <h4 className="font-bold font-serif uppercase text-sm mb-3 border-b border-neutral-200 dark:border-neutral-800 inline-block text-black dark:text-white">
            Tech Stack
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.skills.map((skill: any, i: number) => (
              <div
                key={skill.id || `skill-${i}`}
                className="flex items-center gap-2 px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-md bg-neutral-50 dark:bg-neutral-900/50 shadow-sm text-xs font-bold uppercase text-neutral-600 dark:text-neutral-300"
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

      {/* External Links */}
      <div className="flex flex-wrap gap-3">
        {project.repository_link && (
          <a
            href={project.repository_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-black dark:text-white transition-colors shadow-sm"
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
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold border border-transparent rounded-lg bg-black hover:bg-black/80 text-white dark:bg-white dark:hover:bg-neutral-200 dark:!text-black transition-colors shadow-sm"
          >
            <Icon icon="mdi:external-link" className="text-xl" />
            Live Demo
          </a>
        )}
      </div>

      {/* Description */}
      {project.description && (
        <div>
          <h4 className="font-bold font-serif uppercase text-sm mb-3 border-b border-neutral-200 dark:border-neutral-800 inline-block text-black dark:text-white">
            Description
          </h4>
          <div
            className="markdown-preview font-sans text-sm md:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(project.description) }}
          />
        </div>
      )}
    </div>
  );
}
