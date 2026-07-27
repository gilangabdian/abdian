"use client";

import React from "react";
import { Project } from "@/types";
import ProjectContent from "@/components/public/project/ProjectContent";

interface ProjectLivePreviewProps {
  isOpen: boolean;
  project: Project;
  onClose: () => void;
}

export default function ProjectLivePreview({ isOpen, project, onClose }: ProjectLivePreviewProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b-4 border-black p-4 flex justify-between items-center shadow-md">
        <h2 className="font-black italic uppercase text-xl md:text-2xl">
          Project Preview
        </h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-black text-white font-bold uppercase border-2 border-black hover:bg-white hover:text-black transition-colors"
        >
          Close Preview
        </button>
      </div>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <ProjectContent project={project} />
      </div>
    </div>
  );
}
