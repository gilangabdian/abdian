import BlogFormClient from "@/components/admin/blogs/BlogFormClient";

export const metadata = {
  title: "Write Blog | Admin Panel",
};

export default function AdminBlogCreatePage() {
  return <BlogFormClient isEdit={false} />;
}
