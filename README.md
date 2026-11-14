# AlifBit

Logotipga mos ivory, yashil va bronza ranglaridagi premium kompaniya sayti. Asosiy til — o‘zbekcha. Aloqa: https://t.me/id799.

## Mahalliy ishga tushirish

Loyiha papkasida:

```powershell
npm ci
npm run setup:local
npm run db:local
npm run build
npm run preview
```

Sayt: http://127.0.0.1:8787

Ishlayotgan production sayt: https://alifbit.org. Production admin paroli shu kompyuterdagi Git’dan chiqarilgan `production-admin.txt` faylida. Tashqi bot bildirishnomalaridan tashqari asosiy Worker/D1/R2 xizmatlari sozlangan. Deploy holati va tekshiruv chegaralari `docs/DEPLOYMENT.md` da.

Admin: http://127.0.0.1:8787/admin

`setup:local` tasodifiy mahalliy administrator parolini yaratadi. Parol `local-admin.txt` faylida. Bu fayl, `.dev.vars`, `.env`, `.wrangler` va `node_modules` GitHub yoki source ZIP’ga kirmasligi kerak. Mahalliy parolni production uchun ishlatmang.

Tez frontend ishlab chiqish uchun `npm run preview` yonida ikkinchi terminalda `npm run dev` ishlating. Vite http://127.0.0.1:5173 manzilida ishlaydi va API so‘rovlarini 8787 portiga uzatadi. Administrator sessiyasi uchun to‘liq Worker preview manzilidan foydalaning.

Loyihaga lokal Node 22 dev dependency sifatida kiritilgan: npm skriptlari shu versiyani ishlatadi. Tavsiya etilgan tizim Node versiyasi ham 22 yoki undan yangi qo‘llab-quvvatlanadigan LTS versiyasidir.

## Tuzilishi va texnologiyalar

- `src/components` — header/footer (`Layout`), logotip (`Brand`), kirish animatsiyasi (`Intro`), hero kompozitsiyasi (`HeroScene`), «G‘oyadan mahsulotga» scroll sahnasi (`Process`), loyiha muqovalari (`ProjectArt`) va umumiy UI (`ui.tsx`).
- `src/pages` — har bir sahifa alohida faylda: `Home`, `Projects`, `Services`, `About`, `Contact`, `Ecosystem`, `Journal`, `Privacy`, `NotFound`, `Admin`.
- `src/styles` — dizayn tizimi: `base.css` (tokenlar), `ui.css` (tugma, forma, belgilar), `layout.css`, `motion.css` (scroll’da ochilish), `intro.css`, `hero.css`, `process.css`, `home.css`, `pages.css`, `art.css`, `admin.css`.
- `src/lib/motion.ts` — kirish rejimi, scroll’da ochilish va magnit tugmalar.
- `shared/logo.ts` — logotipning yagona vektor manbasi (sayt va `public/brand` fayllari shundan olinadi).
- `shared/content.ts` — turlashtirilgan kontent, boshlang‘ich ma’lumotlar, menyu va SEO metadata.
- `server` — Cloudflare Worker API, server validatsiyasi, autentifikatsiya va metadata.
- `db/migrations` — Cloudflare D1 / SQLite migratsiyalari.
- `public` — logotiplar, mahalliy shriftlar va optimallashtirilgan tasvirlar.
- `scripts` — lokal sozlash, parol xeshlash, asset tayyorlash va integratsiya tekshiruvi.

Frontend: React, TypeScript, React Router, Vite. Backend: Cloudflare Workers, D1 va R2. Briefdagi Next.js/PostgreSQL tavsiyasi o‘rniga foydalanuvchining mavjud Cloudflare Workers + GitHub yo‘liga mos stack tanlangan. Birinchi versiyaga alohida VPS yoki PostgreSQL serveri talab qilinmaydi. Zarurat tug‘ilganda API qatlamini boshqa bazaga ko‘chirish mumkin.

## Mavjud sahifalar

`/`, `/projects`, `/projects/:slug`, `/services`, `/services/:slug`, `/academy`, `/library`, `/films`, `/render`, `/about`, `/contact`, `/privacy`, `/journal`, `/journal/:slug`, `/admin`.

