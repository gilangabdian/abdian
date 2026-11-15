import { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { getBlogBySlug } from "@/lib/api/blog";
import { notFound } from "next/navigation";
import SingleBlogClient from "@/components/public/blog/SingleBlogClient";
import { SITE_URL, siteConfig } from "@/config/site";

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

  const seoTitle = blog.title_en || blog.title;
  const seoContent = blog.content_en || blog.content;
  const plainTextContent = (seoContent || "").replace(/<[^>]*>?/gm, "").substring(0, 160);

  return {
    title: seoTitle,
    description: blog.excerpt || plainTextContent,
    alternates: {
      canonical: `${SITE_URL}/blogs/${blog.slug}`,
    },
    openGraph: {
      title: seoTitle,
      description: blog.excerpt || plainTextContent,
      url: `${SITE_URL}/blogs/${blog.slug}`,
      type: "article",
      publishedTime: blog.published_at || blog.created_at,
      authors: ["Gilang Abdian"],
      images: [
        {
          url: blog.cover_image_url || siteConfig.ogImage,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: blog.excerpt || plainTextContent,
      images: [blog.cover_image_url || siteConfig.ogImage],
    },
  };
}

// export async function generateStaticParams() {
//   return [{ slug: '1' }];
// }

export default async function SingleBlogPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog) {
    notFound();
  }

  const cookieStore = await cookies();
  const initialLang = cookieStore.get("blogLang")?.value || "id";

  const seoTitle = blog.title_en || blog.title;
  const seoContent = blog.content_en || blog.content;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: seoTitle,
    description: blog.excerpt || (seoContent || "").replace(/<[^>]*>?/gm, "").substring(0, 160),
    image: blog.cover_image_url || siteConfig.ogImage,
    author: {
      "@type": "Person",
      name: "Gilang Abdian",
      url: `${SITE_URL}/`,
    },
    publisher: {
      "@type": "Person",
      name: "Gilang Abdian",
      logo: {
        "@type": "ImageObject",
        url: siteConfig.icon,
      },
    },
    datePublished: blog.published_at || blog.created_at,
    dateModified: blog.updated_at || blog.published_at || blog.created_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blogs/${blog.slug}`,
    },
    articleBody: (seoContent || "").replace(/<[^>]*>?/gm, ""), // Strip HTML
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
