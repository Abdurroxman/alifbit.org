// Xizmat sahifasidagi «qanday ishlaydi» chizmasi: har xizmat uchun zanjir tugunlari.
// Kalit — xizmat belgisi (Service.icon). Matnlar xizmat tarkibidagi bandlarga tayanadi.

export type FlowNode = {
  /** lucide belgisi nomi (src/components/FlowDiagram.tsx dagi ro'yxatda bo'lishi kerak). */
  icon: string;
  label: string;
  title: string;
  text: string;
};

export const SERVICE_FLOWS: Record<string, FlowNode[]> = {
  web: [
    { icon: "Search", label: "Qidiruv", title: "Mijoz sizni topadi", text: "Sarlavha, tavsif va sitemap — Google va Yandex sahifani tushunadi." },
    { icon: "Monitor", label: "Sayt", title: "Sayt tez ochiladi", text: "Telefon, planshet va kompyuterda birdek qulay." },
    { icon: "FileText", label: "Forma", title: "Murojaat qoldiradi", text: "Murojaat formasi, telefon, Telegram va xarita tugmalari." },
    { icon: "Bell", label: "Siz", title: "Xabar Telegram’ga keladi", text: "Murojaat darhol telefoningizga tushadi." },
  ],
  telegram: [
    { icon: "User", label: "Mijoz", title: "Botni ochadi", text: "Menyu, tugmalar va qadamlar — o‘zbek va rus tilida." },
    { icon: "Bot", label: "Bot", title: "Buyurtmani qabul qiladi", text: "Buyurtma, ariza yoki qabulga yozilish." },
    { icon: "Bell", label: "Xodimlar", title: "Darhol xabar oladi", text: "Yangi buyurtma haqida sizga va xodimlarga xabar." },
    { icon: "ChartColumn", label: "Statistika", title: "Natijani ko‘rasiz", text: "Foydalanuvchilar va buyurtmalar statistikasi, ommaviy xabar." },
  ],
  ai: [
    { icon: "MessageCircle", label: "Savol", title: "Mijoz yozadi", text: "Telegram’da yoki saytingizda, kechasi ham." },
    { icon: "Database", label: "Bilimlar bazasi", title: "Narx va qoidalaringiz", text: "Javob narxlar, xizmatlar va hujjatlaringizga tayanadi." },
    { icon: "Sparkles", label: "AI yordamchi", title: "Javob beradi, ariza yozadi", text: "O‘zbek (lotin va kirill) va rus tilida." },
    { icon: "Users", label: "Xodim", title: "Murakkab savol sizga", text: "Xodimga uzatiladi, yangi ariza haqida Telegram’ga xabar." },
  ],
  app: [
    { icon: "ClipboardList", label: "Hozir", title: "Jadval va qog‘oz", text: "Ish jarayonlarini o‘rganamiz va tizim rejasini tuzamiz." },
    { icon: "MousePointerClick", label: "Prototip", title: "Boshlashdan oldin ko‘rasiz", text: "Bosiladigan prototip." },
    { icon: "Database", label: "Bitta dastur", title: "Hammasi bir joyda", text: "Mijozlar, buyurtmalar va vazifalar; rollar va ruxsatlar." },
    { icon: "ChartColumn", label: "Hisobot", title: "Raqamlar ko‘z oldingizda", text: "Hisobotlar, grafiklar va Telegram xabarnomalari." },
  ],
  design: [
    { icon: "Search", label: "Tadqiqot", title: "Foydalanuvchi va raqobatchilar", text: "Kim, nimani va qayerda bosishini o‘rganamiz." },
    { icon: "Workflow", label: "Sxema", title: "Sahifalar va yo‘l", text: "Sahifalar sxemasi va foydalanuvchi yo‘li." },
    { icon: "Palette", label: "Dizayn", title: "Shablonsiz ko‘rinish", text: "Ranglar, shriftlar va komponentlar tizimi." },
    { icon: "Layers", label: "Figma", title: "Dasturchiga tayyor", text: "Telefon, planshet va kompyuter maketlari, bosiladigan prototip." },
  ],
  integration: [
    { icon: "CreditCard", label: "To‘lov", title: "Mijoz to‘laydi", text: "Payme, Click, Uzum, Uzcard va Humo." },
    { icon: "Briefcase", label: "CRM", title: "Buyurtma CRM’ga tushadi", text: "amoCRM, Bitrix24, 1C, МойСклад, Billz." },
    { icon: "MessageCircle", label: "SMS", title: "Mijozga SMS boradi", text: "Eskiz, Playmobile." },
    { icon: "Bell", label: "Siz", title: "Telegram’da xabar", text: "Holat avtomatik yangilanadi — hech narsani qo‘lda ko‘chirmaysiz." },
  ],
  seo: [
    { icon: "Target", label: "Tahlil", title: "Kalit so‘zlar", text: "O‘zbek va rus tilidagi so‘zlar va raqobatchilar." },
    { icon: "Gauge", label: "Audit", title: "Texnik holat", text: "Tezlik, indeksatsiya, sitemap, robots.txt, mobil ko‘rinish." },
    { icon: "FileText", label: "Sahifalar", title: "Matn va tuzilma", text: "Sarlavha, tavsif, savol-javob bloklari va schema." },
    { icon: "TrendingUp", label: "Hisobot", title: "Natija raqamlarda", text: "Har oy: nima qilindi va natija qanday." },
  ],
  support: [
    { icon: "Eye", label: "Kuzatuv", title: "Doim ishlab turadi", text: "Sayt yoki bot ishlashini kuzatamiz." },
    { icon: "Server", label: "Zaxira", title: "Ma’lumot saqlanadi", text: "Muntazam zaxira nusxa." },
    { icon: "ShieldCheck", label: "Himoya", title: "Xavfsiz va yangi", text: "Xavfsizlik yangilanishlari; domen, hosting va SSL muddati." },
    { icon: "Wrench", label: "Tuzatish", title: "Xato va o‘zgarishlar", text: "Xatolarni tuzatish; matn, rasm va narxlarni yangilash." },
  ],
};
