import { Metadata } from "next";
import { getAllArtworks } from "@/lib/api/artwork";
import AllArtworksClient from "@/components/public/artwork/AllArtworksClient";

export const metadata: Metadata = {
  title: "Artworks - Gilang Abdian",
  description: "My side hobby.",
};

export default async function ArtworksPage() {
  const artworks = await getAllArtworks();

  return <AllArtworksClient initialArtworks={artworks} />;
}
