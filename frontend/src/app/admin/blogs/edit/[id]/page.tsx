import BlogFormClient from "@/components/admin/blogs/BlogFormClient";

export const metadata = {
  title: "Edit Blog | Admin Panel",
};

export default function AdminBlogEditPage() {
  return <BlogFormClient isEdit={true} />;
}
