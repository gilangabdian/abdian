import { getProfile, sanitizePublicProfile } from "@/lib/api/profile";
import { getSkills } from "@/lib/api/skill";
import { getAllProjects } from "@/lib/api/project";
import { getAllCertificates } from "@/lib/api/certificate";
import { getAllExperiences } from "@/lib/api/experience";
import HomepageClient from "@/components/public/home/HomepageClient";

export default async function Home() {
  const rawProfile = await getProfile();
  const profile = sanitizePublicProfile(rawProfile);
  const about = profile?.about;

  const showTech = Boolean(about && about.show_tech_on_home !== false);
  const showFeaturedProjects = Boolean(about && about.show_featured_projects_on_home !== false);
  const showFeaturedCertificates = Boolean(about && about.show_featured_certificates_on_home !== false);
  const showExperiences = Boolean(about && about.show_experiences_on_home !== false);

  const [skills, projects, certificates, experiences] = await Promise.all([
    showTech ? getSkills() : Promise.resolve([]),
    showFeaturedProjects ? getAllProjects({ featured: "1" }) : Promise.resolve([]),
    showFeaturedCertificates ? getAllCertificates({ featured: "1" }) : Promise.resolve([]),
    showExperiences ? getAllExperiences({ active: "1" }) : Promise.resolve([]),
  ]);

  return (
    <HomepageClient
      profile={profile}
      skills={skills || []}
      projects={projects || []}
      certificates={certificates || []}
      experiences={experiences || []}
    />
  );
}
