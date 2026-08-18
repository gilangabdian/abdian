import { Metadata } from "next";
import { getAllBlogs } from "@/lib/api/blog";
import NotesClient from "@/components/public/notes/NotesClient";

export const metadata: Metadata = {
  title: "Notes - Gilang Abdian",
  description: "A collection of random thoughts, snippets, and learnings.",
};

export default async function NotesPage() {
  const notes = await getAllBlogs({ type: "note" });

  return <NotesClient initialNotes={notes} />;
}
