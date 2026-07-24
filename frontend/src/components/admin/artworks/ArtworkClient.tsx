"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { getAllArtworks, createArtwork, deleteArtwork } from "@/lib/api/artwork";
import { alertSuccess, alertError, alertConfirm } from "@/lib/alert";

export default function ArtworkClient() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState("");

  const fetchArtworks = async () => {
    setIsLoading(true);
    try {
      const data = await getAllArtworks();
      setArtworks(data || []);
    } catch (error) {
      alertError("Gagal mengambil data artworks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newFiles = files.filter(
        (newFile) => !selectedFiles.some((existingFile) => existingFile.name === newFile.name && existingFile.size === newFile.size)
      );
      
      if (newFiles.length > 0) {
        setSelectedFiles(prev => [...prev, ...newFiles]);
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviewImages(prev => [...prev, ...newPreviews]);
      }
    }
    
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (index: number) => {
    URL.revokeObjectURL(previewImages[index]);
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadArtwork = async () => {
    if (selectedFiles.length === 0) {
      alertError("Pilih gambar terlebih dahulu");
      return;
    }

    setIsUploading(true);
    const totalFiles = selectedFiles.length;
    let successCount = 0;

    try {
      const token = localStorage.getItem("token") || "";

      for (let i = 0; i < totalFiles; i++) {
        setUploadProgressText(`Mengunggah ${i + 1} dari ${totalFiles}... (${Math.round((i / totalFiles) * 100)}%)`);
        
        const formData = new FormData();
        formData.append("image", selectedFiles[i]);

        const response = await createArtwork(token, formData);
        if (response.ok) {
          successCount++;
        } else {
          console.error("Failed to upload " + selectedFiles[i].name);
        }
      }

      setUploadProgressText(`Selesai! 100%`);

      await alertSuccess(`${successCount} Artworks berhasil diupload!`);

      resetForm();
      fetchArtworks();
    } catch (error) {
      alertError("Terjadi kesalahan saat mengupload");
    } finally {
      setIsUploading(false);
      setUploadProgressText("");
    }
  };

  const handleDelete = async (id: number) => {
    const confirm = await alertConfirm("Yakin Hapus?", "Artwork ini akan dihapus permanen!");

    if (confirm) {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await deleteArtwork(token, id);

        if (!response.ok) throw new Error("Delete failed");

        await alertSuccess("Artwork berhasil dihapus.");
        fetchArtworks();
      } catch (error) {
        alertError("Gagal menghapus artwork");
      }
    }
  };

  const resetForm = () => {
    setSelectedFiles([]);
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setPreviewImages([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Cleanup object urls on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Artworks</h1>
      </div>

      {/* Upload Section */}
      <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h2 className="text-xl font-bold font-mono border-b-2 border-black pb-2 mb-4">Upload New Artwork</h2>
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/2">
            <label className="block font-bold font-mono mb-2">Select Image <span className="text-red-500">*</span></label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="block w-full border-4 border-black bg-white p-2 text-sm font-mono cursor-pointer file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />
            <button
              onClick={uploadArtwork}
              disabled={isUploading || selectedFiles.length === 0}
              className="mt-4 px-6 py-2 bg-black text-white font-bold uppercase tracking-wider border-4 border-black hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (uploadProgressText || 'Uploading...') : 'Upload'}
            </button>
          </div>

          {previewImages.length > 0 && (
            <div className="w-full md:w-1/2">
              <label className="block font-bold font-mono mb-2">Preview ({previewImages.length} selected)</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 border-4 border-black bg-gray-100 p-4 max-h-64 overflow-y-auto">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} className="w-full h-24 object-cover border-2 border-black" alt={`Preview ${index}`} />
                    <button 
                      onClick={() => removeSelectedFile(index)} 
                      disabled={isUploading}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-black hover:bg-red-600 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      title="Batalkan gambar ini"
                    >
                      <Icon icon="lucide:x" className="text-sm font-bold" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Management */}
      {isLoading ? (
        <div className="text-center p-8 font-mono font-bold">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artworks.map((artwork) => (
            <div
              key={artwork.id}
              className="border-4 border-black bg-gray-50 group relative flex items-center justify-center h-48 overflow-hidden"
            >
              <img src={artwork.image_url} loading="lazy" className="max-w-full max-h-full object-contain" alt="Artwork" />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleDelete(artwork.id)}
                  className="bg-red-500 border-4 border-black text-white p-2 hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  title="Delete Artwork"
                >
                  <Icon icon="lucide:trash-2" width="20" height="20" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
