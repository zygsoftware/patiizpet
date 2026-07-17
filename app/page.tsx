import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Scissors, ShieldCheck, Timer } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import JsonLd from "@/components/JsonLd";
import { beforeAfter, gallery, services, site, testimonials } from "@/lib/site";

export const metadata: Metadata = {
  title: "Patiizpet | İzmir Pet Kuaförü ve Online Randevu",
  description:
    "İzmir'de randevulu pet kuaförü: köpek ve kedi bakım, makas tıraşı, banyo, tırnak, pati ve kulak bakımı. Online randevunuzu hemen oluşturun.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Patiizpet | İzmir Pet Kuaförü",
    description: site.description,
    url: site.url,
    images: ["/pet-grooming-hero.png"]
  }
};

export default function Home() {
  return (
    <main className="flowPage warmHome">
      <JsonLd />
      <section className="hero warmHero">
        <HeroSlider />
        <div className="heroOverlay" />
        <Header />
        <div className="homeFloat homeFloatOne" aria-hidden="true">
          <Image src="/heroes/hero-3.png" alt="" fill sizes="220px" priority />
        </div>
        <div className="heroContent">
          <div className="heroCopy">
            <h1>Dostunuz için sakin ve özenli bakım.</h1>
            <p>
              Patiizpet, kedi ve köpekler için temiz, huzurlu ve randevulu bir bakım deneyimi sunar.
              Gereksiz bekleme yok; dostunuzun ihtiyacına göre nazik bir bakım ritmi var.
            </p>
            <div className="heroButtons">
              <Link className="primaryButton" href="/randevu">
                <CalendarCheck size={18} /> Online Randevu Al
              </Link>
              <Link className="secondaryButton" href="/hizmetler">
                Hizmetleri İncele
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section introGrid scrollSection simpleIntro">
        <div className="homeFloat homeFloatTwo" aria-hidden="true">
          <Image src="/heroes/hero-1.png" alt="" fill sizes="180px" />
        </div>
        <div>
          <span className="sectionLabel">Yaklaşımımız</span>
          <h2>Dostunuzun rahat edeceği sakin bir bakım ritmi kurarız.</h2>
        </div>
        <div className="richText">
          <p>
            Her petin tüy yapısı, hassasiyeti ve karakteri farklıdır. Randevu öncesi ihtiyacını
            anlar, bakımı aceleye getirmeden planlarız. Amacımız sadece güzel görünmesi değil,
            bakım gününden iyi hislerle ayrılmasıdır.
          </p>
        </div>
      </section>

      <section className="section imageStory scrollSection calmStory">
        <div className="imageFrame tallImage revealUp">
          <Image
            src="/happy-groomed-dog.png"
            alt="Bakımı tamamlanmış mutlu köpek ve pet kuaförü karşılama alanı"
            fill
            sizes="(max-width: 900px) 100vw, 48vw"
          />
        </div>
        <div className="storyPanel revealUp delayOne">
          <span className="sectionLabel">Salon hissi</span>
          <h2>Sade, temiz ve güven veren bir bakım alanı.</h2>
          <p>
            Ses, bekleme süresi, temas hassasiyeti ve tüy durumu birlikte değerlendirilir. Her
            randevu öncesi alan ve ekipman hazırlanır; bakım sonunda evde devam için net öneriler
            paylaşılır.
          </p>
        </div>
      </section>

      <section className="section scrollSection softServices">
        <div className="sectionHead">
          <div>
            <span className="sectionLabel">Hizmetler</span>
            <h2>İhtiyaca göre planlanan bakım seçenekleri</h2>
          </div>
          <Link className="secondaryButton" href="/hizmetler">
            Tüm Hizmetler
          </Link>
        </div>
        <div className="serviceGrid four">
          {services.map((service) => (
            <article className="serviceCard liftCard" key={service.slug}>
              <Scissors size={20} />
              <h3>{service.title}</h3>
              <p>{service.summary}</p>
              <small>{service.duration}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section salonFeature scrollSection softFeature">
        <div className="storyPanel revealUp">
          <span className="sectionLabel">Randevulu bakım</span>
          <h2>Her saat aralığı tek dostumuza ayrılır.</h2>
          <div className="featureList">
            <div>
              <ShieldCheck size={20} />
              <span>Temiz ekipman ve kontrollü çalışma alanı</span>
            </div>
            <div>
              <Timer size={20} />
              <span>Tek saat aralığına tek randevu prensibi</span>
            </div>
            <div>
              <CheckCircle2 size={20} />
              <span>Dolu saatleri otomatik engelleyen randevu sistemi</span>
            </div>
          </div>
        </div>
        <div className="imageFrame wideImage revealUp delayOne">
          <Image
            src="/grooming-tools-premium.png"
            alt="Premium pet kuaförü bakım ekipmanları, havlular ve doğal ürünler"
            fill
            sizes="(max-width: 900px) 100vw, 48vw"
          />
        </div>
      </section>

      <section className="section galleryFlow scrollSection simpleGallery">
        <div className="sectionHead">
          <div>
            <span className="sectionLabel">Galeri</span>
            <h2>Salondan sıcak kareler</h2>
          </div>
        </div>
        <div className="galleryGrid">
          {gallery.map((item, index) => (
            <figure className="galleryItem" key={item.src}>
              <Image
                src={item.src}
                alt={item.alt}
                fill
                sizes="(max-width: 620px) 100vw, (max-width: 960px) 50vw, 33vw"
                loading={index < 2 ? undefined : "lazy"}
              />
            </figure>
          ))}
        </div>
      </section>

      <section className="section beforeAfterStory scrollSection">
        <div className="sectionHead">
          <div>
            <span className="sectionLabel">Önce / Sonra</span>
            <h2>Bakım farkını net gösteren dönüşümler</h2>
          </div>
          <Link className="secondaryButton" href="/randevu">
            Randevu Planla
          </Link>
        </div>
        <div className="beforeAfterGrid">
          <figure>
            <Image src={beforeAfter.before.src} alt={beforeAfter.before.alt} fill sizes="(max-width: 900px) 50vw, 36vw" />
            <figcaption>Önce</figcaption>
          </figure>
          <figure>
            <Image src={beforeAfter.after.src} alt={beforeAfter.after.alt} fill sizes="(max-width: 900px) 50vw, 36vw" />
            <figcaption>Sonra</figcaption>
          </figure>
        </div>
      </section>

      <section className="section scrollSection warmTestimonials">
        <div className="sectionHead">
          <div>
            <span className="sectionLabel">Yorumlar</span>
            <h2>Dostların ve sahiplerinin deneyimi</h2>
          </div>
        </div>
        <div className="testimonialGrid">
          {testimonials.map((item) => (
            <blockquote className="testimonialCard" key={item.name}>
              <p>{item.quote}</p>
              <footer className="testimonialFoot">
                <span className="testimonialAvatar">
                  <Image src={item.avatar} alt={item.name} fill sizes="46px" />
                </span>
                <span>
                  <strong>{item.name}</strong>
                  <span>{item.pet}</span>
                </span>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="ctaBand scrollSection simpleCta">
        <div>
          <span className="sectionLabel">Online randevu</span>
          <h2>Dostunuz için uygun günü seçin.</h2>
          <p>Müsait saatleri görün, bakım notunuzu yazın, talebinizi kolayca oluşturun.</p>
        </div>
        <Link className="primaryButton" href="/randevu">
          <CalendarCheck size={18} /> Randevu Oluştur
        </Link>
      </section>
      <Footer />
    </main>
  );
}
