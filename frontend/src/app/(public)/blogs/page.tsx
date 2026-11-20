import { Metadata } from "next";
import Script from "next/script";
import { getAllBlogs } from "@/lib/api/blog";
import AllBlogsClient from "@/components/public/blog/AllBlogsClient";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "Blog",
  description: "Gilang Abdian's blogs",
};

export default async function BlogPage() {
  const blogs = await getAllBlogs();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog",
    description: "A poorly writer. Trying to write about something that interest me",
    url: `${SITE_URL}/blogs`,
    blogPost: blogs.map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title_en || blog.title,
      description: blog.excerpt || (blog.content_en || blog.content || "").substring(0, 150).replace(/<[^>]*>?/gm, ""),
      url: `${SITE_URL}/blogs/${blog.slug}`,
      datePublished: blog.published_at || blog.created_at,
      dateModified: blog.updated_at || blog.published_at || blog.created_at,
    })),
  };

  return (
    <>
      <Script
        id="json-ld-blogs"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllBlogsClient initialBlogs={blogs} />
    </>
  );
}
