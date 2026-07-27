"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { CustomTechStack } from "@/types";

interface ProjectCustomTechStackProps {
  customTechStacks: CustomTechStack[];
  newCustomTechName: string;
  newCustomTechIcon: string;
  onNameChange: (val: string) => void;
  onIconChange: (val: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  selectedSkillCount: number;
}

export default function ProjectCustomTechStack({
  customTechStacks,
  newCustomTechName,
  newCustomTechIcon,
  onNameChange,
  onIconChange,
  onAdd,
  onRemove,
  selectedSkillCount,
}: ProjectCustomTechStackProps) {
  return (
    <>
      <div className="pt-4 border-t-2 border-black border-dashed">
        <label className="block font-black mb-3 border-b-2 border-black inline-block text-sm uppercase">
          Custom Tech Stacks
          <span className="text-gray-400 text-[10px] normal-case ml-1">(For project-specific tech)</span>
        </label>

        {customTechStacks.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4 p-4 border-2 border-black border-dashed bg-gray-50">
            <div className="w-full text-xs font-black uppercase text-gray-400 mb-1">Added Custom Tech:</div>
            {customTechStacks.map((tech, index) => (
              <div
                key={index}
                className="relative px-4 py-2 text-sm font-bold border-2 border-black bg-yellow-100 text-black flex items-center gap-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
              >
                <Icon icon={tech.icon_url || "lucide:code"} className="text-lg" />
                <span className="font-mono uppercase">{tech.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 border-2 border-black w-5 h-5 flex items-center justify-center rounded-full text-xs transition-colors"
                >
                  <Icon icon="lucide:x" strokeWidth={4} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-end gap-4 p-4 border-2 border-black bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="w-full sm:w-2/5">
            <label className="block font-black text-xs uppercase mb-1">Tech Name</label>
            <input
              value={newCustomTechName}
              onChange={(e) => onNameChange(e.target.value)}
              type="text"
              placeholder="e.g. Figma"
              className="w-full p-2 border-2 border-black font-mono text-sm focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAdd();
                }
              }}
            />
          </div>
          <div className="w-full sm:w-2/5">
            <label className="block font-black text-xs uppercase mb-1">Iconify Name</label>
            <input
              value={newCustomTechIcon}
              onChange={(e) => onIconChange(e.target.value)}
              type="text"
              placeholder="e.g. logos:figma"
              className="w-full p-2 border-2 border-black font-mono text-sm focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAdd();
                }
              }}
            />
          </div>
          <div className="w-full sm:w-1/5">
            <button
              type="button"
              onClick={onAdd}
              className="w-full h-[40px] bg-black text-white font-black uppercase text-sm border-2 border-black hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-1"
            >
              <Icon icon="lucide:plus" /> ADD
            </button>
          </div>
        </div>

        <p className="font-mono text-xs text-gray-500 mt-3 text-right">
          {selectedSkillCount} Main Tech + {customTechStacks.length} Custom Tech Selected
        </p>
      </div>
    </>
  );
}
