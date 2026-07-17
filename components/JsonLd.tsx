import { faq, services, site } from "@/lib/site";

export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "PetGrooming",
    name: site.legalName,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    image: `${site.url}/pet-grooming-hero.png`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "İzmir",
      addressCountry: "TR"
    },
    areaServed: "İzmir",
    priceRange: "₺₺",
    description: site.description,
    makesOffer: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.title,
        description: service.summary
      }
    })),
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
