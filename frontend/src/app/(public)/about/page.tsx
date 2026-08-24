import { Metadata } from "next";
import Script from "next/script";
import { getProfile } from "@/lib/api/profile";
import { getAboutPage } from "@/lib/api/about";
import AboutClient from "@/components/public/about/AboutClient";

export const metadata: Metadata = {
  title: "About",
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
    console.error(e);
    // Silently fail, fallback to hardcoded
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    dateModified: aboutUpdatedAt ? new Date(aboutUpdatedAt).toISOString() : undefined,
    mainEntity: {
      "@type": "Person",
      name: profile?.about?.name || "Gilang Abdian",
      jobTitle: profile?.about?.job_title || "Software Engineer",
      description: aboutContent ? aboutContent.substring(0, 150).replace(/<[^>]*>?/gm, "") : "About Gilang Abdian",
      image: "https://abdian.vercel.app/hide-tokyo-ghoul.png",
      url: "https://abdian.vercel.app/about",
    },
  };

  return (
    <>
      <Script
        id="json-ld-about"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutClient initialProfile={profile} aboutContent={aboutContent} aboutUpdatedAt={aboutUpdatedAt} />
    </>
  );
}
