"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import ProjectDescriptionEditor from "./ProjectDescriptionEditor";

export interface ProjectFormData {
  title: string;
  description: string;
  repository_link: string;
  live_demo_link: string;
  is_featured: boolean;
  start_date: string;
  end_date: string;
  status: string;
  type: string;
  team_size: string;
  role: string;
  youtube_url: string;
  twitter_url: string;
}

interface ProjectFormBasicFieldsProps {
  form: ProjectFormData;
  onChange: (form: ProjectFormData) => void;
}

const statusOptions = [
  { value: "completed", label: "Completed" },
  { value: "in_development", label: "In Development" },
  { value: "on_hold", label: "On Hold" },
  { value: "cancelled", label: "Cancelled" },
];

const typeOptions = [
  { value: "web_development", label: "Web Development" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "desktop_application", label: "Desktop Application" },
  { value: "game_development", label: "Game Development" },
];

export default function ProjectFormBasicFields({ form, onChange }: ProjectFormBasicFieldsProps) {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const dropdownStatusRef = useRef<HTMLDivElement>(null);
  const dropdownTypeRef = useRef<HTMLDivElement>(null);

  const handleChange = (key: keyof ProjectFormData, value: string | boolean) => {
    onChange({ ...form, [key]: value });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isStatusDropdownOpen &&
        dropdownStatusRef.current &&
        !dropdownStatusRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
      if (
        isTypeDropdownOpen &&
        dropdownTypeRef.current &&
        !dropdownTypeRef.current.contains(event.target as Node)
      ) {
        setIsTypeDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isStatusDropdownOpen, isTypeDropdownOpen]);

  return (
    <>
      {/* Title */}
      <div>
        <label className="block font-black mb-2 border-b-2 border-black inline-block text-sm uppercase">
          Project Title
          <span className="text-red-500">*</span>
        </label>
        <input
          value={form.title}
          onChange={(e) => handleChange("title", e.target.value)}
          type="text"
          placeholder="e.g. THE NEXT BIG APP"
          className="w-full p-4 border-2 border-black font-bold focus:bg-gray-50 focus:outline-none transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:font-normal placeholder:text-gray-400"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-black mb-2 flex justify-between items-end text-sm uppercase">
          <span className="border-b-2 border-black inline-block">
            Description <span className="text-red-500">*</span>
          </span>
        </label>
        <ProjectDescriptionEditor
          value={form.description}
          onChange={(val) => handleChange("description", val)}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
            <Icon icon="lucide:calendar" className="text-lg" />
            Start Date
            <span className="text-red-500">*</span>
          </label>
          <input
            value={form.start_date}
            onChange={(e) => handleChange("start_date", e.target.value)}
            type="date"
            className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
        <div>
          <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
            <Icon icon="lucide:calendar-check" className="text-lg" />
            End Date
            <span className="text-gray-400 text-[10px] normal-case ml-1">(Leave empty for &quot;Ongoing&quot;)</span>
          </label>
          <input
            value={form.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
            type="date"
            className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
      </div>

      {/* Status & Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative" ref={dropdownStatusRef}>
          <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
            <Icon icon="lucide:activity" className="text-lg" />
            Status
            <span className="text-red-500">*</span>
          </label>
          <div className="relative z-20">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsStatusDropdownOpen(!isStatusDropdownOpen);
              }}
              className={`w-full font-mono bg-white flex justify-between items-center focus:outline-none transition-all text-left text-sm border-2 border-black px-3 ${
                isStatusDropdownOpen
                  ? "border-b-0 pb-[14px] pt-3 bg-white shadow-none"
                  : "py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              <span className="truncate">
                {statusOptions.find((o) => o.value === form.status)?.label || "Select Status"}
              </span>
              <Icon
                icon="lucide:chevron-down"
                className={`transition-transform duration-200 ${isStatusDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isStatusDropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                {statusOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      handleChange("status", opt.value);
                      setIsStatusDropdownOpen(false);
                    }}
                    className={`p-3 border-b-2 border-black last:border-b-0 cursor-pointer text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group font-bold ${
                      form.status === opt.value ? "bg-gray-200" : ""
                    }`}
                  >
                    <span>{opt.label}</span>
                    {form.status === opt.value && <Icon icon="lucide:check" className="text-black group-hover:text-black" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative" ref={dropdownTypeRef}>
          <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
            <Icon icon="lucide:folder-type" className="text-lg" />
            Type
            <span className="text-gray-400 text-[10px] normal-case ml-1">(optional)</span>
          </label>
          <div className="relative z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTypeDropdownOpen(!isTypeDropdownOpen);
              }}
              className={`w-full font-mono bg-white flex justify-between items-center focus:outline-none transition-all text-left text-sm border-2 border-black px-3 ${
                isTypeDropdownOpen
                  ? "border-b-0 pb-[14px] pt-3 bg-white shadow-none"
                  : "py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              }`}
            >
              <span className="truncate">
                {form.type ? typeOptions.find((o) => o.value === form.type)?.label : "— No Type —"}
              </span>
              <Icon
                icon="lucide:chevron-down"
                className={`transition-transform duration-200 ${isTypeDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute top-full left-0 w-full bg-white border-2 border-t-0 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-h-60 overflow-y-auto">
                <div
                  onClick={() => {
                    handleChange("type", "");
                    setIsTypeDropdownOpen(false);
                  }}
                  className={`p-3 border-b-2 border-black last:border-b-0 cursor-pointer text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group font-bold ${
                    form.type === "" ? "bg-gray-200" : ""
                  }`}
                >
                  <span>— No Type —</span>
                  {form.type === "" && <Icon icon="lucide:check" className="text-black group-hover:text-black" />}
                </div>
                {typeOptions.map((opt) => (
                  <div
                    key={opt.value}
                    onClick={() => {
                      handleChange("type", opt.value);
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`p-3 border-b-2 border-black last:border-b-0 cursor-pointer text-sm hover:bg-black hover:text-white transition-colors flex items-center justify-between group font-bold ${
                      form.type === opt.value ? "bg-gray-200" : ""
                    }`}
                  >
                    <span>{opt.label}</span>
                    {form.type === opt.value && <Icon icon="lucide:check" className="text-black group-hover:text-black" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
            <Icon icon="mdi:github" className="text-lg" />
            Repository
          </label>
          <input
            value={form.repository_link}
            onChange={(e) => handleChange("repository_link", e.target.value)}
            type="url"
            placeholder="https://github.com/..."
            className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
        <div>
          <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
            <Icon icon="mdi:web" className="text-lg" />
            Live Demo
          </label>
          <input
            value={form.live_demo_link}
            onChange={(e) => handleChange("live_demo_link", e.target.value)}
            type="url"
            placeholder="https://mysite.com"
            className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
      </div>

      {/* Team & Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
            <Icon icon="lucide:calculator" className="text-lg" />
            Team Size
            <span className="text-gray-400 text-[10px] normal-case ml-1">(total people)</span>
          </label>
          <input
            value={form.team_size}
            onChange={(e) => handleChange("team_size", e.target.value)}
            type="number"
            min="1"
            placeholder="e.g. 5"
            className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
        <div>
          <label className="block font-black mb-2 text-xs uppercase flex items-center gap-2">
            <Icon icon="lucide:user-cog" className="text-lg" />
            Your Role
            <span className="text-gray-400 text-[10px] normal-case ml-1">(e.g. Fullstack)</span>
          </label>
          <input
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value)}
            type="text"
            placeholder="e.g. Lead Developer"
            className="w-full p-3 border-2 border-black font-mono text-sm focus:bg-gray-50 focus:outline-none transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,0)] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          />
        </div>
      </div>

      {/* Featured Checkbox */}
      <div className="border-2 border-black bg-gray-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-transform hover:-translate-y-1">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            id="is_featured"
            checked={form.is_featured}
            onChange={(e) => handleChange("is_featured", e.target.checked)}
            className="peer h-6 w-6 cursor-pointer appearance-none border-2 border-black bg-white transition-all checked:bg-black checked:bg-[url('https://api.iconify.design/lucide/check.svg?color=white')] checked:bg-center checked:bg-no-repeat"
          />
          <label htmlFor="is_featured" className="ml-3 font-black uppercase cursor-pointer select-none text-lg">
            Feature Project?
          </label>
        </div>
        <div className="text-xs font-mono text-gray-500 border-l-2 border-black pl-4 hidden sm:block">
          Pinned to Homepage
          <br />
          Hero Section.
        </div>
      </div>
    </>
  );
}
