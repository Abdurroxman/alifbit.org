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
export type Service = {
  slug: string;
  number: string;
  name: string;
  short: string;
  description: string;
  features: string[];
  icon: string;
};
export const categories = [
  "Barchasi",
  "Dasturlar",
  "Telegram",
  "Ta’lim",
  "Kitoblar",
  "Media",
  "AI",
  "Boshqa",
];
export const projectStatuses = [
  "Taqdimot",
  "Ishlayapti",
  "Ishlab chiqilmoqda",
  "Tez kunda",
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
export const initialProjects: Project[] = [
  {
    id: "dalolat",
    slug: "dalolat",
    name: "DALOLAT",
    category: "Dasturlar",
    status: "Taqdimot",
    summary: "AlifBit ekotizimidagi mustaqil raqamli loyiha.",
    description:
      "DALOLAT — AlifBit loyihalari qatoridagi raqamli mahsulot. Uning rasmiy taqdimoti, tasdiqlangan imkoniyatlari va foydalanish havolasi shu sahifada e’lon qilinadi.",
    purpose:
      "Foydali g‘oyani tushunarli, qulay raqamli mahsulotga aylantirish. Mahsulot haqida batafsil ma’lumot rasmiy taqdimotda beriladi.",
    features: [
      "Mahsulot haqida ma’lumot",
      "Rasmiy yangiliklar",
      "Taqdimot va foydalanish yo‘riqnomasi",
    ],
    platforms: ["Raqamli mahsulot"],
    cover: "dalolat",
    url: "",
    published: true,
  },
  {
    id: "voice",
    slug: "ovozdan-matnga",
    name: "Ovozdan matnga",
    category: "AI",
    status: "Taqdimot",
    summary: "Aytilgan fikrni yozma bilimga aylantirish g‘oyasi.",
    description:
      "Ovozli materiallar bilan ishlashni soddalashtirishga qaratilgan loyiha. Yakuniy nomi, qo‘llab-quvvatlanadigan tillar va ishlash imkoniyatlari taqdimot vaqtida aniqlashtiriladi.",
    purpose:
      "Ovozda qolgan fikrni matnga ko‘chirish orqali uni o‘qish, tahrirlash va qayta ishlashni qulaylashtirish.",
    features: [
      "Ovozli materiallar bilan ishlash",
      "Matnni tartiblash konsepsiyasi",
      "Sodda interfeys yondashuvi",
    ],
    platforms: ["Platforma aniqlashtiriladi"],
    cover: "voice",
    url: "",
    published: true,
  },
  {
    id: "academy",
    slug: "academy",
    name: "AlifBit Academy",
    category: "Ta’lim",
    status: "Taqdimot",
    summary: "Bilimni amaliy ko‘nikmaga aylantiradigan ta’lim.",
    description:
      "O‘qish, tushunish va amalda sinab ko‘rishga asoslangan ta’lim yo‘nalishi. Matnli darslar, o‘quv dasturlari va ma’rifiy materiallarni bir joyga jamlashni maqsad qilamiz.",
    purpose:
      "Murakkab bilimni sodda va izchil shaklda yetkazish. Kurslar katalogi tayyor bo‘lgach shu yerda paydo bo‘ladi.",
    features: [
      "Matnli darslar yondashuvi",
      "Bosqichma-bosqich o‘quv dasturlari",
      "Amaliy topshiriqlar konsepsiyasi",
    ],
    platforms: ["Veb"],
    cover: "academy",
    url: "",
    published: true,
  },
  {
    id: "library",
    slug: "library",
    name: "AlifBit Library",
    category: "Kitoblar",
    status: "Taqdimot",
    summary: "Yaxshi kitoblar. Yangi qarashlar. Kengroq dunyo.",
    description:
      "Kitoblar, qisqartmalar va tarjimalarni jamlashga qaratilgan bilim yo‘nalishi. Faqat tarqatish huquqi mavjud yoki ruxsat olingan materiallar nashr qilinadi.",
    purpose:
      "Mutolaani qulayroq qilish va bilim manbalarini o‘quvchiga yaqinlashtirish.",
    features: [
      "Elektron kitoblar",
      "Kitob qisqartmalari",
      "Tarjimalar va audio materiallar",
    ],
    platforms: ["Veb"],
    cover: "library",
    url: "",
    published: true,
  },
  {
    id: "films",
    slug: "films",
    name: "Tarixga yangi nigoh",
    category: "Media",
    status: "Taqdimot",
    summary: "O‘tmishni hikoya qiluvchi film va animatsiyalar.",
    description:
      "Tarixiy filmlar, 3D animatsiya va vizual hikoyalar yo‘nalishi. Haqiqiy treyler va tayyor qismlar tasdiqlangach katalogga qo‘shiladi.",
    purpose:
      "Tarixiy mavzularni zamonaviy vizual vositalar orqali qiziqarli va tushunarli shaklda hikoya qilish.",
    features: [
      "Tarixiy hikoyalar",
      "3D animatsiya",
      "Ko‘p tilli media konsepsiyasi",
    ],
    platforms: ["Video"],
    cover: "films",
    url: "",
    published: true,
  },
  {
    id: "render",
    slug: "render",
    name: "AlifBit Render",
    category: "Boshqa",
    status: "Taqdimot",
    summary: "Tasavvuringizdagi manzaraga aniq shakl beramiz.",
    description:
      "3D modellar va videolar uchun render hamda vizualizatsiya xizmatlari. Har bir vazifa hajmi, formati va muddati bo‘yicha alohida kelishiladi.",
    purpose: "Dizayn va 3D g‘oyalarni ta’sirli yakuniy tasvirga aylantirish.",
    features: [
      "3D vizualizatsiya",
      "Video render",
      "Vazifaga mos individual yondashuv",
    ],
    platforms: ["3D", "Video"],
    cover: "render",
    url: "",
    published: true,
  },
];
export const initialServices: Service[] = [
  {
    slug: "development",
    number: "01",
    name: "Development",
    short: "G‘oyangiz uchun puxta raqamli yechim.",
    description:
      "Telegram botdan to‘liq veb-platformagacha. Jarayoningizni tushunamiz, qulay interfeys va ishonchli dasturiy yechim yaratamiz.",
    features: [
      "Telegram botlar va Mini Apps",
      "Veb-saytlar va veb-ilovalar",
      "Mobil ilovalar",
      "Maxsus dasturiy ta’minot",
    ],
    icon: "code",
  },
  {
    slug: "academy",
    number: "02",
    name: "Academy",
    short: "Bilimdan amaliyotga olib boradigan yo‘l.",
    description:
      "O‘rganishni izchil, tushunarli va amaliy qilishga qaratilgan ta’lim materiallari hamda o‘quv dasturlari.",
    features: [
      "Matnli kurslar",
      "O‘quv dasturlari",
      "Test va sertifikat konsepsiyasi",
      "Ma’rifiy materiallar",
    ],
    icon: "academy",
  },
  {
    slug: "films",
    number: "03",
    name: "Films & Animation",
    short: "Mazmunli hikoyalarga yangi hayot.",
    description:
      "Tarix, ilm va ijodni birlashtiradigan vizual hikoyalar. G‘oyadan ssenariyga, animatsiyadan yakuniy videoga.",
    features: [
      "Tarixiy filmlar",
      "3D animatsiya",
      "Vizual hikoyalar",
      "Dublyaj va ko‘p tilli media",
    ],
    icon: "film",
  },
  {
    slug: "library",
    number: "04",
    name: "Library",
    short: "Bilimga ochiladigan yana bir eshik.",
    description:
      "Mutolaa va fikrlash uchun kitoblar, tarjimalar hamda saralangan ma’rifiy materiallar.",
    features: [
      "Kitob qisqartmalari",
      "Tarjimalar",
      "Elektron kitoblar",
      "Audio materiallar",
    ],
    icon: "book",
  },
  {
    slug: "render",
    number: "05",
    name: "Render",
    short: "Tasavvurdan ta’sirli tasvirgacha.",
    description:
      "3D va video loyihalarga yakuniy ko‘rinish berish. Vizual sifat va loyihangiz talablariga e’tibor.",
    features: [
      "3D render",
      "Video render",
      "Arxitektura vizualizatsiyasi",
      "GPU asosidagi vizualizatsiya",
    ],
    icon: "box",
  },
  {
    slug: "products",
    number: "06",
    name: "Digital Products",
    short: "Kundalik ishga haqiqiy foyda.",
    description:
      "Muayyan muammoni sodda hal qiladigan mustaqil dasturlar va foydali raqamli vositalar.",
    features: [
      "Tayyor dasturlar",
      "AI vositalari",
      "Obuna asosidagi servislar",
      "Raqamli mahsulotlar",
    ],
    icon: "spark",
  },
];
// Sado mahsulotining alohida sayti.
export const SADO_URL = "https://sado.alifbit.org";
export const copy = {
  uz: {
    tagline: "Ilmdan g‘oyaga. G‘oyadan amalga.",
    nav: [
      ["Loyihalar", "/projects"],
      ["Sado", SADO_URL],
      ["Xizmatlar", "/services"],
      ["Akademiya", "/academy"],
      ["Biz haqimizda", "/about"],
    ],
    hero: {
      title: "Har bir buyuk loyiha bir g‘oyadan boshlanadi.",
      text: "Biz texnologiya, ilm va ijod orqali g‘oyalarni hayotga tatbiq etamiz. Insonlarga foyda keltiradigan raqamli mahsulotlar va bilim manbalarini yaratamiz.",
    },
  },
};
export const routeMeta: Record<string, [string, string]> = {
  "/": [
    "AlifBit — Ilmdan g‘oyaga. G‘oyadan amalga.",
    "Texnologiya, ilm va ijod bir joyda. Foydali raqamli mahsulotlar, bilim manbalari va yangi g‘oyalar ekotizimi.",
  ],
  "/projects": [
    "Loyihalar — AlifBit",
    "AlifBit ekotizimi: raqamli mahsulotlar, AI, ta’lim, kitoblar va media loyihalari.",
  ],
  "/services": [
    "Xizmatlar — AlifBit",
    "Development, Academy, Library, Films, Render va Digital Products yo‘nalishlari.",
  ],
  "/academy": [
    "AlifBit Academy — Bilimdan amaliyotga",
    "Izchil ta’lim, matnli darslar va amaliy bilimga asoslangan AlifBit Academy taqdimoti.",
  ],
  "/library": [
    "AlifBit Library — Mutolaa uchun makon",
    "Kitoblar, qisqartmalar va tarjimalarga bag‘ishlangan AlifBit Library.",
  ],
  "/films": [
    "AlifBit Films — Tarixga yangi nigoh",
    "Tarixiy filmlar, animatsiya va mazmunli vizual hikoyalar.",
  ],
  "/render": [
    "AlifBit Render — Tasavvurga shakl",
    "3D render, video render va vizualizatsiya xizmatlari.",
  ],
  "/about": [
    "Biz haqimizda — AlifBit",
    "Ilm, texnologiya va ijod orqali insonlarga foydali mahsulotlar yaratish maqsadimiz.",
  ],
  "/contact": [
    "Loyihangizni boshlang — AlifBit",
    "G‘oyangiz haqida yozing. AlifBit bilan raqamli mahsulot yoki ijodiy loyihangizni boshlang.",
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
