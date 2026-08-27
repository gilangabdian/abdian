import { Metadata } from "next";
import { getAllContacts } from "@/lib/api/contact";
import AllContactsClient from "@/components/public/contact/AllContactsClient";

export const metadata: Metadata = {
  title: "Contacts",
  description: "Find me on social media.",
};

import { notFound } from "next/navigation";
import { getProfile } from "@/lib/api/profile";

export default async function ContactsPage() {
  const profile = await getProfile();

  if (profile?.about?.is_contacts_page_active === false) {
    notFound();
  }

  const contacts = await getAllContacts();

  return <AllContactsClient initialContacts={contacts} />;
}
