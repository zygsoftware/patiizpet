"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, Menu, Phone, X } from "lucide-react";
import { site } from "@/lib/site";

const navItems = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/randevu", label: "Randevu" },
  { href: "/iletisim", label: "İletişim" }
];

export default function Header({ solid = false }: { solid?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className={`siteHeader${solid ? " solid" : ""}${open ? " open" : ""}`}>
      <div className="navShell">
        <Link className="brand" href="/" aria-label="Patiizpet ana sayfa" onClick={() => setOpen(false)}>
          <Image src="/logo-mark.png" alt="Patiizpet" width={720} height={158} priority className="brandLogo" />
        </Link>

        <nav className="mainNav" aria-label="Ana menü">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="headerActions">
          <a className="iconTextButton ghostButton" href={`tel:${site.phone}`} aria-label="Patiizpet telefon">
            <Phone size={17} />
            <span className="hideSm">{site.phoneDisplay}</span>
          </a>
          <Link className="iconTextButton primaryButton smallButton" href="/randevu" onClick={() => setOpen(false)}>
            <CalendarCheck size={17} />
            <span>Randevu Al</span>
          </Link>
          <button
            type="button"
            className="navToggle"
            aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
