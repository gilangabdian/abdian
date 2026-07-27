import { Metadata } from "next";
import { getProfile } from "@/lib/api/profile";
import { getAboutPage } from "@/lib/api/about";
import AboutClient from "@/components/public/about/AboutClient";

export const metadata: Metadata = {
  title: "About - Gilang Abdian",
  description: "About Gilang Abdian.",
};

export default async function AboutPage() {
  const profile = await getProfile();
  let aboutContent: string | null = null;
  let aboutUpdatedAt: string | null = null;

  try {
    const aboutData = await getAboutPage();
    if (aboutData?.data?.content) {
      aboutContent = aboutData.data.content;
      aboutUpdatedAt = aboutData.data.updated_at;
    }
  } catch (e) {
    // Silently fail, fallback to hardcoded
  }

  return (
    <AboutClient
      initialProfile={profile}
      aboutContent={aboutContent}
      aboutUpdatedAt={aboutUpdatedAt}
    />
  );
}
