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
  /** Yechim qaysi xizmatga tegishli (xizmat slug'i): sahifada narx va buyurtma havolasi shundan olinadi. */
  service?: string;
  /** Mijozning hayotiy muammosi, 2–3 jumla. */
  problem?: string;
  /** «Qanday ishlaydi» qadamlari. */
  steps?: CourseStep[];
  /** Mijoz nimani ko'radi. */
  customerView?: string[];
  /** Biznes egasi nimani ko'radi. */
  ownerView?: string[];
  beforeAfter?: BeforeAfter[];
  /** Kimga mos: sohalar va holatlar. */
  fit?: string[];
  faq?: FaqItem[];
  /** Sahifada bosib ko'riladigan suhbat demosi. */
  demo?: DemoScript;
};
export type BeforeAfter = { before: string; after: string };
export type FaqItem = { q: string; a: string };
/** Demo ichidagi karta: buyurtma, jadval qatori yoki egasiga kelgan xabar. */
export type DemoCard = { title: string; lines: string[] };
export type DemoButton = { label: string; next: string };
/**
 * Demo suhbatining bitta qadami: bot xabarlari, ixtiyoriy karta, mijoz bosadigan tugmalar
 * va shu qadamda egasi panelida chiqadigan yozuv. Tugmasiz tugun — demo oxiri.
 */
