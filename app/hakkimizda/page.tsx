import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { beforeAfter } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hakkımızda | Patiizpet İzmir Pet Kuaförü",
  description:
    "Patiizpet, İzmir'de kedi ve köpekler için sakin, hijyenik ve randevulu pet kuaförü deneyimi sunar.",
  alternates: { canonical: "/hakkimizda" }
};

export default function AboutPage() {
  return (
    <main>
      <Header solid />
      <section className="pageHero">
        <span className="sectionLabel">Hakkımızda</span>
        <h1>Bakımı, dostunuzun konforunu merkeze alarak planlıyoruz.</h1>
        <p>
          Patiizpet; acele edilmeden, kalabalık bekleme alanları oluşturmadan, randevu saati ve
          bakım notları net olan bir pet kuaförü deneyimi için tasarlandı.
        </p>
      </section>

      <section className="section visualSplit reverse">
        <div className="storyPanel">
          <span className="sectionLabel">Butik deneyim</span>
          <h2>Kalabalık değil, kontrollü ve sakin bir bakım ortamı.</h2>
          <p>
            Randevu saatlerini çakıştırmadan planlamamızın sebebi yalnızca takvim düzeni değil;
            dostunuzun ses, bekleme ve temas stresini azaltmak. Premium his bizim için önce güvenle
            başlar.
          </p>
        </div>
        <div className="imageFrame wideImage">
          <Image
            src="/happy-groomed-dog.png"
            alt="Patiizpet'te bakımı tamamlanmış mutlu köpek"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="section beforeAfter">
        <div className="baText">
          <span className="sectionLabel">Öncesi / Sonrası</span>
          <h2>Fark, konfordan ve doğru bakımdan doğar.</h2>
          <p>
            Amacımız yalnızca güzel bir görünüm değil; tüy sağlığını koruyan, dostunuzun rahat
            hareket etmesini sağlayan bir sonuç. Aşağıda tipik bir bakım dönüşümünü görebilirsiniz.
          </p>
        </div>
        <div className="baPair">
          <figure className="baCard">
            <Image src={beforeAfter.before.src} alt={beforeAfter.before.alt} fill sizes="(max-width: 960px) 50vw, 30vw" />
            <figcaption>Öncesi</figcaption>
          </figure>
          <figure className="baCard">
            <Image src={beforeAfter.after.src} alt={beforeAfter.after.alt} fill sizes="(max-width: 960px) 50vw, 30vw" />
            <figcaption>Sonrası</figcaption>
          </figure>
        </div>
      </section>

      <section className="section valuesGrid">
        <article className="detailCard liftCard">
          <HeartHandshake size={26} />
          <h2>Sakin yaklaşım</h2>
          <p>İlk kez gelen, hassas veya tıraşa alışık olmayan dostlarda tempoyu onların tepkisine göre ayarlarız.</p>
        </article>
        <article className="detailCard liftCard">
          <ShieldCheck size={26} />
          <h2>Hijyen disiplini</h2>
          <p>Ekipman ve alan temizliği her randevunun ayrılmaz parçasıdır. Bakım alanını düzenli ve kontrollü tutarız.</p>
        </article>
        <article className="detailCard liftCard">
          <Sparkles size={26} />
          <h2>Estetik sonuç</h2>
          <p>Günlük yaşamda kolay taranabilen, dostunuzun yüz ifadesini ve hareket rahatlığını koruyan sonuçlar hedefleriz.</p>
        </article>
      </section>

      <section className="section processSection">
        <span className="sectionLabel">Randevu süreci</span>
        <h2>Dört adımda net ve stressiz bakım</h2>
        <ol className="processList">
          <li>
            <strong>Randevu oluşturun.</strong>
            <span>Uygun tarih, saat, hizmet ve notlarınızı iletin.</span>
          </li>
          <li>
            <strong>Ön değerlendirme yapalım.</strong>
            <span>Tüy durumu, hassasiyet ve özel ihtiyaçları kontrol edelim.</span>
          </li>
          <li>
            <strong>Bakımı tamamlayalım.</strong>
            <span>Dostunuzun konforuna göre yıkama, kurutma, tıraş ve son bakım uygulanır.</span>
          </li>
          <li>
            <strong>Son önerileri paylaşalım.</strong>
            <span>Evde tarama, sonraki randevu aralığı ve bakım ipuçlarını aktarırız.</span>
          </li>
        </ol>
        <Link className="primaryButton" href="/randevu">
          Online Randevu Al
        </Link>
      </section>
      <Footer />
    </main>
  );
}
