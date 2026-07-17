export const site = {
  name: "Patiizpet",
  legalName: "Patiizpet Pet Kuaförü",
  url: "https://patiizpet.com",
  phone: "+90 555 111 22 33",
  phoneDisplay: "0555 111 22 33",
  email: "merhaba@patiizpet.com",
  address: "İzmir, Türkiye",
  city: "İzmir",
  country: "TR",
  latitude: 38.4237,
  longitude: 27.1428,
  instagram: "https://instagram.com/patiizpet",
  whatsapp: "https://wa.me/905551112233",
  description:
    "İzmir'de köpek ve kedi dostları için hijyenik, sakin ve randevulu pet kuaförü deneyimi."
};

export const services = [
  {
    title: "Komple Bakım",
    slug: "komple-bakim",
    summary: "Banyo, kurutma, tarama, tüy açma, pati ve tırnak bakımını tek randevuda toplar.",
    duration: "90-150 dk",
    details:
      "Tüy yapısı, yaş, hassasiyet ve ırk beklentisi birlikte değerlendirilir. Randevu öncesinde notlarınızı alır, bakım sırasında dostunuzun konforunu öne koyarız."
  },
  {
    title: "Irka Uygun Makas ve Makine Tıraşı",
    slug: "irka-uygun-tiras",
    summary: "Günlük kullanıma uygun, temiz ve estetik kesim planı.",
    duration: "60-120 dk",
    details:
      "Maltese, Poodle, Pomeranian ve benzeri ırklar için tüy formu, mevsim ve bakım rutini dikkate alınır."
  },
  {
    title: "Banyo ve Kurutma",
    slug: "banyo-kurutma",
    summary: "Cilt ve tüy yapısına uygun ürünlerle ferah, hijyenik bakım.",
    duration: "45-90 dk",
    details:
      "Cilt hassasiyeti olan dostlar için nazik ürün seçimi yapılır. Kurutma süreci aceleye getirilmez."
  },
  {
    title: "Tırnak, Pati ve Kulak Bakımı",
    slug: "pati-kulak-bakimi",
    summary: "Kısa bakım ihtiyacı olan dostlar için pratik ve özenli uygulama.",
    duration: "20-45 dk",
    details:
      "Tırnak kesimi, pati altı temizliği ve kulak çevresi bakımı kontrollü şekilde tamamlanır."
  }
];

// GÖRSELLER — Aşağıdaki dosyalar şu an placeholder (SVG). Gerçek fotoğrafları
// public/gallery/ klasörüne aynı adla (örn. gallery-1.jpg) koyup buradaki
// yolu ".jpg" olarak güncellemeniz yeterli. Alt metinleri (alt) SEO için anlamlı tutun.
export const gallery = [
  { src: "/gallery/gallery-1.svg", alt: "Patiizpet salonunda bakım yapılan küçük köpek" },
  { src: "/gallery/gallery-2.svg", alt: "Bakımı tamamlanmış bakımlı köpek portresi" },
  { src: "/gallery/gallery-3.svg", alt: "Hijyenik pet kuaförü bakım masası ve ekipmanlar" },
  { src: "/gallery/gallery-4.svg", alt: "Banyo ve kurutma sonrası mutlu pet" },
  { src: "/gallery/gallery-5.svg", alt: "Makas tıraşı sırasında özenli bakım" },
  { src: "/gallery/gallery-6.svg", alt: "Salon karşılama alanı ve bekleme köşesi" }
];

export const beforeAfter = {
  before: { src: "/gallery/before-1.svg", alt: "Bakım öncesi dağınık tüylü köpek" },
  after: { src: "/gallery/after-1.svg", alt: "Bakım sonrası bakımlı ve şekillenmiş köpek" }
};

export const testimonials = [
  {
    name: "Ayşe Yılmaz",
    pet: "Pomeranian · Zeytin",
    avatar: "/avatars/avatar-1.svg",
    quote:
      "Zeytin ilk kez bu kadar sakin bir bakım geçirdi. Randevu saatine tam uyulması ve salonun sakinliği fark yaratıyor."
  },
  {
    name: "Mert Kaya",
    pet: "Golden · Boncuk",
    avatar: "/avatars/avatar-2.svg",
    quote:
      "Tüy açılması sorununu not olarak yazmıştım, geldiğimde her şey hazırdı. Sonuç hem şık hem sağlıklı oldu."
  },
  {
    name: "Selin Demir",
    pet: "British Shorthair · Zeynep",
    avatar: "/avatars/avatar-3.svg",
    quote:
      "Kedim için endişeliydim ama tempoyu ona göre ayarladılar. Online randevu ve dolu saat kontrolü çok pratik."
  }
];

export const faq = [
  {
    question: "Randevu almadan gelebilir miyim?",
    answer:
      "Dostunuzun stres yaşamaması ve bekleme oluşmaması için randevulu çalışıyoruz. Uygun saatleri online randevu sayfasından görebilirsiniz."
  },
  {
    question: "Kediler için de bakım yapıyor musunuz?",
    answer:
      "Evet. Kediler için bakım süreci mizaca göre planlanır. Randevu notuna dostunuzun hassasiyetlerini yazmanız yeterli."
  },
  {
    question: "Tıraş süresi ne kadar sürer?",
    answer:
      "Hizmete ve tüy durumuna göre genellikle 45 ila 150 dakika arasında değişir. Online formdaki hizmet seçimi bize doğru zaman planı yapmamızda yardımcı olur."
  },
  {
    question: "Aynı saat aralığına iki randevu alınabilir mi?",
    answer:
      "Hayır. Sistem seçilen tarih ve saat aralığını kontrol eder; dolu saatlere yeni randevu alınmasını engeller."
  }
];
