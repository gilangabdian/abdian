import { Metadata } from "next";
import { getBlogBySlug } from "@/lib/api/blog";
import { notFound } from "next/navigation";
import SingleBlogClient from "@/components/public/blog/SingleBlogClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) {
    return {
      title: "Blog Not Found - Abdian",
    };
  }

  return {
    title: `${blog.title} - Abdian`,
    description: blog.content.substring(0, 160).replace(/<[^>]*>?/gm, ""), // Strip HTML
  };
}

export default async function SingleBlogPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  return <SingleBlogClient initialBlog={blog} />;
}
