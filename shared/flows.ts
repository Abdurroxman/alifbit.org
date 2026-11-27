// Xizmat sahifasidagi «qanday ishlaydi» chizmasi: har xizmat uchun zanjir tugunlari.
// Kalit — xizmat belgisi (Service.icon). Matnlar xizmat tarkibidagi bandlarga tayanadi.

import { mk } from "./i18n.ts";

export type FlowNode = {
  /** lucide belgisi nomi (src/components/FlowDiagram.tsx dagi ro'yxatda bo'lishi kerak). */
  icon: string;
  label: string;
  title: string;
  text: string;
};

export const SERVICE_FLOWS: Record<string, FlowNode[]> = {
  web: [
    { icon: "Search", label: mk("Qidiruv"), title: mk("Mijoz sizni topadi"), text: mk("Sarlavha, tavsif va sitemap — Google va Yandex sahifani tushunadi.") },
    { icon: "Monitor", label: mk("Sayt"), title: mk("Sayt tez ochiladi"), text: mk("Telefon, planshet va kompyuterda birdek qulay.") },
    { icon: "FileText", label: mk("Forma"), title: mk("Murojaat qoldiradi"), text: mk("Murojaat formasi, telefon, Telegram va xarita tugmalari.") },
    { icon: "Bell", label: mk("Siz"), title: mk("Xabar Telegram’ga keladi"), text: mk("Murojaat darhol telefoningizga tushadi.") },
  ],
  telegram: [
    { icon: "User", label: mk("Mijoz"), title: mk("Botni ochadi"), text: mk("Menyu, tugmalar va qadamlar — o‘zbek va rus tilida.") },
    { icon: "Bot", label: mk("Bot"), title: mk("Buyurtmani qabul qiladi"), text: mk("Buyurtma, ariza yoki qabulga yozilish.") },
    { icon: "Bell", label: mk("Xodimlar"), title: mk("Darhol xabar oladi"), text: mk("Yangi buyurtma haqida sizga va xodimlarga xabar.") },
    { icon: "ChartColumn", label: mk("Statistika"), title: mk("Natijani ko‘rasiz"), text: mk("Foydalanuvchilar va buyurtmalar statistikasi, ommaviy xabar.") },
  ],
  ai: [
    { icon: "MessageCircle", label: mk("Savol"), title: mk("Mijoz yozadi"), text: mk("Telegram’da yoki saytingizda, kechasi ham.") },
    { icon: "Database", label: mk("Bilimlar bazasi"), title: mk("Narx va qoidalaringiz"), text: mk("Javob narxlar, xizmatlar va hujjatlaringizga tayanadi.") },
    { icon: "Sparkles", label: mk("AI yordamchi"), title: mk("Javob beradi, ariza yozadi"), text: mk("O‘zbek (lotin va kirill) va rus tilida.") },
    { icon: "Users", label: mk("Xodim"), title: mk("Murakkab savol sizga"), text: mk("Xodimga uzatiladi, yangi ariza haqida Telegram’ga xabar.") },
  ],
  app: [
    { icon: "ClipboardList", label: mk("Hozir"), title: mk("Jadval va qog‘oz"), text: mk("Ish jarayonlarini o‘rganamiz va tizim rejasini tuzamiz.") },
    { icon: "MousePointerClick", label: mk("Maket"), title: mk("Dasturlashdan oldin ko‘rasiz"), text: mk("Maketni bosib sinab ko‘rasiz.") },
    { icon: "Database", label: mk("Bitta dastur"), title: mk("Hammasi bir joyda"), text: mk("Mijozlar, buyurtmalar va vazifalar; rollar va ruxsatlar.") },
    { icon: "ChartColumn", label: mk("Hisobot"), title: mk("Raqamlar ko‘z oldingizda"), text: mk("Hisobotlar, grafiklar va Telegram xabarnomalari.") },
  ],
  design: [
    { icon: "Search", label: mk("Tadqiqot"), title: mk("Foydalanuvchi va raqobatchilar"), text: mk("Kim, nimani va qayerda bosishini o‘rganamiz.") },
    { icon: "Workflow", label: mk("Sxema"), title: mk("Sahifalar va yo‘l"), text: mk("Sahifalar sxemasi va foydalanuvchi yo‘li.") },
    { icon: "Palette", label: mk("Dizayn"), title: mk("Shablonsiz ko‘rinish"), text: mk("Ranglar, shriftlar va komponentlar tizimi.") },
    { icon: "Layers", label: mk("Figma"), title: mk("Dasturchiga tayyor"), text: mk("Telefon, planshet va kompyuter maketlari, bosiladigan prototip.") },
  ],
  integration: [
    { icon: "CreditCard", label: mk("To‘lov"), title: mk("Mijoz to‘laydi"), text: mk("Payme, Click, Uzum, Uzcard va Humo.") },
    { icon: "Briefcase", label: mk("CRM"), title: mk("Buyurtma CRM’ga tushadi"), text: mk("amoCRM, Bitrix24, 1C, МойСклад, Billz.") },
    { icon: "MessageCircle", label: mk("SMS"), title: mk("Mijozga SMS boradi"), text: mk("Eskiz, Playmobile.") },
    { icon: "Bell", label: mk("Siz"), title: mk("Telegram’da xabar"), text: mk("Holat avtomatik yangilanadi — kelishilgan ma’lumotlar o‘zi uzatiladi.") },
  ],
  seo: [
    { icon: "Target", label: mk("Tahlil"), title: mk("Kalit so‘zlar"), text: mk("O‘zbek va rus tilidagi so‘zlar va raqobatchilar.") },
    { icon: "Gauge", label: mk("Audit"), title: mk("Texnik holat"), text: mk("Tezlik, indeksatsiya, sitemap, robots.txt, mobil ko‘rinish.") },
    { icon: "FileText", label: mk("Sahifalar"), title: mk("Matn va tuzilma"), text: mk("Sarlavha, tavsif, savol-javob bloklari va schema.") },
    { icon: "TrendingUp", label: mk("Hisobot"), title: mk("Natija raqamlarda"), text: mk("Har oy: nima qilindi va natija qanday.") },
  ],
  support: [
    { icon: "Eye", label: mk("Kuzatuv"), title: mk("Doim ishlab turadi"), text: mk("Sayt yoki bot ishlashini kuzatamiz.") },
    { icon: "Server", label: mk("Zaxira"), title: mk("Ma’lumot saqlanadi"), text: mk("Muntazam zaxira nusxa.") },
    { icon: "ShieldCheck", label: mk("Himoya"), title: mk("Xavfsiz va yangi"), text: mk("Xavfsizlik yangilanishlari; domen, hosting va SSL muddati.") },
    { icon: "Wrench", label: mk("Tuzatish"), title: mk("Xato va o‘zgarishlar"), text: mk("Xatolarni tuzatish; matn, rasm va narxlarni yangilash.") },
  ],
  audit: [
    { icon: "Monitor", label: mk("Loyihangiz"), title: mk("Sayt, bot yoki ilova"), text: mk("Havolani yuborasiz — telefon va kompyuterda tekshiramiz.") },
    { icon: "Bug", label: mk("Xatolar"), title: mk("Xatolarni topamiz"), text: mk("Tezlik, xavfsizlik, formalar va to‘lov — har biri skrinshot bilan.") },
    { icon: "FileCheck", label: mk("Texnik tavsif"), title: mk("Tuzatish rejasi"), text: mk("Har qanday dasturchi tushunadigan tavsif, narxi va muddati.") },
    { icon: "Wrench", label: mk("Tuzatish"), title: mk("Tanlov sizda"), text: mk("Bizga yoki boshqa dasturchiga berasiz. Bizga bersangiz, tekshiruv narxi chegiriladi.") },
  ],
  ads: [
    { icon: "Users", label: mk("Auditoriya"), title: mk("Kimga ko‘rsatamiz"), text: mk("Kim, qayerda va qaysi tilda — maqsadga qarab aniqlaymiz.") },
    { icon: "Megaphone", label: mk("Reklama"), title: mk("Telegram Ads va Instagram"), text: mk("Kabinetni ochamiz, sozlaymiz va ishga tushiramiz.") },
    { icon: "Monitor", label: mk("Sayt yoki bot"), title: mk("Odam sizga keladi"), text: mk("Sayt, bot yoki kanalingiz reklamaga tayyorlanadi.") },
    { icon: "ChartColumn", label: mk("Natija"), title: mk("Arizalar va hisobot"), text: mk("Ko‘rishlar, bosishlar va arizalarni kuzatib, sozlamalarni yaxshilaymiz.") },
  ],
};
