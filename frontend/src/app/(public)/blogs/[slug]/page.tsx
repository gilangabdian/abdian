import { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
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

  const plainTextContent = (blog.content || "").replace(/<[^>]*>?/gm, "").substring(0, 160);

  return {
    title: blog.title,
    description: blog.excerpt || plainTextContent,
    alternates: {
      canonical: `https://abdian.vercel.app/blogs/${blog.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: blog.excerpt || plainTextContent,
      url: `https://abdian.vercel.app/blogs/${blog.slug}`,
      type: "article",
      publishedTime: blog.published_at || blog.created_at,
      authors: ["Gilang Abdian"],
      images: [
        {
          url: blog.cover_image_url || "https://abdian.vercel.app/hide-tokyo-ghoul.png",
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt || plainTextContent,
      images: [blog.cover_image_url || "https://abdian.vercel.app/hide-tokyo-ghoul.png"],
    },
  };
}

export async function generateStaticParams() {
  return [{ slug: '1' }];
}

export default async function SingleBlogPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const cookieStore = await cookies();
  const initialLang = cookieStore.get("blogLang")?.value || "id";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt || (blog.content || "").replace(/<[^>]*>?/gm, "").substring(0, 160),
    image: blog.cover_image_url || "https://abdian.vercel.app/hide-tokyo-ghoul.png",
    author: {
      "@type": "Person",
      name: "Gilang Abdian",
      url: "https://abdian.vercel.app/",
    },
    publisher: {
      "@type": "Person",
      name: "Gilang Abdian",
      logo: {
        "@type": "ImageObject",
        url: "https://abdian.vercel.app/icon.svg",
      },
    },
    datePublished: blog.published_at || blog.created_at,
    dateModified: blog.updated_at || blog.published_at || blog.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://abdian.vercel.app/blogs/${blog.slug}`,
    },
    articleBody: (blog.content || "").replace(/<[^>]*>?/gm, ""), // Strip HTML
  };

  return (
    <>
      <Script
        id={`json-ld-blog-${blog.slug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SingleBlogClient initialBlog={blog} initialLang={initialLang} />
    </>
  );
}
