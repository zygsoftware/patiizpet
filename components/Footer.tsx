import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footerInner">
        <div>
          <Link className="footerBrand" href="/" aria-label="Patiizpet ana sayfa">
            <Image src="/logo-emblem.png" alt="Patiizpet Pet Kuaförü" width={520} height={520} className="footerLogo" />
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
            <MapPin size={16} /> {site.address}
          </span>
          <a href={site.instagram}>
            <Instagram size={16} /> Instagram
          </a>
        </address>
      </div>
      <div className="footerBottom">© {new Date().getFullYear()} Patiizpet. Tüm hakları saklıdır.</div>
    </footer>
  );
}
