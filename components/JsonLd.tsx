import { faq, services, site } from "@/lib/site";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "PetGrooming"],
        "@id": `${site.url}/#business`,
        name: site.legalName,
        url: site.url,
        telephone: site.phone,
        email: site.email,
        image: [`${site.url}/slider-1.png`, `${site.url}/slider-2.png`, `${site.url}/pet-grooming-hero.png`],
        logo: `${site.url}/logo-mark.png`,
        address: {
          "@type": "PostalAddress",
          addressLocality: site.city,
          addressCountry: site.country
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: site.latitude,
          longitude: site.longitude
        },
        areaServed: {
          "@type": "City",
          name: site.city
        },
        sameAs: [site.instagram],
        priceRange: "₺₺",
        description: site.description,
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "09:00",
            closes: "19:00"
          }
        ],
        makesOffer: services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.summary,
            areaServed: site.city
          }
        }))
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: "tr-TR",
        publisher: { "@id": `${site.url}/#business` }
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer
          }
        }))
      }
    ]
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
