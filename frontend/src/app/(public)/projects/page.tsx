import { Metadata } from "next";
import { getAllProjects } from "@/lib/api/project";
import AllProjectsClient from "@/components/public/project/AllProjectsClient";

export const metadata: Metadata = {
  title: "All Projects",
  description: "Projects that I created.",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Projects",
    description: "Projects that I created.",
    url: "https://abdian.vercel.app/projects",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://abdian.vercel.app/projects#${project.slug}`,
        name: project.title,
        description: project.short_description || project.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllProjectsClient initialProjects={projects} />
    </>
  );
}
