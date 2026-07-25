import { Metadata } from "next";
import { getAllBlogs } from "@/lib/api/blog";
import AllBlogsClient from "@/components/public/blog/AllBlogsClient";

export const metadata: Metadata = {
  title: "Blog - Gilang Abdian",
  description: "A poorly writer. Trying to write about something that interest me",
};

export default async function BlogPage() {
  const blogs = await getAllBlogs();

  return <AllBlogsClient initialBlogs={blogs} />;
}
