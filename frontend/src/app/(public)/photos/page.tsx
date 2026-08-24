import { Metadata } from "next";
import { getAllPhotos } from "@/lib/api/photo";
import AllPhotosClient from "@/components/public/photo/AllPhotosClient";

export const metadata: Metadata = {
  title: "Photos",
  description: "My personal photos collection.",
};

export default async function PhotosPage() {
  const photos = await getAllPhotos();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Photos",
    description: "My personal photos collection.",
    url: "https://abdian.vercel.app/photos",
    mainEntity: {
      "@type": "ImageGallery",
      image: photos.map((photo) => ({
        "@type": "ImageObject",
        url: photo.image_url,
        caption: photo.title,
        description: photo.description || photo.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllPhotosClient initialPhotos={photos} />
    </>
  );
}
