import Hero from "@/components/public/home/Hero";
import Tech from "@/components/public/home/Tech";
import { getProfile } from "@/lib/api/profile";
import { getSkills } from "@/lib/api/skill";

export default async function Home() {
  const [profile, skills] = await Promise.all([getProfile(), getSkills()]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-black dark:text-white font-sans overflow-x-hidden flex flex-col pb-24 md:pb-0">
      <div className="animate-in">
        <Hero profile={profile} />
        <Tech skills={skills} profile={profile} />
        {/* Placeholder for Featured Project, Certificate, etc */}
      </div>
    </div>
  );
}
