import { Metadata } from "next";
import { getAllPhotos } from "@/lib/api/photo";
import AllPhotosClient from "@/components/public/photo/AllPhotosClient";

export const metadata: Metadata = {
  title: "Photos - Gilang Abdian",
  description: "My personal photos collection.",
};

export default async function PhotosPage() {
  const photos = await getAllPhotos();

  return <AllPhotosClient initialPhotos={photos} />;
}
