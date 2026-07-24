import { Metadata } from "next";
import { getAllBlogs } from "@/lib/api/blog";
import AllBlogsClient from "@/components/public/blog/AllBlogsClient";

export const metadata: Metadata = {
  title: "Blog - Abdian",
  description: "Read my latest articles, insights, and thoughts on software engineering and design.",
};

export default async function BlogPage() {
  const blogs = await getAllBlogs();

  return <AllBlogsClient initialBlogs={blogs} />;
}
