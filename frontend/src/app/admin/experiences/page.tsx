import { Metadata } from "next";
import { getAllExperiences } from "@/lib/api/experience";
import ExperienceClient from "@/components/admin/experiences/ExperienceClient";

export const metadata: Metadata = {
  title: "Admin Experiences - Abdian",
  description: "Admin panel for managing experiences",
};

export default async function AdminExperiencesPage() {
  const experiences = await getAllExperiences();

  return <ExperienceClient initialExperiences={experiences} />;
}
