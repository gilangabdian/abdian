import { Metadata } from "next";
import Script from "next/script";
import { getAllArtworks } from "@/lib/api/artwork";
import AllArtworksClient from "@/components/public/artwork/AllArtworksClient";

export const metadata: Metadata = {
  title: "Artworks",
  description: "My side hobby.",
};

export default async function ArtworksPage() {
  const artworks = await getAllArtworks();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Artworks",
    description: "My side hobby.",
    url: "https://abdian.vercel.app/artworks",
    mainEntity: {
      "@type": "ImageGallery",
      image: artworks.map((artwork) => ({
        "@type": "ImageObject",
        url: artwork.image_url,
        caption: artwork.title,
        description: artwork.description || artwork.title,
      })),
    },
  };

  return (
    <>
      <Script
        id="json-ld-artworks"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllArtworksClient initialArtworks={artworks} />
    </>
  );
}
