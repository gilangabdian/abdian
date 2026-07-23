import { Icon } from "@iconify/react";
export default function Home() {
  return (
    <div>
      <div className="alert">
        {/* Menggunakan format string "nama-koleksi:nama-ikon" */}
        <Icon icon="mdi-light:alert" width="24" height="24" />
        Important notice with alert icon!
      </div>
    </div>
  );
}
