export type Project = {
  id: string;
  slug: string;
  name: string;
  category: string;
  status: string;
  summary: string;
  description: string;
  purpose: string;
  features: string[];
  platforms: string[];
  cover: string;
  url: string;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
};
export type ServicePackage = {
  name: string;
  price: string;
  term: string;
  features: string[];
  recommended: boolean;
  /** Kirish suhbatidagi 2-savol javobi, mijoz tilida: «Internetda sotmoqchiman». */
  fit?: string;
};
export type Service = {
  slug: string;
  number: string;
  name: string;
  short: string;
  description: string;
  features: string[];
  icon: string;
  /** «…so‘mdan» ko‘rinishidagi boshlang‘ich narx; bo‘sh bo‘lsa saytda ko‘rsatilmaydi. */
  price?: string;
  term?: string;
  packages?: ServicePackage[];
  /** Kirish suhbatidagi 1-savol javobi, mijoz tilida; bo'sh bo'lsa xizmat u yerda chiqmaydi. */
  need?: string;
};
export type CourseStep = { title: string; text: string };
export type Course = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  price: string;
  format: string;
  start: string;
  steps: CourseStep[];
  contents: string[];
  published: boolean;
  /** Kirish suhbatidagi javob; bo'sh bo'lsa kurs u yerda chiqmaydi. */
  need?: string;
  seoTitle?: string;
  seoDescription?: string;
};
export const serviceIcons = ["web", "design", "telegram", "app"] as const;
export const projectCovers = ["dalolat", "voice", "custom"] as const;
/** Kursga yozilish murojaatlari `service` maydonida shu prefiks bilan saqlanadi. */
export const COURSE_ORDER_PREFIX = "kurs-";
export const categories = [
  "Barchasi",
  "Dasturlar",
  "Telegram",
  "Saytlar",
  "AI",
  "Boshqa",
];
export const projectStatuses = [
  "Ishlayapti",
  "Ishlab chiqilmoqda",
  "Tez kunda",
  "Taqdimot",
  "Arxiv",
];
export const orderStatuses = [
  "Yangi",
  "Ko‘rib chiqilmoqda",
  "Narx taklif qilindi",
  "Kelishildi",
  "Bajarilmoqda",
  "Yakunlandi",
  "Bekor qilindi",
];
// Sado mahsulotining alohida sayti.
export const SADO_URL = "https://sado.alifbit.org";
// DALOLAT: taqdimot sayti va Telegram Mini App manzili.
export const DALOLAT_URL = "https://dalolat.app";
export const DALOLAT_APP_URL = "https://app.dalolat.app";
// API javobigacha ko'rsatiladigan boshlang'ich ma'lumot. Jonli qiymatlar D1 bazasida.
export const initialProjects: Project[] = [
  {
    id: "dalolat",
    slug: "dalolat",
    name: "DALOLAT",
    category: "Telegram",
    status: "Ishlayapti",
    summary: "Munosib juft topishga ko‘maklashuvchi Telegram ilovasi.",
    description:
      "DALOLAT — Telegram ichida ishlaydigan ilova (Mini App). Diniy qadriyatlarga muvofiq munosib juft topishga ko‘maklashadi: lenta talablaringizga qarab saralanadi, har bir anketada moslik foizi ko‘rinadi, nomzodga so‘rov yuborasiz va u qabul qilsa, ilova ichida suhbatlashasiz.",
    purpose:
      "Oila qurish niyatidagi insonlarga munosib juftni hurmat, ishonch va maxfiylik bilan topishda yordam berish.",
    features: [
      "Moslik foizi, filtr va ID bo‘yicha qidiruv",
      "Ko‘k belgi — yuzi jonli tekshirilgan anketalar",
      "Rasmlar faqat ruxsat berilganlarga ochiladi",
      "Nur AI yordamchisi va Xarakter testi (Big Five)",
      "Guvohli suhbat va shaxsiy sovchilik",
      "5 til: o‘zbek, rus, ingliz, turk, arab",
    ],
    platforms: ["Telegram Mini App", "dalolat.app"],
    cover: "dalolat",
    url: "https://dalolat.app",
    published: true,
    seoTitle: "DALOLAT — Munosib juft, mustahkam oila",
    seoDescription:
      "DALOLAT — Telegram ichidagi ilova: moslik foizi, tasdiqlangan anketalar, maxfiy rasmlar va Nur AI yordamchisi bilan munosib juft topishga ko‘maklashadi.",
  },
  {
    id: "voice",
    slug: "ovozdan-matnga",
    name: "Sado",
    category: "AI",
    status: "Ishlayapti",
    summary: "Windows uchun ovoz bilan yozish: gapiring, Sado yozadi.",
    description:
      "Sado — istalgan Windows dasturida ovoz bilan yozish uchun dastur. Alt tugmasini bosib turib gapirasiz, qo‘yib yuborganingizda matn kursor turgan joyga yoziladi: so‘zma-so‘z (Exact), tozalangan (Clean) yoki AI yordamchi uchun tayyor topshiriq (Prompt) ko‘rinishida. O‘zbek, rus va ingliz tillarini, hatto aralash nutqni ham tushunadi.",
    purpose:
      "Fikrni klaviaturada terishdan tezroq yozish va AI yordamchilarga aniq, tartibli topshiriq berishni osonlashtirish.",
    features: [
      "Istalgan dasturda Alt tugmasi bilan gapirib yozish",
      "Exact, Clean va Prompt rejimlari",
      "O‘zbek, rus va ingliz tillari",
      "Bepul tarif: oyiga 30 daqiqa",
      "Tarix kompyuterda shifrlangan holda saqlanadi",
    ],
    platforms: ["Windows 10 va 11", "macOS — tez kunda"],
    cover: "voice",
    url: SADO_URL,
    published: true,
  },
  {
    id: "dalolat-site",
    slug: "dalolat-sayti",
    name: "dalolat.app",
    category: "Saytlar",
    status: "Ishlayapti",
    summary: "DALOLAT ilovasining besh tilli taqdimot sayti.",
    description:
      "DALOLAT ilovasi uchun alohida sayt: ilova imkoniyatlari, savol-javob va brauzerda Telegram orqali kirish. Besh tilda ishlaydi.",
    purpose:
      "Ilovani Telegram’dan tashqarida ham tanishtirish va foydalanuvchini to‘g‘ridan-to‘g‘ri ilovaga olib kirish.",
    features: [
      "5 til: o‘zbek, rus, ingliz, turk, arab",
      "Brauzerda Telegram orqali kirish",
      "Telefon va kompyuterga moslashgan",
    ],
    platforms: ["Veb-sayt"],
    cover: "dalolat",
    url: DALOLAT_URL,
    published: true,
  },
  {
    id: "sado-site",
    slug: "sado-sayti",
    name: "sado.alifbit.org",
    category: "Saytlar",
    status: "Ishlayapti",
    summary: "Sado dasturining sayti: yuklab olish, tariflar va kalit so‘rash.",
    description:
      "Sado uchun mahsulot sayti: dastur qanday ishlashi, tariflar, Windows uchun yuklab olish va kalit so‘rash formasi.",
    purpose: "Dasturni tanishtirish va foydalanuvchini yuklab olishgacha olib borish.",
    features: [
      "Windows uchun yuklab olish",
      "Tariflar paneli",
      "Kalit so‘rash formasi",
    ],
    platforms: ["Veb-sayt"],
    cover: "voice",
    url: SADO_URL,
    published: true,
  },
];
// Narx, muddat va paketlar bu yerda yo'q: ular faqat bazada turadi va admin paneldan o'zgartiriladi.
export const initialServices: Service[] = [
  {
    slug: "veb-sayt",
    number: "01",
    name: "Veb-sayt",
    short: "Landing, vizitka sayt yoki internet-do‘kon — telefon va kompyuterda birdek qulay.",
    description:
      "Biznesingizni internetda tanishtiradigan tez va tushunarli sayt. Matn tuzilishi, dizayn, dasturlash va domenga ulashgacha o‘zimiz bajaramiz.",
    features: [
      "Telefon va kompyuterga moslashgan dizayn",
      "Murojaat formasi va Telegram’ga xabar",
      "Domen va hostingga ulash",
    ],
    icon: "web",
    need: "Mijozlar meni internetdan topsin",
  },
  {
    slug: "dizayn",
    number: "02",
    name: "Dizayn",
    short: "Yangi sayt yoki ilova uchun dizayn va mavjud saytni qayta dizayn qilish.",
    description:
      "Foydalanuvchi nimani, qayerda bosishini o‘ylab chiqamiz va buni toza, zamonaviy ko‘rinishga keltiramiz. Natija — dasturchiga tayyor Figma maketlari.",
    features: [
      "Figma maketlari",
      "Telefon va kompyuter ko‘rinishi",
      "Ranglar va shriftlar tizimi",
    ],
    icon: "design",
    need: "Sayt yoki ilovam ko‘rinishini yangilamoqchiman",
  },
  {
    slug: "telegram-bot",
    number: "03",
    name: "Telegram bot",
    short: "Buyurtma va mijozlar bilan ishlaydigan bot yoki Telegram ichidagi ilova (Mini App).",
    description:
      "Mijozlaringiz allaqachon Telegram’da. Buyurtma qabul qiladigan, savollarga javob beradigan va sizga xabar yuboradigan bot yasaymiz. Kattaroq vazifa uchun — Telegram ichida ochiladigan to‘liq ilova (Mini App).",
    features: [
      "Menyu va tugmalar",
      "Buyurtma yoki ariza qabul qilish",
      "Admin uchun xabarnomalar",
    ],
    icon: "telegram",
    need: "Buyurtmalarni Telegram’da qabul qilmoqchiman",
  },
  {
    slug: "ilova",
    number: "04",
    name: "Ilova",
    short: "Veb-ilova, CRM yoki mobil ilova — ishingizni avtomatlashtiradigan dastur.",
    description:
      "Jadval va qog‘ozda yuritilayotgan ishni bitta dasturga jamlaymiz: mijozlar, buyurtmalar, hisobotlar. Kerak bo‘lsa, telefon uchun ilova ham yasaymiz.",
    features: [
      "Foydalanuvchilar va ruxsatlar",
      "Ma’lumotlar bazasi",
      "Hisobotlar",
    ],
    icon: "app",
    need: "Ishimni bitta dasturga jamlamoqchiman",
  },
];
export const TELEGRAM_URL = "https://t.me/alifbitbot?start=alifbit";
export const copy = {
  uz: {
    tagline: "Avval tinglaymiz. Keyin narxini aytamiz.",
    nav: [
      ["Xizmatlar", "/services"],
      ["Ishlar", "/projects"],
      ["Kurslar", "/courses"],
      ["Biz haqimizda", "/about"],
    ],
    hero: {
      title: "Sizga nima kerak?",
      text: "Tanlang — mos yechim va narxini aytamiz.",
    },
  },
};
export const routeMeta: Record<string, [string, string]> = {
  "/": [
    "AlifBit — veb-sayt, Telegram bot va ilova studiyasi",
    "Sizga nima kerakligini so‘raymiz va mos yechim narxini darhol aytamiz: veb-sayt, dizayn, Telegram bot, ilova. Qilgan ishlarimiz va vayb koding kursi.",
  ],
  "/projects": [
    "Ishlar — AlifBit",
    "AlifBit qilgan ishlar: DALOLAT, Sado va ularning saytlari.",
  ],
  "/services": [
    "Xizmatlar va narxlar — AlifBit",
    "Veb-sayt, dizayn, Telegram bot va ilova: paketlar, narxlar va muddatlar.",
  ],
  "/courses": [
    "Kurslar — AlifBit",
    "AI yordamida sayt va Telegram bot yasashni o‘rganing.",
  ],
  "/about": [
    "Biz haqimizda — AlifBit",
    "AlifBit — kichik studiya: avval ehtiyojingizni tinglaymiz, keyin yechim va narxini aytamiz.",
  ],
  "/contact": [
    "Buyurtma berish — AlifBit",
    "Loyihangiz haqida yozing: narx va muddatni birga aniqlaymiz.",
  ],
  "/privacy": [
    "Maxfiylik siyosati — AlifBit",
    "Murojaat ma’lumotlari, ularni saqlash va o‘chirish tartibi.",
  ],
  "/journal": [
    "Qaydlar — AlifBit",
    "Texnologiya, ilm va ijod haqida AlifBit qaydlari.",
  ],
};
