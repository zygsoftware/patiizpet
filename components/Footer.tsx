import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerInner">
        <div>
          <Link className="footerBrand" href="/" aria-label="Patiizpet ana sayfa">
            <Image src="/logo-buyuk.png" alt="Patiizpet Pet Kuaförü" width={1254} height={1254} className="footerLogo" />
          </Link>
          <p>{site.description}</p>
        </div>
        <div className="footerLinks">
          <Link href="/hizmetler">Hizmetler</Link>
          <Link href="/randevu">Online Randevu</Link>
          <Link href="/hakkimizda">Hakkımızda</Link>
          <Link href="/iletisim">İletişim</Link>
          <Link href="/admin">Admin</Link>
        </div>
        <address>
          <a href={`tel:${site.phone}`}>
            <Phone size={16} /> {site.phoneDisplay}
          </a>
          <a href={`mailto:${site.email}`}>
            <Mail size={16} /> {site.email}
          </a>
          <span>
            <MapPin size={16} /> {site.displayAddress}
          </span>
          <a href={site.instagram} target="_blank" rel="noreferrer">
            <Instagram size={16} /> {site.instagramHandle}
          </a>
          <a href={site.facebook} target="_blank" rel="noreferrer">
            <MessageCircle size={16} /> Facebook
          </a>
        </address>
      </div>
      <div className="footerBottom">© {new Date().getFullYear()} Patiizpet. Tüm hakları saklıdır.</div>
    </footer>
  );
}
