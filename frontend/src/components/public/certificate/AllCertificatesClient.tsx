"use client";

import { useState, useEffect, useRef } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import gsap from "gsap";
import { marked } from "marked";
import { Certificate } from "@/types";

interface AllCertificatesClientProps {
  initialCertificates: Certificate[];
}

export default function AllCertificatesClient({ initialCertificates }: AllCertificatesClientProps) {
  const [certificates] = useState<Certificate[]>(initialCertificates);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Helper: Format enum value to readable label
  const formatLabel = (value?: string) => {
    if (!value) return "";
    return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Helper: Format date to "Jan 2025"
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  const renderMarkdown = (text?: string) => {
    if (!text) return "";
    return marked.parse(text, { breaks: true }) as string;
  };

  useEffect(() => {
    NProgress.done();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const tl = gsap.timeline();

      // 1. Animasi Header
      tl.fromTo(
        ".page-title",
        { y: 30, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power2.out",
        }
      );

      // 2. Animasi Kartu
      if (certificates.length > 0) {
        tl.fromTo(
          ".cert-card",
          { y: 30, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.6"
        );
      }
    }
  }, [certificates.length]);

  const openModal = (cert: Certificate) => {
    setSelectedCert(cert);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
    setTimeout(() => {
      setSelectedCert(null);
    }, 200);
  };

  return (
    <div className="min-h-screen mb-40" ref={containerRef}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-left: 2px solid black; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: black; border: 1px solid white; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #333; }
        
        .dark .custom-scrollbar::-webkit-scrollbar-track { background: #1a1a1a; border-left: 2px solid rgba(255,255,255,0.1); }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border: 1px solid #1a1a1a; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
        
        .markdown-preview ul { list-style-type: disc !important; margin-left: 1.5rem !important; margin-bottom: 0.5rem !important; }
        .markdown-preview ol { list-style-type: decimal !important; margin-left: 1.5rem !important; margin-bottom: 0.5rem !important; }
        .markdown-preview li { display: list-item !important; margin-bottom: 0.25rem; }
        .markdown-preview p { margin-bottom: 0.75rem; }
        .markdown-preview strong, .markdown-preview b { font-weight: 900 !important; }
        .markdown-preview em, .markdown-preview i { font-style: italic !important; }
      `}</style>

        <div className="-mt-16 md:mt-4 px-4 py-16 md:px-8 max-w-6xl mx-auto">
          <div className="text-center mb-12 mt-4 page-title" style={{ opacity: 0, visibility: "hidden" }}>
            <h1 className="anim-text text-2xl md:text-3xl font-bold tracking-wide text-black dark:text-white">All Certificates</h1>
            <p className="mt-4 font-sans text-gray-700 dark:text-gray-300 text-sm md:text-base max-w-xl mx-auto italic">
              "Certificates that i get about topics that interest me."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {certificates.map((certificate) => (
              <div
                key={certificate.id}
                onClick={() => openModal(certificate)}
                className="cert-card group flex flex-col p-3 bg-white dark:bg-[#1a1a1a] rounded-xl border border-black/20 dark:border-white/20 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                style={{ opacity: 0, visibility: "hidden" }}
              >
                <div className="w-full aspect-video bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg mb-3 overflow-hidden relative flex items-center justify-center p-2">
                  <img
                    loading="lazy"
                    src={certificate.image_url}
                    alt={certificate.title}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-col flex-grow px-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {certificate.issuer}
                  </span>
                  <h3 className="text-sm font-bold font-serif leading-tight group-hover:underline decoration-2 underline-offset-2 text-black dark:text-white">
                    {certificate.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300" onClick={closeModal}></div>

          <div className="relative bg-white dark:bg-[#1a1a1a] w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-black/20 dark:border-white/20 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start p-6 border-b border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/50 rounded-t-lg shrink-0">
              <div>
                <h3 className="text-2xl font-black font-serif uppercase pr-4 leading-none mb-2 text-black dark:text-white">
                  {selectedCert?.title}
                </h3>

                <div className="flex flex-wrap gap-2 mb-2 mt-1">
                  <span className="text-xs md:text-sm font-bold bg-white dark:bg-black text-gray-500 px-2 py-1 border border-black/10 dark:border-white/10 shadow-sm rounded-sm flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-mono font-normal">
                      Issuer:
                    </span>
                    {selectedCert?.issuer}
                  </span>
                  {selectedCert?.type && (
                    <span className="text-xs md:text-sm font-bold px-2 py-1 border border-black/10 dark:border-white/10 rounded-sm bg-white dark:bg-black text-black dark:text-white flex items-center gap-1.5 shadow-sm">
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
                        <iconify-icon icon="lucide:calendar" className="w-3.5 h-3.5"></iconify-icon>
                        {formatDate(selectedCert.start_date)} &middot; No Expiration
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] uppercase tracking-wider font-mono font-normal">
                          Period:
                        </span>
                        <iconify-icon icon="lucide:calendar" className="w-3.5 h-3.5"></iconify-icon>
                        {formatDate(selectedCert.start_date)} &rarr;{" "}
                        {formatDate(selectedCert.end_date)}
                      </>
                    )}
                  </span>
                )}
              </div>

              <button
                onClick={closeModal}
                className="hidden md:block p-1 bg-red-500 hover:bg-red-600 border border-transparent text-white transition-colors rounded-full shrink-0 shadow-sm"
              >
                <iconify-icon icon="mdi:close" className="text-xl"></iconify-icon>
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="w-full aspect-video bg-gray-50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-lg mb-6 overflow-hidden flex-shrink-0 flex items-center justify-center p-4">
                <img
                  loading="lazy"
                  src={selectedCert?.image_url}
                  alt={selectedCert?.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <h4 className="font-bold font-serif uppercase text-sm mb-3 border-b border-black/20 dark:border-white/20 inline-block text-black dark:text-white">
                Description
              </h4>
              <div
                className="markdown-preview font-mono text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(selectedCert?.description) }}
              ></div>
            </div>

            <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-black/50 rounded-b-lg shrink-0">
              <div className="flex flex-col gap-3">
                {selectedCert?.credential_link && (
                  <a
                    href={selectedCert.credential_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm font-bold border border-transparent rounded bg-black hover:bg-black/90 text-white dark:bg-white dark:hover:bg-gray-200 dark:!text-black transition-colors shadow-sm"
                  >
                    <iconify-icon icon="mdi:certificate-outline" className="text-xl"></iconify-icon>
                    Verify Credential
                  </a>
                )}

                <button
                  onClick={closeModal}
                  className="w-full py-3 text-sm font-bold uppercase tracking-wider text-white bg-red-500 border border-transparent rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <iconify-icon icon="mdi:close-circle-outline" className="text-xl"></iconify-icon>
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
