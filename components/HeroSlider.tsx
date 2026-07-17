"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const heroSlides = [
  "/slider-1.png",
  "/slider-2.png",
  "/pet-grooming-hero.png"
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % heroSlides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="heroSlider" aria-hidden="true">
      {heroSlides.map((src, index) => (
        <Image
          className={index === active ? "heroImage heroSlide active" : "heroImage heroSlide"}
          src={src}
          alt=""
          fill
          priority={index === 0}
          sizes="100vw"
          key={src}
        />
      ))}
    </div>
  );
}
