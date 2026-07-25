"use client";

import { useState, useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import gsap from "gsap";
import ArtworkControls from "./ArtworkControls";
import { Artwork } from "@/types";

interface AllArtworksClientProps {
  initialArtworks: Artwork[];
}

export default function AllArtworksClient({ initialArtworks }: AllArtworksClientProps) {
  const [artworks] = useState<Artwork[]>(initialArtworks);
  const [isSquareGrid, setIsSquareGrid] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    NProgress.done();
  }, []);

  useEffect(() => {
    if (artworks.length > 0) {
      // Delay slightly to ensure DOM is ready
      const timer = setTimeout(() => {
        gsap.fromTo(
          ".controls-container",
          { y: -10, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.5, ease: "power2.out" },
        );
        gsap.fromTo(
          ".artwork-item, .thank-you-msg",
          { y: 20, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.05,
            clearProps: "all",
          },
        );
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [artworks.length]);

  const openModal = (url: string) => setSelectedImage(url);
  const closeModal = () => setSelectedImage(null);

  return (
    <div className="pt-28 md:pt-36 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-4 md:px-16 lg:px-7">
        {artworks.length === 0 && (
          <div className="text-center font-sans text-neutral-500 py-12">No artworks found.</div>
        )}

        {artworks.length > 0 && <ArtworkControls isSquareGrid={isSquareGrid} onToggle={setIsSquareGrid} />}
      </div>

      <div className={`max-w-7xl mx-auto ${isSquareGrid ? "px-4 md:px-8 lg:px-8" : "px-8 md:px-16 lg:px-16"}`}>
        {artworks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                onClick={() => openModal(artwork.image_url)}
                className={`artwork-item bg-white dark:bg-black flex items-center justify-center ${
                  isSquareGrid ? "aspect-square overflow-hidden" : ""
                }`}
                style={{ opacity: 0, visibility: "hidden" }}>
                <img
                  src={artwork.image_url}
                  alt={artwork.title || "Artwork"}
                  loading="lazy"
                  className={`w-full ${isSquareGrid ? "h-full object-cover" : "h-auto"}`}
                />
              </div>
            ))}
          </div>
        )}

        {artworks.length > 0 && (
          <div
            className="thank-you-msg mt-16 text-center text-neutral-500 dark:text-neutral-400 font-sans text-sm tracking-wide"
            style={{ opacity: 0, visibility: "hidden" }}>
            thank you
          </div>
        )}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeModal}>
          <img src={selectedImage} className="w-full h-full object-contain" alt="Enlarged Artwork" />
        </div>
      )}
    </div>
  );
}
