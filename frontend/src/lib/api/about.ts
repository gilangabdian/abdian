const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Public: Fetch about page content from the API.
 * This does not require authentication.
 */
export async function getAboutPage() {
  const response = await fetch(`${API_URL}/about-page`, {
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error("Failed to fetch about page");
  }

  return response.json();
}

/**
 * Admin: Update about page content.
 */
export async function updateAboutPage(token: string, content: string) {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("_method", "PUT");

  const response = await fetch(`${API_URL}/admin/about-page`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  return response;
}


