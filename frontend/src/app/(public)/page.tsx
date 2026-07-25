import { getProfile } from "@/lib/api/profile";
import { getSkills } from "@/lib/api/skill";
import { getAllProjects } from "@/lib/api/project";
import { getAllCertificates } from "@/lib/api/certificate";
import { getAllExperiences } from "@/lib/api/experience";
import HomepageClient from "@/components/public/home/HomepageClient";

export default async function Home() {
  const [profile, skills, projects, certificates, experiences] = await Promise.all([
    getProfile(),
    getSkills(),
    getAllProjects({ featured: "1" }),
    getAllCertificates({ featured: "1" }),
    getAllExperiences({ active: "1" }),
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
