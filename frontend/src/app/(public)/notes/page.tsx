import { Metadata } from "next";
import Script from "next/script";
import { getAllBlogs } from "@/lib/api/blog";
import NotesClient from "@/components/public/notes/NotesClient";

export const metadata: Metadata = {
  title: "Notes",
  description: "A collection of random thoughts, snippets, and learnings.",
};

export default async function NotesPage() {
  const notes = await getAllBlogs({ type: "note" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Notes",
    description: "A collection of random thoughts, snippets, and learnings.",
    url: "https://abdian.vercel.app/notes",
    blogPost: notes.map((note) => ({
      "@type": "BlogPosting",
      headline: note.title,
      description: note.excerpt || (note.content || "").substring(0, 150).replace(/<[^>]*>?/gm, ""),
      url: `https://abdian.vercel.app/blogs/${note.slug}`,
      datePublished: note.published_at || note.created_at,
      dateModified: note.updated_at || note.published_at || note.created_at,
    })),
  };

  return (
    <>
      <Script
        id="json-ld-notes"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NotesClient initialNotes={notes} />
    </>
  );
}
