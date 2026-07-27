import AboutFormClient from "@/components/admin/about/AboutFormClient";

export const metadata = {
  title: "Edit About Page - Admin - Gilang Abdian",
  description: "Edit the about page content for your portfolio.",
};

export default function AboutPage() {
  return (
    <div className="p-4 md:p-8">
      <AboutFormClient />
    </div>
  );
}
