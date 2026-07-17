import type { Metadata } from "next";
import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { faq, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "İletişim | Patiizpet İzmir Pet Kuaförü",
  description:
    "Patiizpet İzmir pet kuaförü iletişim bilgileri, telefon, e-posta, adres ve sık sorulan sorular.",
  alternates: { canonical: "/iletisim" }
};

export default function ContactPage() {
  return (
    <main>
      <Header solid />
      <section className="pageHero">
        <span className="sectionLabel">İletişim</span>
        <h1>Randevu, hizmet ve bakım sorularınız için bize ulaşın.</h1>
        <p>Online randevu en hızlı yoldur; acil bilgi için telefonla da ulaşabilirsiniz.</p>
      </section>

      <section className="section contactGrid">
        <div className="contactCard">
          <a href={`tel:${site.phone}`}>
            <Phone size={20} /> {site.phoneDisplay}
          </a>
          <a href={`mailto:${site.email}`}>
            <Mail size={20} /> {site.email}
          </a>
          <span>
            <MapPin size={20} /> {site.address}
          </span>
          <a href={site.instagram}>
            <Instagram size={20} /> Instagram
          </a>
          <Link className="primaryButton" href="/randevu">
            Online Randevu Al
          </Link>
        </div>
        <div className="faqList">
          {faq.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
