import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Clock, Scissors } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { services, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Pet Kuaför Hizmetleri | İzmir Patiizpet",
  description:
    "İzmir Patiizpet pet kuaförü hizmetleri: komple bakım, makas tıraşı, banyo, kurutma, tırnak, pati ve kulak bakımı.",
  alternates: { canonical: "/hizmetler" }
};

export default function ServicesPage() {
  return (
    <main>
      <Header solid />
      <section className="pageHero">
        <span className="sectionLabel">Hizmetler</span>
        <h1>İzmir'de dostunuzun ihtiyacına göre pet kuaför hizmetleri</h1>
        <p>
          Bakım süresini ve uygulamayı dostunuzun türüne, tüy yapısına, mizacına ve bakım geçmişine
          göre planlıyoruz.
        </p>
      </section>

      <section className="section visualSplit">
        <div className="imageFrame wideImage">
          <Image
            src="/grooming-tools-premium.png"
            alt="Patiizpet premium bakım ekipmanları ve hijyenik hazırlık alanı"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
        <div className="storyPanel">
          <span className="sectionLabel">Hizmet seçimi</span>
          <h2>Doğru hizmet, doğru süre ve doğru beklentiyle başlar.</h2>
          <p>
            Tüy açma, makas tıraşı, banyo veya kısa bakım fark etmeksizin her randevuyu dostunuzun
            konforuna göre planlarız. Emin değilseniz online formdaki not alanına durumu yazmanız
            yeterli.
          </p>
        </div>
      </section>

      <section className="section serviceDetailGrid">
        {services.map((service) => (
          <article className="detailCard liftCard" key={service.slug}>
            <div className="cardIcon">
              <Scissors size={22} />
            </div>
            <h2>{service.title}</h2>
            <p>{service.details}</p>
            <div className="metaLine">
              <Clock size={16} /> Ortalama süre: {service.duration}
            </div>
            <div className="metaLine">
              <CheckCircle2 size={16} /> Online randevuya uygundur
            </div>
          </article>
        ))}
      </section>

      <section className="ctaBand">
        <div>
          <span className="sectionLabel">Planlama</span>
          <h2>Hangi hizmeti seçeceğinizden emin değilseniz not alanına yazın.</h2>
          <p>{site.phoneDisplay} üzerinden de hızlıca bilgi alabilirsiniz.</p>
        </div>
        <Link className="primaryButton" href="/randevu">
          Randevu Al
        </Link>
      </section>
      <Footer />
    </main>
  );
}
