import { Metadata } from "next";
import { getAllBlogs } from "@/lib/api/blog";
import AllBlogsClient from "@/components/public/blog/AllBlogsClient";

export const metadata: Metadata = {
  title: "Blog",
  description: "A poorly writer. Trying to write about something that interest me",
};

export default async function BlogPage() {
  const blogs = await getAllBlogs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog",
    description: "A poorly writer. Trying to write about something that interest me",
    url: "https://abdian.vercel.app/blogs",
    blogPost: blogs.map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      description: blog.excerpt || blog.content.substring(0, 150).replace(/<[^>]*>?/gm, ""),
      url: `https://abdian.vercel.app/blogs/${blog.slug}`,
      datePublished: blog.published_at || blog.created_at,
      dateModified: blog.updated_at || blog.published_at || blog.created_at,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllBlogsClient initialBlogs={blogs} />
    </>
  );
}
