import type { Metadata } from "next";
import AdminPanel from "@/components/AdminPanel";

export const metadata: Metadata = {
  title: "Admin Paneli | Patiizpet",
  description: "Patiizpet randevu yönetim paneli.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return (
    <main className="adminPageRoot">
      <AdminPanel />
    </main>
  );
}