export type DemoNode = {
  id: string;
  messages: string[];
  card?: DemoCard;
  buttons: DemoButton[];
  owner?: DemoCard;
};
export type DemoScript = { bot: string; start: string; nodes: DemoNode[] };
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
  /** «1 200 000 so‘m» ko‘rinishidagi boshlang‘ich narx; bo‘sh bo‘lsa saytda ko‘rsatilmaydi. */
  price?: string;
  term?: string;
  packages?: ServicePackage[];
  /** Shu turdagi, boshqa kompaniyalar ishga tushirgan haqiqiy yechimlar: xizmat sahifasida manba havolasi bilan chiqadi. */
  examples?: ServiceExample[];
  /** false bo'lsa xizmat saytning hech qayerida chiqmaydi. */
  published?: boolean;
  /** false bo'lsa «Har bir loyihada» va'dalari (PROMISES) shu xizmat tanlanganda ko'rsatilmaydi. */
  promises?: boolean;
};
export type ServiceExample = {
  name: string;
  /** Kompaniya va mamlakat, masalan «EVOS · O‘zbekiston». */
  owner: string;
  text: string;
  /** Manba: sayt yoki t.me havolasi. */
  url: string;
  /** Kompyuter ekrani skrinshoti (/media/public/...): kartadagi noutbuk va bosh sahifadagi 3D noutbuk ekranida chiqadi. */
  image: string;
  /** Telefon ekrani skrinshoti: kartadagi va 3D telefon ekranida. */
  imageMobile?: string;
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
export const serviceIcons = ["web", "design", "telegram", "app", "ai", "integration", "seo", "support", "audit", "ads"] as const;
/** Har bir loyihaga qo'shib beriladigan xizmatlar: xizmat kartasi va sahifasida «Har bir loyihada» qatori. */
export const PROMISES: Array<[string, string]> = [
  ["3 oy bepul texnik yordam", "Ishga tushgandan keyin xatolarni tuzatamiz va savollaringizga javob beramiz."],
  ["Qanday foydalanishni o‘rgatamiz", "Admin panel va kundalik ish bilan ishlashni ko‘rsatib beramiz."],
  ["1 yil xatolarga kafolat", "Bizning aybimiz bilan chiqqan xatoni bir yil davomida bepul tuzatamiz."],
];
/** «demo» — muqova loyihaning demo suhbatidan chiziladi. */
export const projectCovers = ["dalolat", "voice", "custom", "demo"] as const;
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
  "Namuna",
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
// AlifBit virtual ofisi (3D ofis, alohida sayt).
export const OFFICE_URL = "https://office.alifbit.org/";
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
    summary: "Ovoz bilan matn yozish dasturi. Alt tugmasini bosib gapiring: tugmani qo‘yib yuborganingizda Sado aytganlaringizni kursor turgan joyga matn qilib yozadi.",
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
];
// Narx, muddat va paketlar bu yerda yo'q: ular faqat bazada turadi va admin paneldan o'zgartiriladi.
export const initialServices: Service[] = [
  {
    slug: "veb-sayt",
    number: "01",
    name: "Sayt yaratish",
    short: "Bir sahifali sayt, kompaniya sayti yoki internet-do‘kon — telefon va kompyuterda birdek qulay.",
    description: "Kompaniyangiz, xizmatlaringiz yoki mahsulotlaringiz uchun sayt yaratamiz. Sahifalar, dizayn va kerakli funksiyalarni siz bilan kelishib, saytni ishga tushiramiz.",
    features: [
      "Sahifalar tuzilmasi va matn rejasi",
      "Shablonsiz, brendingizga mos dizayn",
      "Telefon, planshet va kompyuterga moslashgan ko‘rinish",
      "Murojaat formasi — xabar darhol Telegram’ga keladi",
      "Telefon, Telegram va xarita tugmalari",
      "Saytning tez yuklanishi ustida ishlaymiz",
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
    name: "Telegram bot va ilovalar",
    short: "Buyurtma qabul qiladigan bot yoki Telegram ichida ochiladigan to‘liq ilova (Mini App).",
    description: "Buyurtma qabul qilish, mijozlarni qabulga yozish yoki savollarga javob berish uchun bot yaratamiz. Katalog va savat kerak bo‘lsa, Telegram ichida ochiladigan ilova tayyorlaymiz.",
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
    name: "AI yordamchi yaratish",
    short: "Savollarga o‘zi javob beradigan, ariza yig‘adigan va kerak bo‘lsa xodimga uzatadigan yordamchi.",
    description: "Siz bergan ma’lumotlar asosida mijozlarning savollariga javob beradigan yordamchi yaratamiz. U murojaatlarni qabul qiladi va kerakli savollarni xodimga yuboradi.",
    features: [
      "Bilimlar bazasi: narxlar, xizmatlar, savol-javoblar va hujjatlaringiz",
      "O‘zbek (lotin va kirill) va rus tillarida javob",
      "Mijozning murojaati va aloqa ma’lumotlarini saqlash",
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
    name: "Biznes uchun dastur va ilovalar",
    short: "Brauzerda ishlaydigan dastur, CRM (mijozlar va buyurtmalarni boshqarish tizimi) yoki mobil ilova.",
    description: "Mijozlar, buyurtmalar, vazifalar va hisobotlarni boshqarish uchun dastur yaratamiz. Ishingizga qarab brauzerda ishlaydigan dastur yoki mobil ilova tayyorlaymiz.",
    features: [
      "Ish jarayonlarini o‘rganish va tizim rejasi",
      "Dasturlashdan oldin maketni bosib sinab ko‘rasiz",
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
    name: "Sayt va ilova dizayni",
    short: "Yangi sayt yoki ilova uchun dizayn va mavjud saytni qayta dizayn qilish.",
    description: "Sayt yoki ilovangizning ko‘rinishi va undan foydalanish tartibini ishlab chiqamiz. Tayyor maketni dasturlashdan oldin ko‘rib, tugmalarini bosib sinashingiz mumkin.",
    features: [
      "Foydalanuvchilar va raqobatchilarni o‘rganish",
      "Sahifalar sxemasi va foydalanuvchi yo‘li",
      "Shablonsiz vizual dizayn",
      "Bosib sinab ko‘riladigan maket",
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
    name: "To‘lov va boshqa tizimlarni ulash",
    short: "Sayt, bot yoki ilovangizni Payme, Click, CRM (mijozlar va buyurtmalarni boshqarish tizimi), 1C va SMS xizmatlariga ulaymiz.",
    description: "Sayt, bot yoki ilovangizga to‘lov, SMS va boshqa xizmatlarni ulaymiz. Buyurtma hamda mahsulot ma’lumotlarini mavjud hisob tizimingiz bilan bog‘laymiz.",
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
    name: "Google va Yandex uchun saytni sozlash",
    short: "Saytingiz Google va Yandex’da yuqorida chiqishi uchun audit, sozlash va oylik ish.",
    description: "Saytingizni qidiruv tizimlari uchun tekshiramiz, texnik xatolarini tuzatamiz va sahifa matnlarini moslaymiz. Bajarilgan ishlar va qidiruvdan kelayotgan tashriflar bo‘yicha hisobot beramiz.",
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
    name: "Sayt va botlarga texnik xizmat",
    short: "Saytingiz yoki botingiz doim ishlashi, xavfsiz va yangilangan bo‘lishi uchun oylik xizmat.",
    description: "Sayt yoki botingizning ishlashini kuzatamiz, zaxira nusxa olamiz va nosozliklarni tuzatamiz. Kelishilgan xizmat doirasida matn, rasm va narxlarni ham yangilaymiz.",
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
  },
  {
    slug: "tekshiruv",
    number: "09",
    name: "Sayt, bot va ilovani tekshirish",
    short: "Sayt, bot yoki ilovangizni tekshirib, xatolarini aytamiz va tuzatish uchun texnik tavsif yozib beramiz.",
    description: "Sayt, Telegram bot yoki ilovangizni mijoz ko‘zi bilan va texnik tomondan tekshiramiz. Topilgan xatolarni tushunarli tilda aytamiz, ularni tuzatish uchun texnik tavsif yozib beramiz va tuzatish narxini hisoblaymiz. Tuzatishni xohlasangiz bizga, xohlasangiz boshqa dasturchiga berasiz. Bizga bersangiz, tekshiruv narxi tuzatish narxidan chegiriladi.",
    features: [
      "Telefon va kompyuterda tekshirish: nima ishlamayapti va nima noqulay",
      "Formalar, tugmalar, buyurtma va to‘lov jarayonini sinab ko‘rish",
      "Tezlik va yuklanish vaqti",
      "Xavfsizlik: SSL, eskirgan versiyalar, ochiq qolgan ma’lumotlar",
      "Matn, rasm va havolalardagi xatolar",
      "Har bir xato skrinshot bilan, muhimligi bo‘yicha tartiblangan",
      "Har qanday dasturchi tushunadigan texnik tavsif",
      "Tuzatish narxi va muddati"
    ],
    icon: "audit",
    promises: false,
    published: true
    },
  {
    slug: "reklama",
    number: "10",
    name: "Telegram va Instagram’da reklama",
    short: "Telegram Ads va Instagram’da reklamani sozlab, ishga tushiramiz va natijasini kuzatamiz.",
    description: "Sayt, bot yoki kanalingizga kerakli odamlarni olib kelish uchun Telegram Ads va Instagram’da reklama sozlaymiz. Auditoriyani aniqlaymiz, reklama kabinetini ochamiz, ishga tushiramiz va natijani kuzatib boramiz. Natija yomon bo‘lsa, sozlamalarni o‘zgartiramiz va nima qilinganini hisobotda ko‘rsatamiz.",
    features: [
      "Maqsad va auditoriyani aniqlash: kim, qayerda, qaysi tilda",
      "Reklama kabinetini ochish va sozlash",
      "Sayt, bot yoki kanalni reklamaga tayyorlash",
      "Reklamani ishga tushirish",
      "Natijani kuzatish: ko‘rishlar, bosishlar va arizalar",
      "Natija yomon bo‘lsa sozlamalarni o‘zgartirish",
      "Hisobot: nima qilindi va natija qanday",
      "Reklama byudjeti xizmat narxiga kirmaydi: platformaga mijozning o‘zi to‘laydi yoki alohida kelishiladi"
    ],
    icon: "ads",
    published: true
  }
];
export const TELEGRAM_URL = "https://t.me/alifbitbot?start=alifbit";
export const copy = {
  uz: {
    tagline: "Nima kerakligini ayting, qanday qilishni birga kelishamiz.",
    nav: [
      ["Xizmatlar", "/services"],
      ["Loyihalar", "/projects"],
      ["Kurslar", "/courses"],
      ["Biz haqimizda", "/about"],
    ],
    hero: {
      title: "Sizga nima kerak?",
      text: "Xizmatni tanlab, narxi, muddati va nimalar kirishini ko‘ring.",
    },
  },
};
export const routeMeta: Record<string, [string, string]> = {
  "/": [
    "AlifBit — sayt, Telegram bot, AI yordamchi va ilovalar yaratish studiyasi",
    "Sayt, Telegram bot, AI yordamchi, dastur va ilovalar, dizayn, to‘lov tizimlarini ulash, qidiruvga moslash va texnik xizmat: har bir xizmat tarkibi, narxi va muddati. Loyihalar, namunalar va AI yordamida sayt va bot yaratish kursi.",
  ],
  "/projects": [
    "Loyihalar va namunalar — AlifBit",
    "Sado va biznes uchun tayyor yechimlar: yozilish boti, Telegram do‘kon, AI yordamchi, CRM va boshqalar. Har birining qanday ishlashini demo’da sinab ko‘ring.",
  ],
  "/services": [
    "Xizmatlar va narxlar — AlifBit",
    "Sayt, Telegram bot, AI yordamchi, dastur va ilovalar, dizayn, tizimlarni ulash, qidiruvga moslash, texnik xizmat, tekshirish va reklama: tarkibi, paketlar, narxlar va muddatlar.",
  ],
  "/courses": [
    "Kurslar — AlifBit",
    "AI yordamida sayt va Telegram bot yasashni o‘rganing.",
  ],
  "/about": [
    "Biz haqimizda — AlifBit",
    "AlifBit — sayt, Telegram bot va ilovalar yaratadigan kichik studiya. Loyihangizni muhokama qilib, bajariladigan ishlar, narx va muddatni oldindan kelishamiz.",
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