Katalog kategoriyalar bilan filtrlanadi, filtr manzilda saqlanadi. Dinamik loyiha sahifalari bazadan keladi. Bosh sahifaga birinchi kirishda logotip bo‘laklardan yig‘iladi va header’ga uchib boradi (≈1,9 s; scroll yoki tugma bosilsa darhol tugaydi); keyingi tashriflarda qisqa variant. To‘liq variantni qayta ko‘rish: `/?intro=1`. Desktop’da «G‘oyadan mahsulotga» sahnasi scroll bilan to‘rt bosqichda oldinga va orqaga harakatlanadi; mobil va reduced-motion holatida u to‘rtta qisqa bosqichga aylanadi. Logotip fayllarini qayta chiqarish: `node --experimental-strip-types scripts/prepare-assets.mjs`. Render sahifasida klaviatura bilan ham boshqariladigan taqqoslash slayderi bor.

## Sado sahifasi va o‘rnatuvchi

`/sado` — Sado (Windows uchun ovozli yozish) taqdimoti: animatsion namuna, rejimlar, imkoniyatlar, maxfiylik, yuklab olish va savollar. Bosh sahifada Sado bloki, menyuda «Sado» bandi bor. «Kalit so‘rash» formani `?service=products&request=sado-key` bilan ochadi.

Yuklab olish `/download/sado` orqali R2 dagi `public/downloads/<fayl>` ni beradi. `shared/content.ts` dagi `sadoRelease.size` 0 bo‘lsa, sahifa «tez kunda» holatini ko‘rsatadi. O‘rnatuvchi tayyor bo‘lganda:

1. `C:\claude\sado` da: `$env:SADO_SERVER_URL="https://sado.alifbit.org"; npm run desktop:build` (`.exe` — `apps/desktop/src-tauri/target/release/bundle/nsis/`).
2. Yuklash: `npm exec wrangler -- r2 object put alifbit-media/public/downloads/Sado_<versiya>_x64-setup.exe --file <yo‘l> --remote` (lokal sinov uchun `--local`).
3. `sadoRelease` ga versiya, fayl nomi, hajm (bayt) va SHA-256 (`Get-FileHash <yo‘l>`) ni yozing.

## Administrator qo‘llanmasi

1. `/admin` da parol bilan kiring.
2. **Loyihalar → Loyiha qo‘shish**: nom, slug, kategoriya, status, tavsiflar, imkoniyatlar va platformalarni kiriting. Masalan, slug `yangi-loyiha` bo‘lsa, sahifa `/projects/yangi-loyiha` bo‘ladi.
3. Muqova uchun mavjud dizaynni tanlang yoki PNG/JPG/WEBP yuklang. Fayl 5 MB dan oshmasin.
4. **Saytda nashr qilish** belgisiz loyiha qoralama holatida qoladi. Nashr qilinmagan loyiha public API va sitemap’da chiqmaydi, sahifasi 404 qaytaradi.
5. **Kategoriyalar**: har birini alohida satrda yozib saqlang. Ishlatilayotgan kategoriyani o‘chirishdan oldin tegishli loyihalarning kategoriyasini o‘zgartiring.
6. **Xizmatlar**: sarlavha, qisqa matn, tavsif va tarkibni tahrirlang.
7. **Qaydlar → Qayd yozish**: maqola, slug va SEO matnini kiriting. Qoralama yoki nashr holatini tanlang. Matn oddiy xatboshilar sifatida chiqariladi; HTML ishlatilmaydi.
8. **Murojaatlar**: qidiring, holat bo‘yicha filtrlang, batafsil ko‘ring va statusni o‘zgartiring. Biriktirilgan fayl faqat kirgan administratorga ochiladi.
9. **Faoliyat tarixi**: nashr/tahrir, murojaat statusi, o‘chirish va kirish amallari qayd etiladi; logda murojaatning shaxsiy matni saqlanmaydi.

## Cloudflare production sozlash

### 1. Hisobga kirish va resurslar

```powershell
npm exec wrangler login
npm exec wrangler d1 create alifbit-db
npm exec wrangler r2 bucket create alifbit-media
```

Bu nusxada AlifBit’ning D1 va R2 resurslari allaqachon yaratilib, haqiqiy `database_id` konfiguratsiyaga qo‘yilgan. Yuqoridagi yaratish buyruqlari boshqa hisobga ko‘chirish uchun; shu hisobda qayta bajarmang. Boshqa hisobga ko‘chirilganda uning yangi `account_id` va `database_id` qiymatlarini qo‘ying. R2 faollashtirish billing tasdig‘ini so‘rasa, hisob egasi buni o‘zi bajaradi.

### 2. Maxfiy kalitlar

Administrator paroli uchun xesh yarating. Skript parolni ekranga chiqarmaydi:

```powershell
node scripts/hash-password.mjs
npm exec wrangler secret put ADMIN_PASSWORD_HASH
npm exec wrangler secret put SESSION_SECRET
npm exec wrangler secret put IP_HASH_SECRET
```

