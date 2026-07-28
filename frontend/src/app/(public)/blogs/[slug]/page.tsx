import { Metadata } from "next";
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

  return {
    title: `${blog.title} - Abdian`,
    description: blog.content.substring(0, 160).replace(/<[^>]*>?/gm, ""), // Strip HTML
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

  return <SingleBlogClient initialBlog={blog} initialLang={initialLang} />;
}
