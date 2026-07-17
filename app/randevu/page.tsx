import type { Metadata } from "next";
import Image from "next/image";
import { CalendarCheck, Info } from "lucide-react";
import BookingForm from "@/components/BookingForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Online Randevu | Patiizpet İzmir Pet Kuaförü",
  description:
    "Patiizpet İzmir pet kuaförü için online randevu alın. Dolu saatleri görün, uygun bakım saatini seçin.",
  alternates: { canonical: "/randevu" }
};

export default function BookingPage() {
  return (
    <main>
      <Header solid />
      <section className="pageHero compactHero">
        <span className="sectionLabel">Online randevu</span>
        <h1>Uygun günü ve saati seçin.</h1>
        <p>
          Sistem aynı tarih ve saat aralığına ikinci randevu alınmasını engeller. Talebiniz
          alındıktan sonra kısa süre içinde teyit için iletişime geçeriz.
        </p>
      </section>

      <section className="section bookingSection">
        <div className="bookingIntro">
          <div className="imageFrame bookingImage">
            <Image
              src="/happy-groomed-dog.png"
              alt="Online randevu sonrası mutlu pet bakım deneyimi"
              fill
              sizes="(max-width: 900px) 100vw, 36vw"
            />
          </div>
          <CalendarCheck size={28} />
          <h2>Randevu notu önemli</h2>
          <p>
            Dostunuzun tüyünde açılma, cilt hassasiyeti, tıraş korkusu veya özel davranış durumu
            varsa not alanına yazın. Bu bilgiler süreyi ve bakım planını doğru belirlememizi sağlar.
          </p>
          <div className="infoBox">
            <Info size={18} />
            <span>Örnek: 12:00 - 13:00 doluysa bu aralık müşteri ve admin tarafında kapalı kalır.</span>
          </div>
        </div>
        <BookingForm />
      </section>
      <Footer />
    </main>
  );
}