`ADMIN_PASSWORD_HASH` uchun skript qaytargan xeshni, qolgan ikkita secret uchun alohida kamida 32 baytli tasodifiy qiymatlarni kiriting. Parolning o‘zi frontendga ham, Cloudflare public variables’ga ham yozilmaydi. `LOCAL_DEV` ni production’da qo‘ymang. Runtime kod lokal flagni faqat loopback manzillarda tan oladi.

### 3. Bildirishnomalar — ixtiyoriy tashqi xizmat

Yangi murojaatlar har doim bazaga va outbox’ga yoziladi. Telegram sozlanmasa, murojaat qabul qilinishi ishlaydi, lekin tashqi bildirishnoma yuborilmaydi; admin panel bu holatni ochiq ko‘rsatadi.

O‘zingiz yaratgan bot tokeni va faqat sizga tegishli admin chat ID bilan:

```powershell
npm exec wrangler secret put TELEGRAM_BOT_TOKEN
npm exec wrangler secret put TELEGRAM_CHAT_ID
```

Telegram username (`@id799`) chat ID o‘rnini bosmaydi. Admin avval bot bilan suhbatni boshlashi kerak. Maxfiy tokenlarni GitHub’ga yozmang. Bildirishnomada faqat murojaat raqami va admin panel havolasi bor; mijoz tafsilotlari yoki fayl yuborilmaydi. Cron har 5 daqiqada yetkazilmagan xabarlarni qayta ko‘radi, jami 8 urinishgacha. Muvaffaqiyatsiz xabarlar outbox’da qoladi. Mahalliy Wrangler cron’ni avtomatik ishga tushirmaydi.

### 4. Migratsiya va deployment

```powershell
npm run db:remote
npm run deploy
```

Migratsiyalar yangi boshlang‘ich kontentni qo‘shadi, admin tahrirlagan kontentni qayta yozmaydi. Mavjud D1 bazasiga migratsiya qilishdan oldin backup oling.

Cloudflare’dagi mavjud `alifbit-org` Worker loyihasining GitHub build sozlamalari:

| Sozlama           | Qiymat                                                                   |
| ----------------- | ------------------------------------------------------------------------ |
| Build command     | Bo‘sh qolishi mumkin — Wrangler custom build `npm run build` ni bajaradi |
| Deploy command    | `npx wrangler deploy`                                                    |
| Root directory    | `/`                                                                      |
| Production branch | `main`                                                                   |
| Node.js version   | `22`                                                                     |

`npm ci` odatda Cloudflare build tomonidan bajariladi. `wrangler.jsonc` dagi custom build tufayli avvalgi `npx wrangler deploy` buyrug‘i o‘z-o‘zidan production frontendni yig‘adi. D1 ID, R2 bucket va runtime secrets joyida bo‘lishi kerak. Qurilgan `dist` tarkibi Worker’ning assets binding’i orqali xizmat qiladi.

### 5. Domen

Deployment muvaffaqiyatli bo‘lgach Cloudflare’da:

**Workers & Pages → alifbit-org → Domains (yoki Settings → Domains & Routes) → Add → Custom Domain → alifbit.org.**

`www.alifbit.org` ham kerak bo‘lsa, uni alohida custom domain sifatida qo‘shing va asosiy `alifbit.org` ga Cloudflare redirect qoidasi yarating. Custom domain sozlamasi tegishli DNS va sertifikatni boshqaradi. Tasodifiy IP manzil yozish shart emas.

## Tekshiruvlar

```powershell
npm run build
npm test
node scripts/integration-test.mjs
```

Oxirgi buyruq uchun lokal preview 8787 portida ishlashi kerak. U faqat `127.0.0.1` ga murojaat qiladi, o‘zi yaratgan test murojaati va faylini tozalaydi, DALOLAT nashr holatini tiklaydi. Natija `test-artifacts/integration.json` ga yoziladi. Public production’da shu skriptni ishlatmang.

Tekshirilgan server xatti-harakatlari: yo‘llar va SEO, xavfsizlik headerlari, kirish ruxsati, boshqa origin’dan yozishning rad etilishi, parol/sessiya, haqiqiy buyurtma va faylning saqlanishi, xato faylning rad etilishi, CMS nashri va yashirish, maxfiy faylga yopiq kirish, buyurtma statusi, o‘chirish va logout.

