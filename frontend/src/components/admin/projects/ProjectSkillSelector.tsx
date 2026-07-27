"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { Skill } from "@/types";

interface ProjectSkillSelectorProps {
  skills: Skill[];
  selectedSkillIds: number[];
  isFetchingSkills: boolean;
  onToggleSkill: (id: number) => void;
}

export default function ProjectSkillSelector({
  skills,
  selectedSkillIds,
  isFetchingSkills,
  onToggleSkill,
}: ProjectSkillSelectorProps) {
  if (isFetchingSkills) {
    return (
      <div className="p-4 border-2 border-black border-dashed bg-gray-50 text-center font-mono animate-pulse">
        LOADING TECH DATA...
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      {skills.map((skill) => {
        const isSelected = selectedSkillIds.includes(skill.id);
        return (
          <button
            key={skill.id}
            type="button"
            onClick={() => onToggleSkill(skill.id)}
            className={`group relative px-4 py-2 text-sm font-bold border-2 border-black transition-all duration-200 select-none flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] ${
              isSelected
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-white text-black hover:bg-green-50"
            }`}
          >
            <Icon
              icon={skill.identifier || "lucide:code"}
              className={`text-lg ${isSelected ? "text-white" : "text-gray-700 group-hover:text-black"}`}
            />
            <span className="font-mono uppercase">{skill.name}</span>
            {isSelected && (
              <div className="absolute -top-2 -right-2 bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black w-5 h-5 flex items-center justify-center rounded-full text-xs">
                <Icon icon="lucide:check" strokeWidth={4} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
