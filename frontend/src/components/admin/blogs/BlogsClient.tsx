"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { getAllBlogsAdmin, deleteBlog, adminTogglePublishBlog, adminBulkDeleteBlogs } from "@/lib/api/blog";
import { alertSuccess, alertError } from "@/lib/alert";

export default function BlogsClient() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const data = await getAllBlogsAdmin(token);
      setBlogs(data || []);
    } catch (error) {
      console.error(error);
      alertError("Gagal mengambil data blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectMode = () => {
    setIsSelectMode(!isSelectMode);
    setSelectedIds([]);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === blogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(blogs.map((b) => Number(b.id)));
    }
  };

  const handleTogglePublish = async (blog: any) => {
    const oldStatus = blog.is_published;
    // Optimistic UI update
    setBlogs((prev) =>
      prev.map((b) => (b.id === blog.id ? { ...b, is_published: !oldStatus } : b))
    );

    try {
      const token = localStorage.getItem("token") || "";
      const response = await adminTogglePublishBlog(token, blog.id);
      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.message || "Gagal mengubah status publish blog");
      }
      const resJson = await response.json();
      await alertSuccess(resJson.message || (!oldStatus ? "Blog berhasil dipublish" : "Blog berhasil dijadikan draft"));
    } catch (error) {
      console.error(error);
      // Revert optimistic update
      setBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, is_published: oldStatus } : b))
      );
      alertError(error instanceof Error ? error.message : "Gagal mengubah status publish blog");
    }
  };

  const handleDelete = async (id: number) => {
    const Swal = (await import("sweetalert2")).default;
    const result = await Swal.fire({
      title: "Yakin Hapus?",
      text: "Artikel ini akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus!",
      customClass: { popup: "border-4 border-black rounded-none" },
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token") || "";
        const response = await deleteBlog(token, id);
        if (!response.ok) throw new Error("Gagal menghapus");

        await alertSuccess("Artikel berhasil dihapus.");
        fetchBlogs();
      } catch (error) {
        console.error(error);
        alertError("Terjadi kesalahan");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const Swal = (await import("sweetalert2")).default;
    const result = await Swal.fire({
      title: "Yakin Hapus Masal?",
      text: `${selectedIds.length} artikel yang dipilih akan dihapus permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus Semua!",
      customClass: { popup: "border-4 border-black rounded-none" },
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        const token = localStorage.getItem("token") || "";
        const response = await adminBulkDeleteBlogs(token, selectedIds);
        if (!response.ok) throw new Error("Gagal menghapus");

        await alertSuccess(`${selectedIds.length} artikel berhasil dihapus.`);
        setSelectedIds([]);
        setIsSelectMode(false);
        fetchBlogs();
      } catch (error) {
        console.error(error);
        alertError("Terjadi kesalahan saat menghapus artikel");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-4 border-black pb-4">
        <h1 className="text-3xl font-black tracking-tighter uppercase">Manage Blogs</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {blogs.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={`px-4 py-2 font-bold font-mono border-4 border-black transition-colors flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                isSelectMode ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              <Icon icon={isSelectMode ? "lucide:x" : "lucide:check-square"} width="18" height="18" />
              {isSelectMode ? "Cancel" : "Select Mode"}
            </button>
          )}
          <Link
            href="/admin/blogs/create"
            className="bg-black text-white px-6 py-2 font-bold font-mono border-4 border-black hover:bg-white hover:text-black transition-colors flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <Icon icon="lucide:plus" width="20" height="20" />
            Write Blog
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center p-8 font-mono font-bold">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {blogs.length === 0 && (
            <div className="col-span-full text-center p-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-mono">
              Belum ada artikel. Klik &quot;Write Blog&quot; untuk mulai menulis!
            </div>
          )}

          {blogs.map((blog) => {
            const isSelected = selectedIds.includes(Number(blog.id));

            return (
              <div
                key={blog.id}
                onClick={() => {
                  if (isSelectMode) toggleSelect(Number(blog.id));
                }}
                className={`border-4 border-black bg-white p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col relative group transition-all ${
                  isSelectMode ? "cursor-pointer" : ""
                } ${isSelected ? "bg-gray-100 ring-4 ring-black ring-offset-2" : ""}`}
              >
                {/* Select Mode Checkbox Indicator */}
                {isSelectMode && (
                  <div className="absolute -top-3 -left-3 z-10">
                    <div
                      className={`w-7 h-7 border-2 border-black flex items-center justify-center font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                        isSelected ? "bg-black text-white" : "bg-white text-black"
                      }`}
                    >
                      {isSelected ? "✓" : ""}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex flex-col gap-2">
                    {/* Quick Toggle Publish / Draft Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePublish(blog);
                      }}
                      title="Klik untuk mengubah status Publish / Draft secara instan"
                      className={`${
                        blog.is_published
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      } px-2.5 py-1 text-xs font-bold font-mono border-2 border-black inline-flex items-center gap-1.5 transition-transform hover:scale-105 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none w-fit`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          blog.is_published ? "bg-green-600" : "bg-yellow-600"
                        }`}
                      />
                      {blog.is_published ? "Published" : "Draft"}
                    </button>

                    {blog.is_external && (
                      <div className="px-2 py-1 text-xs font-bold font-mono border-2 border-black bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                        <Icon icon="carbon:arrow-up-right" /> External
                      </div>
                    )}

                    {blog.type === "note" && (
                      <div className="px-2 py-1 text-xs font-bold font-mono border-2 border-black bg-purple-100 text-purple-800 flex items-center gap-1 w-fit">
                        <Icon icon="mdi:note-outline" /> Note
                      </div>
                    )}
                  </div>

                  {!isSelectMode && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/blogs/edit/${blog.id}`);
                        }}
                        className="p-2 bg-yellow-400 border-2 border-black hover:bg-yellow-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-105"
                        title="Edit"
                      >
                        <Icon icon="lucide:edit" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(blog.id);
                        }}
                        className="p-2 bg-red-500 text-white border-2 border-black hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:scale-105"
                        title="Delete"
                      >
                        <Icon icon="lucide:trash-2" />
                      </button>
                    </div>
                  )}
                </div>

                <h2 className="text-xl font-bold font-serif mb-2 line-clamp-2 leading-tight break-words">
                  {blog.type === "note"
                    ? blog.content?.replace(/<[^>]*>?/gm, "").substring(0, 50) + "..."
                    : blog.title}
                </h2>

                <div className="mt-auto pt-4 flex gap-4 text-xs font-mono text-gray-600 border-t-2 border-dashed border-gray-300">
                  {!blog.is_external && (
                    <span className="flex items-center gap-1">
                      <Icon icon="lucide:clock" />
                      {blog.read_time} min read
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Icon icon="lucide:calendar" />
                    {new Date(blog.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Action Bar for Bulk Delete */}
      {isSelectMode && (
        <div className="fixed bottom-4 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none">
          <div className="bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] p-4 max-w-lg w-full flex items-center justify-between pointer-events-auto">
            <div className="font-bold font-mono text-sm sm:text-base">
              {selectedIds.length} Selected
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="bg-white text-black font-bold font-mono px-3 py-1.5 text-xs sm:text-sm border-2 border-black hover:bg-gray-100 transition-colors"
              >
                {selectedIds.length === blogs.length ? "Deselect All" : "Select All"}
              </button>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0 || isSubmitting}
                className="bg-red-500 hover:bg-red-600 text-white font-bold font-mono px-4 py-1.5 text-xs sm:text-sm border-2 border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 uppercase"
              >
                <Icon icon="lucide:trash-2" className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
