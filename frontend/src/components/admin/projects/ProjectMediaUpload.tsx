"use client";

import React, { useRef } from "react";
import { Icon } from "@iconify/react";

interface ProjectMediaUploadProps {
  activeMediaTab: "upload" | "youtube" | "twitter";
  onTabChange: (tab: "upload" | "youtube" | "twitter") => void;
  previewImage: string | null;
  onFileSelect: (file: File) => void;
  onRemoveImage: () => void;
  youtubeUrl: string;
  twitterUrl: string;
  onYoutubeUrlChange: (url: string) => void;
  onTwitterUrlChange: (url: string) => void;
  isEditMode: boolean;
  showRemoveWarning: boolean;
}

export default function ProjectMediaUpload({
  activeMediaTab,
  onTabChange,
  previewImage,
  onFileSelect,
  onRemoveImage,
  youtubeUrl,
  twitterUrl,
  onYoutubeUrlChange,
  onTwitterUrlChange,
  isEditMode,
  showRemoveWarning,
}: ProjectMediaUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleRemoveImage = () => {
    onRemoveImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="border-4 border-black p-4 md:p-6 bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <label className="block font-black mb-4 border-b-2 border-black inline-block text-sm uppercase">
        Project Media
        {!isEditMode && <span className="text-red-500">*</span>}
      </label>

      <div className="flex gap-2 mb-4 border-b-2 border-black pb-2">
        {(["upload", "youtube", "twitter"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`text-xs font-bold uppercase px-2 py-1 border-2 border-black ${
              activeMediaTab === tab ? "bg-black text-white" : "bg-white text-black"
            }`}
          >
            {tab === "upload" && <Icon icon="lucide:upload" className="inline mr-1" />}
            {tab === "youtube" && <Icon icon="logos:youtube-icon" className="inline mr-1" />}
            {tab === "twitter" && <Icon icon="ri:twitter-x-line" className="inline mr-1" />}
            {tab === "upload" ? "File" : tab === "youtube" ? "YT" : "X"}
          </button>
        ))}
      </div>

      {activeMediaTab === "upload" && (
        <div
          className="relative w-full max-w-md aspect-video border-4 border-black bg-white flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group mx-auto"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,.mkv,video/x-matroska"
            onChange={handleFileChange}
          />

          {previewImage ? (
            <div className="relative w-full h-full p-2 bg-white">
              {previewImage.match(/\.(mp4|webm|mov|mkv)$/i) ? (
                <video src={previewImage} className="w-full h-full object-cover border-2 border-black" autoPlay muted loop playsInline />
              ) : (
                <img loading="lazy" src={previewImage} className="w-full h-full object-cover border-2 border-black" alt="Preview" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                className="absolute top-0 right-0 bg-white text-black hover:bg-black hover:text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform z-10"
                title="Remove Image"
              >
                <Icon icon="lucide:trash-2" />
              </button>
            </div>
          ) : (
            <div className="text-center p-4 space-y-2">
              <div className="bg-white p-3 inline-block border-2 border-black group-hover:scale-110 transition-transform duration-300">
                <Icon icon="lucide:image-plus" className="text-3xl text-black" />
              </div>
              <div>
                <h4 className="font-black text-sm uppercase">{isEditMode ? "Change Media" : "Upload Media"}</h4>
                <p className="text-[10px] font-mono text-gray-500">Max 100MB (JPG/PNG/MP4/MKV)</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeMediaTab === "youtube" && (
        <div className="space-y-2 max-w-md mx-auto">
          <label className="block font-black text-xs uppercase flex items-center gap-2">
            <Icon icon="logos:youtube-icon" className="text-lg" />
            YouTube URL
          </label>
          <input
            value={youtubeUrl}
            onChange={(e) => onYoutubeUrlChange(e.target.value)}
            type="url"
            placeholder="https://youtube.com/watch?v=..."
            className="w-full p-3 border-2 border-black font-mono text-sm focus:outline-none"
          />
          <p className="text-[10px] text-gray-500 font-mono">Pastikan URL valid dari YouTube.</p>
        </div>
      )}

      {activeMediaTab === "twitter" && (
        <div className="space-y-2 max-w-md mx-auto">
          <label className="block font-black text-xs uppercase flex items-center gap-2">
            <Icon icon="ri:twitter-x-line" className="text-lg" />
            Twitter / X URL
          </label>
          <input
            value={twitterUrl}
            onChange={(e) => onTwitterUrlChange(e.target.value)}
            type="url"
            placeholder="https://x.com/username/status/..."
            className="w-full p-3 border-2 border-black font-mono text-sm focus:outline-none"
          />
          <p className="text-[10px] text-gray-500 font-mono">Masukkan link tweet yang mengandung video.</p>
        </div>
      )}

      {isEditMode && previewImage && showRemoveWarning && (
        <div className="mt-3 p-2 border-2 border-yellow-400 bg-yellow-50 text-yellow-800 text-xs font-mono flex items-center gap-2">
          <Icon icon="lucide:alert-triangle" className="text-yellow-500 shrink-0" />
          Thumbnail akan dihapus saat update.
        </div>
      )}
    </div>
  );
}
