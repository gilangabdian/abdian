import { Metadata } from "next";
import DashboardClient from "@/components/admin/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard Overview - Admin",
  description: "Admin dashboard overview for Gilang Abdian.",
};

export default function AdminDashboardPage() {
  return <DashboardClient />;
}
