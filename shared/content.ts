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
  /** Paket kimga mosligi, mijoz tilida: «Internetda sotmoqchiman». */
  fit?: string;
  /** true bo'lsa paket saytda ko'rinmaydi (ochiq API uni qaytarmaydi), admin panelda qoladi. */
  hidden?: boolean;
};
export type Service = {
  slug: string;
  number: string;
  name: string;
  short: string;
  description: string;
  /** «Ichiga nimalar kiradi»: har bir paketda bor bandlar. Paketlarda faqat o'ziga xos bandlar turadi. */
  features: string[];
  icon: string;
  /** «…so‘mdan» ko‘rinishidagi boshlang‘ich narx; bo‘sh bo‘lsa saytda ko‘rsatilmaydi. */
  price?: string;
  term?: string;
  packages?: ServicePackage[];
  /** false bo'lsa xizmat saytning hech qayerida chiqmaydi. */
  published?: boolean;
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
export const serviceIcons = ["web", "design", "telegram", "app", "ai", "integration", "seo", "support"] as const;
/** Har bir loyihaga qo'shib beriladigan xizmatlar: xizmat kartasi va sahifasida «Har bir loyihada» qatori. */
export const PROMISES: Array<[string, string]> = [
  ["3 oy bepul texnik yordam", "Ishga tushgandan keyin xatolarni tuzatamiz va savollaringizga javob beramiz."],
  ["Topshirishda o‘qitish", "Admin panel va kundalik ish bilan ishlashni ko‘rsatib beramiz."],
  ["1 yil xatolarga kafolat", "Bizning aybimiz bilan chiqqan xatoni bir yil davomida bepul tuzatamiz."],
];
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
// Buyurtmalar uchun Payme/Click to'lov sayti.
export const PAY_URL = "https://pay.alifbit.org";
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
    published: false,
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
    published: false,
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
    description: "Biznesingizni internetda tanishtiradigan tez va tushunarli sayt. Matn tuzilishi, dizayn, dasturlash va domenga ulashgacha o‘zimiz bajaramiz.",
    features: [
      "Sahifalar tuzilmasi va matn rejasi",
      "Shablonsiz, brendingizga mos dizayn",
      "Telefon, planshet va kompyuterga moslashgan ko‘rinish",
      "Murojaat formasi — xabar darhol Telegram’ga keladi",
      "Telefon, Telegram va xarita tugmalari",
      "Tez yuklanish: Google PageSpeed’da yashil ko‘rsatkich",
      "Asosiy SEO: sarlavha va tavsiflar, sitemap, Google Search Console va Yandex Webmaster",
      "Google Analytics va Yandex Metrika",
      "Domen, hosting va SSL (https) ulash",
      "Ishga tushirishdan oldin turli telefon va brauzerlarda tekshiruv"
    ],
    icon: "web",
    published: true
  },
  {
    slug: "telegram-bot",
    number: "02",
    name: "Telegram bot",
    short: "Buyurtma qabul qiladigan bot yoki Telegram ichida ochiladigan to‘liq ilova (Mini App).",
    description: "Mijozlaringiz allaqachon Telegram’da. Buyurtma qabul qiladigan, savollarga javob beradigan va sizga xabar yuboradigan bot yasaymiz. Kattaroq vazifa uchun — Telegram ichida ochiladigan to‘liq ilova (Mini App).",
    features: [
      "Bot ssenariysi: menyu, tugmalar va qadamlar",
      "O‘zbek va rus tillari",
      "Buyurtma, ariza yoki qabulga yozilishni qabul qilish",
      "Yangi buyurtma haqida sizga va xodimlarga xabar",
      "Foydalanuvchilarga ommaviy xabar yuborish",
      "Foydalanuvchilar va buyurtmalar statistikasi",
      "Serverga o‘rnatish va to‘xtovsiz ishlashini kuzatish"
    ],
    icon: "telegram",
    published: true
  },
  {
    slug: "ai-yordamchi",
    number: "03",
    name: "AI yordamchi",
    short: "Savollarga o‘zi javob beradigan, ariza yig‘adigan va kerak bo‘lsa xodimga uzatadigan AI chatbot.",
    description: "Mijozlaringiz kechasi ham savol beradi. AI yordamchi sizning narxlaringiz, xizmatlaringiz va qoidalaringiz asosida o‘zbek va rus tilida javob beradi, arizani yozib oladi va murakkab savolni xodimga uzatadi. Telegram’da yoki saytingizda ishlaydi.",
    features: [
      "Bilimlar bazasi: narxlar, xizmatlar, savol-javoblar va hujjatlaringiz",
      "O‘zbek (lotin va kirill) va rus tillarida javob",
      "Ariza va kontaktlarni yozib olish",
      "Murakkab savolni xodimga uzatish",
      "Yangi ariza haqida Telegram’ga xabar",
      "Javoblarni admin paneldan tahrirlash",
      "Suhbatlar tarixi va statistika",
      "Birinchi oy davomida javoblarni sozlab borish",
      "AI xizmati (token) to‘lovi alohida — oylik sarfni oldindan hisoblab beramiz"
    ],
    icon: "ai",
    published: true
  },
  {
    slug: "ilova",
    number: "04",
    name: "Ilova",
    short: "Veb-ilova, CRM yoki mobil ilova — ishingizni avtomatlashtiradigan dastur.",
    description: "Jadval va qog‘ozda yuritilayotgan ishni bitta dasturga jamlaymiz: mijozlar, buyurtmalar, hisobotlar. Kerak bo‘lsa, telefon uchun ilova ham yasaymiz.",
    features: [
      "Ish jarayonlarini o‘rganish va tizim rejasi",
      "Bosiladigan prototip — boshlashdan oldin ko‘rasiz",
      "Foydalanuvchilar, rollar va ruxsatlar",
      "Mijozlar, buyurtmalar va vazifalar bazasi",
      "Hisobotlar va grafiklar",
      "Telegram orqali xabarnomalar",
      "Excel’dagi ma’lumotlarni ko‘chirish",
      "Har bosqichda ishlaydigan versiyani ko‘rsatish",
      "Muntazam zaxira nusxa va himoyalangan kirish",
      "Serverga o‘rnatish"
    ],
    icon: "app",
    published: true
  },
  {
    slug: "dizayn",
    number: "05",
    name: "Dizayn",
    short: "Yangi sayt yoki ilova uchun dizayn va mavjud saytni qayta dizayn qilish.",
    description: "Foydalanuvchi nimani, qayerda bosishini o‘ylab chiqamiz va buni toza, zamonaviy ko‘rinishga keltiramiz. Natija — dasturchiga tayyor Figma maketlari.",
    features: [
      "Foydalanuvchilar va raqobatchilarni o‘rganish",
      "Sahifalar sxemasi va foydalanuvchi yo‘li",
      "Shablonsiz vizual dizayn",
      "Bosiladigan prototip",
      "Telefon, planshet va kompyuter ko‘rinishlari",
      "Ranglar, shriftlar va komponentlar tizimi",
      "Dasturchiga tayyor Figma maketlari"
    ],
    icon: "design",
    published: true
  },
  {
    slug: "integratsiyalar",
    number: "06",
    name: "Integratsiyalar",
    short: "Sayt, bot yoki ilovangizni Payme, Click, CRM, 1C va SMS xizmatlariga ulaymiz.",
    description: "Mijoz saytda yoki botda to‘laydi, buyurtma CRM’ga tushadi, mijozga SMS boradi, sizga Telegram’da xabar keladi — hech narsani qo‘lda ko‘chirmaysiz. Boshqalar yasagan saytga ham ulaymiz.",
    features: [
      "To‘lov: Payme, Click, Uzum, Uzcard va Humo kartalari",
      "CRM: amoCRM, Bitrix24",
      "Hisob va ombor: 1C, МойСклад, Billz",
      "SMS: Eskiz, Playmobile",
      "Telegram xabarnomalari va Google Sheets",
      "To‘lov tizimida merchant ochishda yordam",
      "Avval sinov rejimida tekshirish, keyin jonli ulash",
      "To‘lov va buyurtma holati avtomatik yangilanadi"
    ],
    icon: "integration",
    published: true
  },
  {
    slug: "seo",
    number: "07",
    name: "SEO",
    short: "Saytingiz Google va Yandex’da yuqorida chiqishi uchun audit, sozlash va oylik ish.",
    description: "Mijozlar sizni qidiruvda topishi uchun saytning texnik holatini tuzatamiz, sahifalarni kerakli so‘zlarga moslaymiz va har oy qilingan ish va natijani hisobot bilan ko‘rsatamiz. Qidiruvdagi o‘rinni hech kim kafolatlay olmaydi, shuning uchun natijani raqamlar bilan kuzatamiz.",
    features: [
      "O‘zbek va rus tilidagi kalit so‘zlar va raqobatchilar tahlili",
      "Texnik audit: tezlik, indeksatsiya, sitemap, robots.txt, mobil ko‘rinish",
      "Sarlavha, tavsif va matnlarni optimallashtirish",
      "Savol-javob bloklari va tuzilgan ma’lumotlar (schema)",
      "Google Search Console va Yandex Webmaster",
      "Google Biznes profili, Yandex Biznes va 2GIS",
      "Hisobot: nima qilindi va natija qanday"
    ],
    icon: "seo",
    published: true
  },
  {
    slug: "texnik-yordam",
    number: "08",
    name: "Texnik yordam",
    short: "Saytingiz yoki botingiz doim ishlashi, xavfsiz va yangilangan bo‘lishi uchun oylik xizmat.",
    description: "Har bir loyihamizda ishga tushgandan keyin 3 oy bepul texnik yordam bor. Undan keyin, yoki boshqalar yasagan sayt va botlar uchun — oylik xizmat: kuzatamiz, zaxira olamiz, xatoni tuzatamiz va o‘zgarishlarni kiritamiz.",
    features: [
      "Sayt yoki bot ishlashini kuzatish",
      "Muntazam zaxira nusxa",
      "Xavfsizlik yangilanishlari va himoya",
      "Xatolarni tuzatish",
      "Matn, rasm va narxlarni yangilash",
      "Domen, hosting va SSL muddatini kuzatish",
      "Tezlik tekshiruvi",
      "Boshqalar yasagan sayt va botlarni ham olamiz"
    ],
    icon: "support",
    published: true
  }
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
      text: "Xizmatni tanlang — ichiga nimalar kirishi va narxini ko‘rasiz.",
    },
  },
};
export const routeMeta: Record<string, [string, string]> = {
  "/": [
    "AlifBit — veb-sayt, Telegram bot, AI yordamchi va ilova studiyasi",
    "Veb-sayt, Telegram bot, AI yordamchi, ilova, dizayn, Payme va Click integratsiyasi, SEO va texnik yordam: har bir xizmat tarkibi, narxi va muddati. Qilgan ishlarimiz va vayb koding kursi.",
  ],
  "/projects": [
    "Ishlar — AlifBit",
    "AlifBit qilgan ishlar: Sado — Windows uchun ovoz bilan yozish dasturi va uning sayti.",
  ],
  "/services": [
    "Xizmatlar va narxlar — AlifBit",
    "Veb-sayt, Telegram bot, AI yordamchi, ilova, dizayn, integratsiyalar, SEO va texnik yordam: tarkibi, paketlar, narxlar va muddatlar.",
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
