import { Metadata } from "next";
import ProfileClient from "@/components/admin/profile/ProfileClient";

export const metadata: Metadata = {
  title: "Profile Management - Admin",
  description: "Admin profile management for Gilang Abdian.",
};

export default function AdminProfilePage() {
  return <ProfileClient />;
}
