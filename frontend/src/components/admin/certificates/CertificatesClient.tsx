"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { getAllCertificates, adminDeleteCertificate, adminUpdateCertificate } from "@/lib/api/certificate";
import { alertSuccess, alertError, alertConfirmCertificate } from "@/lib/alert";
import { marked } from "marked";

export default function CertificatesClient() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const renderMarkdown = (text: string) => {
    if (!text) return { __html: "" };
    return { __html: marked.parse(text, { breaks: true }) };
  };

  const formatLabel = (value: string) => {
    if (!value) return "";
    return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await getAllCertificates();
      setCertificates(result || []);
    } catch (error) {
      console.error(error);
      alertError("Gagal mengambil data certificates.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const isConfirm = await alertConfirmCertificate("Yakin ingin menghapus sertifikat ini? Data tidak bisa dikembalikan.");
    if (!isConfirm) return;

    try {
      const token = localStorage.getItem("token") || "";
      const response = await adminDeleteCertificate(token, id);
      if (response.ok) {
        await alertSuccess("Sertifikat berhasil dihapus!");
        fetchData();
      } else {
        await alertError("Gagal menghapus data.");
      }
    } catch (error) {
      console.error(error);
      alertError("Terjadi kesalahan sistem.");
    }
  };

  const handleToggleFeatured = async (cert: any) => {
    const oldStatus = cert.is_featured;
    
    // Optimistic Update
    setCertificates(prev => 
      prev.map(c => c.id === cert.id ? { ...c, is_featured: !oldStatus } : c)
    );

    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("title", cert.title);
      formData.append("issuer", cert.issuer);
      formData.append("description", cert.description || "");
      formData.append("is_featured", !oldStatus ? "1" : "0");
      formData.append("start_date", cert.start_date ? cert.start_date.substring(0, 10) : "");
      formData.append("end_date", cert.end_date ? cert.end_date.substring(0, 10) : "");

      const response = await adminUpdateCertificate(token, cert.id, formData);

      if (!response.ok) {
        throw new Error("Gagal update");
      }
    } catch (error) {
      console.error(error);
      // Rollback
      setCertificates(prev => 
        prev.map(c => c.id === cert.id ? { ...c, is_featured: oldStatus } : c)
      );
      alertError("Gagal mengubah status featured.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-10 border-b-4 border-black pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black italic uppercase">MANAGE CERTIFICATES</h1>
          <p className="font-mono text-gray-600 mt-2">Showcase your achievements and credentials.</p>
        </div>

        {!isLoading && certificates.length > 0 && (
          <Link
            href="/admin/certificates/create"
            className="bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black px-4 py-2 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none transition-all flex items-center gap-2"
          >
            <Icon icon="lucide:plus" className="text-xl" />
            <span>Add New</span>
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="p-8 text-center font-mono animate-pulse border-4 border-black bg-white">
          LOADING CERTIFICATES...
        </div>
      ) : certificates.length === 0 ? (
        <div className="p-12 text-center border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-4">
          <div className="bg-gray-100 p-4 rounded-full border-2 border-black">
            <Icon icon="lucide:award" className="text-4xl text-gray-400" />
          </div>
          <div>
            <h3 className="font-bold text-xl uppercase">No Certificates Found</h3>
            <p className="font-mono text-gray-500 mb-6">You haven't uploaded any credentials yet.</p>
            <Link
              href="/admin/certificates/create"
              className="inline-block bg-black text-white hover:text-black hover:bg-gray-100 border-2 border-black px-6 py-3 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform"
            >
              Add Your First One!
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all flex flex-col h-full relative"
            >
              <button
                onClick={() => handleToggleFeatured(cert)}
                className="absolute top-2 right-2 z-20 p-2 bg-white border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-110 transition-transform"
                title={cert.is_featured ? "Unfeature Certificate" : "Feature Certificate"}
              >
                <Icon
                  icon={cert.is_featured ? "lucide:star" : "lucide:star-off"}
                  className={`w-5 h-5 transition-all duration-300 ${
                    cert.is_featured ? "text-black fill-yellow-500 scale-110" : "text-gray-300"
                  }`}
                />
              </button>
              
              <div className="relative h-48 w-full border-2 border-black mb-4 bg-gray-100 overflow-hidden group">
                <img
                  src={cert.image_url || cert.image_path}
                  loading="lazy"
                  className="w-full h-full object-cover"
                  alt="Certificate Image"
                />
                {cert.credential_link && (
                  <a
                    href={cert.credential_link}
                    target="_blank"
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="bg-white text-black px-3 py-1 font-bold border-2 border-black text-xs uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                      View Credential
                      <Icon icon="lucide:external-link" />
                    </div>
                  </a>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-black text-white text-[10px] px-2 py-0.5 font-mono uppercase font-bold">
                    {cert.issuer || "Unknown Issuer"}
                  </span>
                  <span className="text-xs font-mono text-gray-500">#{cert.id}</span>
                </div>

                <h3 className="font-black text-lg uppercase leading-tight mb-2 line-clamp-2">
                  {cert.title}
                </h3>

                <div
                  dangerouslySetInnerHTML={renderMarkdown(cert.description)}
                  className="markdown-preview text-sm font-mono text-gray-600 line-clamp-3 mb-3"
                ></div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  {cert.type && (
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 border-black rounded-sm bg-[#E7E7E7] border">
                      {formatLabel(cert.type)}
                    </span>
                  )}
                  {cert.start_date && (
                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1">
                      <Icon icon="lucide:calendar" className="w-3 h-3" />
                      {formatDate(cert.start_date)} {cert.end_date ? `→ ${formatDate(cert.end_date)}` : ''}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-auto pt-4 border-t-2 border-black border-dashed">
                <Link
                  href={`/admin/certificates/edit/${cert.id}`}
                  className="flex-1 bg-gray-200 hover:bg-gray-500 border-2 border-black py-2 font-bold text-center text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:pencil" className="w-4 h-4" />
                  Edit
                </Link>

                <button
                  onClick={() => handleDelete(cert.id)}
                  className="bg-red-500 text-white hover:bg-red-600 flex-1 border-2 border-black py-2 font-bold text-center text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Icon icon="lucide:trash-2" className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