Brauzerning avtomatik vizual tekshiruvi bu sessiyada Windows brauzer URL’ini tasdiqlay olmagani uchun bajarilmadi. iPhone Safari, Android Chrome, 320/390/768/1440 px ko‘rinishlar, Lighthouse va real qurilma Core Web Vitals natijalari hali tasdiqlanmagan. 90+ ball yoki WCAG muvofiqligi tekshirilmasdan da’vo qilinmaydi. Qabul qilishdan oldin mobil menyu, to‘rt bosqichli scroll, forma, barcha yo‘llar va klaviatura navigatsiyasini qo‘lda ko‘rib chiqing.

## Xavfsizlik va foydalanish

Serverda Zod validatsiyasi, parametrli SQL, origin tekshiruvi, PBKDF2 parol xeshi, serverdagi muddatli sessiya, HttpOnly/SameSite cookie va production’da Secure cookie bor. Lokal cookie faqat loopback manzilda Secure’siz ishlaydi. Login uchun 15 daqiqada 8 ta, murojaat uchun soatiga 5 ta so‘rov cheklovi mavjud. Cheklov kalitida IP’ning maxfiy HMAC qiymati saqlanadi; IP manzilning o‘zi yozilmaydi. Fayl o‘lchami oqim o‘qilayotganda ham nazorat qilinadi, fayl turi signaturadan aniqlanadi, SVG/HTML qabul qilinmaydi. Private fayl administrator tekshiruvisiz berilmaydi.

Texnik xavfsizlik mustaqil penetration test yoki huquqiy audit o‘rnini bosmaydi. Production’da Cloudflare rate-limit/WAF va monitoring’ni trafik talablari asosida sozlang. Worker kuzatuv loglari yoqilgan. Telegram xatolarida token loglanmaydi.

## Backup va ma’lumotlar muddati

```powershell
npm exec wrangler d1 export alifbit-db --remote --output=alifbit-backup.sql
```

Backup’da shaxsiy ma’lumotlar bo‘lishi mumkin: uni ochiq repository yoki public R2 prefiksiga joylamang. Alohida yopiq, shifrlangan saqlash va davriy export jadvali hisob egasi tomonidan sozlanadi. Cloudflare D1 Time Travel imkoniyatini ham hisob tarifi bo‘yicha tekshiring. R2 fayllarini alohida yopiq backup saqlashga nusxalang; D1 export fayl binarylarini o‘z ichiga olmaydi. Public tasvirlar va private murojaat fayllari prefikslari ajratilgan.

Maxfiylik siyosatidagi 12 oylik muddatni administrator nazorat qiladi: yakunlangan eski murojaatni admin paneldan o‘chiring. O‘chirish R2 faylini, outbox yozuvini va bazadagi murojaatni olib tashlaydi. Muhim o‘zgarishlardan oldin backup olish, backup’dan tiklashni sinash va backup muddatini belgilash kerak. Avtomatik backup tizimi bu versiyada provayder hisobiga ulanmagan.

## Brend va tasdiqlanishi kerak bo‘lgan kontent

Foydalanuvchi yuborgan yashil qavslar va oltin Alif logosi asosida qo‘lda SVG belgi qayta chizildi. Bu tasvirning soddalashtirilgan vektor talqini; original professional vektor manba bilan piksel darajasidagi moslik da’vo qilinmaydi. Rangli, och fon, to‘q fon, bir rangli va favicon versiyalari `public/brand` ichida.

Asosiy 3D hero rasmi Imagegen bilan aynan shu sayt uchun yaratildi; prompt va fayllar `docs/ASSETS.md` da. Muqovalardagi interfeyslar, kitoblar va arxitektura kompozitsiyalari dizayn konsepsiyalari sifatida belgilangan. Haqiqiy foydalanuvchi statistikasi, soxta mijozlar yoki mavjud bo‘lmagan kurslar kiritilmagan. DALOLAT, ovozdan matnga va boshqa loyihalarning holati, imkoniyatlari va rasmiy havolalari egasi tasdiqlagach CMS’da yangilanishi kerak. Hozirgi holat — «Taqdimot».

## Keyingi kengaytirish

To‘liq LMS, checkout, pullik kitob/video, GPU navbati va billing kiritilmagan. Birinchi versiyada marketing/taqdimot, dinamik katalog, CMS va murojaat boshqaruvi bor. CMS ma’lumotlari JSON ko‘rinishida saqlanadi; keyinchalik tarjima xaritasi va `dir="rtl"` arabcha kompozitsiya qo‘shilishi mumkin. Hozir barcha sahifalar o‘zbekcha; to‘liq i18n matn katalogi va boshqa tillar tarjimasi keyingi alohida ishdir.
