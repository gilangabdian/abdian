import { Metadata } from "next";
import Script from "next/script";
import { getAllProjects } from "@/lib/api/project";
import AllProjectsClient from "@/components/public/project/AllProjectsClient";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "All Projects",
  description: "Gilang Abdian's projects",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "All Projects",
    description: "Projects that I created.",
    url: `${SITE_URL}/projects`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/projects#${project.slug}`,
        name: project.title,
        description: project.short_description || project.title,
      })),
    },
  };

  return (
    <>
      <Script
        id="json-ld-projects"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AllProjectsClient initialProjects={projects} />
    </>
  );
}
