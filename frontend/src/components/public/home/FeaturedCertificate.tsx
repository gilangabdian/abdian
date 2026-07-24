"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { marked } from "marked";
import { Certificate } from "@/types";

interface FeaturedCertificateProps {
  certificates: Certificate[];
}

const renderMarkdown = (text?: string) => {
  if (!text) return "";
  return marked.parse(text, { breaks: true }) as string;
};

const formatLabel = (value?: string) => {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

export default function FeaturedCertificate({ certificates = [] }: FeaturedCertificateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const featuredCertificates = useMemo(() => {
    return [...(certificates || [])].slice(0, 3);
  }, [certificates]);

  useEffect(() => {
    const handlePopstate = () => {
      setIsModalOpen(false);
      document.body.style.overflow = "auto";
      setTimeout(() => {
        setSelectedCert(null);
      }, 200);
    };

    if (isModalOpen) {
      window.addEventListener("popstate", handlePopstate);
    }

    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [isModalOpen]);

  const openModal = (cert: Certificate) => {
    setSelectedCert(cert);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";

    // HISTORY API
    window.history.pushState({ modalOpen: true }, "", "");
  };

  const closeModal = () => {
    window.history.back();
  };

  if (!certificates || certificates.length === 0) return null;

  return (
    <section className="py-20 px-4 md:px-10 bg-white relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-black mb-6 font-serif tracking-wider inline-block relative border-b border-black/20 pb-2">
            <span className="relative z-10">Featured Certificates</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCertificates.map((cert) => (
            <div
              key={cert.id}
              onClick={() => openModal(cert)}
              className="group flex flex-col p-3 bg-white rounded-xl border border-black/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
            >
              <div className="w-full aspect-video bg-gray-50 border border-black/10 rounded-lg mb-3 overflow-hidden relative flex items-center justify-center p-2">
                <img
                  loading="lazy"
                  src={(cert.image_url || cert.image_path) as string}
                  alt={cert.title}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="flex flex-col flex-grow px-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                  {cert.issuer}
                </span>
                <h3 className="text-sm font-bold font-serif leading-tight group-hover:underline decoration-2 underline-offset-2">
                  {cert.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            href="/certificates"
            className="inline-flex items-center gap-2 px-8 py-3 bg-black text-white border border-transparent font-black uppercase tracking-wider text-sm rounded-lg shadow-sm hover:shadow-md hover:bg-black/90 hover:-translate-y-1 transition-all"
          >
            View All Certificates
            <iconify-icon icon="lucide:arrow-right" className="text-lg" />
          </Link>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>

          <div className="relative bg-white w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-black/20 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start p-6 border-b border-black/10 bg-gray-50 rounded-t-lg shrink-0">
              <div>
                <h3 className="text-2xl font-black font-serif uppercase pr-4 leading-none mb-2">
                  {selectedCert?.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-2 mt-1">
                  <span className="text-xs md:text-sm font-bold bg-white text-gray-500 px-2 py-1 border border-black/10 shadow-sm rounded-sm flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-normal">
                      Issuer:
                    </span>
                    {selectedCert?.issuer}
                  </span>
                  {selectedCert?.type && (
                    <span className="text-xs md:text-sm font-bold px-2 py-1 border border-black/10 rounded-sm bg-white flex items-center gap-1.5 shadow-sm">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-normal">
                        Type:
                      </span>
                      {formatLabel(selectedCert.type)}
                    </span>
                  )}
                </div>

                {selectedCert?.start_date && (
                  <span className="text-xs font-mono text-gray-500 flex items-center gap-1 mt-1">
                    {selectedCert.has_no_expiration || !selectedCert.end_date ? (
                      <>
                        <span className="text-[10px] uppercase tracking-wider font-mono font-normal">
                          Issued:
                        </span>
                        <iconify-icon icon="lucide:calendar" className="w-3.5 h-3.5" />
                        {formatDate(selectedCert.start_date)} &middot; No Expiration
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] uppercase tracking-wider font-mono font-normal">
                          Period:
                        </span>
                        <iconify-icon icon="lucide:calendar" className="w-3.5 h-3.5" />
                        {formatDate(selectedCert.start_date)} &rarr; {formatDate(selectedCert.end_date)}
                      </>
                    )}
                  </span>
                )}
              </div>

              <button
                onClick={closeModal}
                className="cursor-pointer hidden md:block p-1 bg-red-500 hover:bg-red-600 border border-transparent text-white transition-colors rounded-full shrink-0 shadow-sm"
              >
                <iconify-icon icon="mdi:close" className="text-xl" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="w-full aspect-video bg-gray-50 border border-black/10 rounded-lg mb-6 overflow-hidden flex-shrink-0 flex items-center justify-center p-4">
                <img
                  loading="lazy"
                  src={(selectedCert?.image_url || selectedCert?.image_path) as string}
                  alt={selectedCert?.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <h4 className="font-bold font-serif uppercase text-sm mb-3 border-b border-black/20 inline-block">
                Description
              </h4>
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedCert?.description) }}
                className="markdown-preview font-mono text-sm md:text-base text-gray-700 leading-relaxed"
              ></div>
            </div>

            <div className="p-6 border-t-2 border-black bg-gray-50 rounded-b-lg shrink-0">
              <div className="flex flex-col gap-3">
                {selectedCert?.credential_link && (
                  <a
                    href={selectedCert.credential_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold border border-transparent rounded bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-gray-200 dark:!text-black transition-colors shadow-sm"
                  >
                    <iconify-icon icon="mdi:certificate-outline" className="text-xl" />
                    Verify Credential
                  </a>
                )}

                <button
                  onClick={closeModal}
                  className="cursor-pointer w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-red-500 border border-transparent rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <iconify-icon icon="mdi:close-circle-outline" className="text-xl" />
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
