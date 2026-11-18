# alifbit.org: qidiruv (SEO) va pochta

## Saytning o'zi nima qiladi (kod)

- Har bir sahifa o'z sarlavhasi, tavsifi, canonical havolasi va ijtimoiy tarmoq kartasi (`og:*`, `twitter:*`) bilan keladi — `server/seo.ts`.
- Server sahifaning asosiy matnini (sarlavha, tavsif, xizmat tarkibi, paketlar, savol-javoblar, ichki havolalar) HTML ichida beradi. JavaScript ishlatmaydigan robotlar (Yandex, Bing, Telegram havola ko'rinishi) ham sahifani o'qiydi. Brauzerda React ishga tushganda bu matn odatdagi sahifa bilan almashadi.
- schema.org ma'lumoti: kompaniya (ProfessionalService), sayt (WebSite), sahifa (WebPage), yo'l (BreadcrumbList), xizmat (Service), kurs (Course), maqola (Article), savol-javob (FAQPage).
- `sitemap.xml` — barcha nashr qilingan sahifalar, kontent sahifalarida oxirgi o'zgarish sanasi (`lastmod`).
- `robots.txt` — `/admin`, `/api/` yopiq. 404 va admin sahifalari `noindex`.
- Google rasmlarni katta ko'rsatishi mumkin (`max-image-preview:large`) — Discover (tavsiyalar) uchun shart.

## Pochta: info@alifbit.org

### 1. Xatlarni Gmail'ga yo'naltirish (Cloudflare Email Routing, bepul)

1. Cloudflare dashboard → alifbit.org → **Email** → **Email Routing** → **Enable**. Cloudflare MX va SPF yozuvlarini o'zi qo'shadi — «Add records» ni bosing.
2. **Destination addresses** → Gmail manzilingizni qo'shing va Gmail'ga kelgan xatdagi havola orqali tasdiqlang.
3. **Routing rules** → **Create address**: `info` → Gmail manzilingiz.
4. Tekshiruv: boshqa pochtadan `info@alifbit.org` ga xat yuboring — Gmail'ga tushishi kerak.

### 2. Gmail'dan info@alifbit.org nomidan javob berish (Resend, bepul: kuniga 100, oyiga 3000 xat)

1. resend.com da hisob oching → **Domains** → `alifbit.org` qo'shing.
2. Resend ko'rsatgan DNS yozuvlarini (DKIM `resend._domainkey`, `send` subdomenidagi MX va SPF) Cloudflare **DNS** bo'limiga qo'shing, Resend'da **Verify** bosing.
3. Resend → **API Keys** → faqat yuborish huquqi bilan kalit yarating.
4. Gmail → Sozlamalar → **Hisoblar va import** → **Boshqa manzildan xat yuborish** → `info@alifbit.org`:
   - SMTP server: `smtp.resend.com`, port `465` (SSL)
   - Foydalanuvchi: `resend`, parol: API kalit
   - Gmail tasdiqlash xati yuboradi — u 1-qadamdagi yo'naltirish orqali Gmail'ingizga keladi.

### 3. DMARC (pochta ishonchliligi)

Cloudflare **DNS** → TXT yozuv qo'shing:

- Nomi: `_dmarc`
- Qiymati: `v=DMARC1; p=none; rua=mailto:info@alifbit.org`

Bir-ikki hafta xatlar muammosiz yetib borsa, `p=none` ni `p=quarantine` ga almashtiring.

### 4. Yangi murojaat haqida email (sayt yuboradi)

Sayt murojaat kelganda Telegram'dan tashqari Gmail'ingizga ham xat yuboradi. Mijoz email qoldirgan bo'lsa, Gmail'da «Javob berish» to'g'ridan-to'g'ri mijozga ketadi.

- Kod: `server/mail.ts`, binding `send_email` (`wrangler.jsonc`), jo'natuvchi `PUBLIC_EMAIL` (`info@alifbit.org`).
- Qabul qiluvchi secret: `npx wrangler secret put NOTIFY_EMAIL` → 1-bo'limda tasdiqlangan Gmail manzili.
- **Tartib:** avval 1-bo'lim (Email Routing yoqilgan, Gmail tasdiqlangan), keyin secret, keyin push. Email Routing yoqilmagan bo'lsa, `send_email` binding'i bilan deploy rad etilishi mumkin.
- Secret qo'yilmaguncha email yuborilmaydi, murojaatlar va Telegram xabari odatdagidek ishlaydi.

## Siz bajaradigan ishlar (kod bilan qilib bo'lmaydi)

### Darhol (deploy'dan keyin)

1. **Google Search Console** (search.google.com/search-console). Domen allaqachon tasdiqlangan (DNS TXT yozuvi bor).
   - **Sitemaps** → `https://alifbit.org/sitemap.xml` yuboring.
   - **URL Inspection** → bosh sahifa va har bir xizmat sahifasi uchun «Request indexing».
   - **Rich results test** (search.google.com/test/rich-results) — bitta xizmat va bitta loyiha sahifasini tekshiring.
2. **Yandex Webmaster** (webmaster.yandex.com) — O'zbekistonda qidiruvlarning taxminan 16–24 % i. Saytni qo'shing, DNS yoki meta-teg bilan tasdiqlang, sitemap yuboring. «Regionallik» bo'limida Toshkentni ko'rsating.
3. **Bing Webmaster Tools** — Search Console'dan import qilish bilan 2 daqiqa.

### Google Business Profile (eng muhim mahalliy qadam)

«Toshkentda sayt yaratish», «telegram bot buyurtma» kabi qidiruvlarda va Google Xaritada chiqish uchun:

1. business.google.com → **Add business** → nomi «AlifBit», toifa: «Veb-sayt dizayneri» yoki «Dasturiy ta'minot kompaniyasi».
2. Ofis manzilini ko'rsatmang → **Service area business** → xizmat hududi: Toshkent, O'zbekiston.
3. Sayt `https://alifbit.org`, ish vaqti, 5–10 ta ish rasmi.
4. Tasdiqlash (video yoki pochta) → har hafta bitta yangilik (post).
5. Mijozlardan Google sharhi so'rang — reytingga eng kuchli ta'sir qiladi.

### Mazmun (doimiy)

Google yangi, foydali va tez-tez yangilanadigan saytni yuqoriroq qo'yadi. «Qaydlar» bo'limiga haftasiga 1 ta maqola — odamlar qidiradigan savollar bo'yicha:

- «Telegram bot yaratish narxi 2026», «Sayt yaratish qancha turadi», «Internet-do'kon uchun nima kerak»
- «Telegram do'kon yoki sayt: qaysi biri foydali», «Biznes uchun AI yordamchi qanday ishlaydi»
- Har bir loyiha bo'yicha natija haqida qisqa hikoya

Maqola 800–1500 so'z, sarlavhada qidiruv so'zi, oxirida tegishli xizmat sahifasiga havola.

### Havolalar (backlink)

- Telegram kanal va bot tavsifida `alifbit.org` havolasi.
- sado.alifbit.org, dalolat.app, pay.alifbit.org footer'ida alifbit.org havolasi.
- O'zbek IT kataloglari, freelance profillar (Upwork, Kwork, Fiverr), GitHub, LinkedIn, Facebook va Instagram sahifasi.
- Mijoz saytlari footer'ida «Sayt: AlifBit» havolasi (kelishib).

### Kuzatish

- Search Console → **Performance**: qaysi so'zlar bilan topilmoqda, nechta bosilmoqda — oyiga bir marta.
- Natija odatda 4–12 haftada ko'rina boshlaydi. Birinchi o'rin kafolatlanmaydi — mazmun, havolalar va sharhlar hal qiladi.
