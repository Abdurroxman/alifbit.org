# «Boshqa kompaniyalardan misollar» uchun ekran rasmlari (Higgsfield)

Har bir misol kartasida MacBook va iPhone ramkasi bor. Higgsfield faqat **ekranning ichini** chizadi: qurilma, stol va fon chizilmaydi. Rasmdagi matn o‘rnida kulrang chiziqlar bo‘ladi. Ularni sayt o‘zi topib, o‘rniga 4 tildagi haqiqiy yozuvlarni qo‘yadi, shuning uchun chiziqlar aniq va bir-biridan ajralgan bo‘lishi kerak.

| Belgi | Qurilma | Higgsfield o‘lchami (`size`) | Admin'dagi tugma |
|---|---|---|---|
| **K** | MacBook ekrani | `2704x1600` | «Kompyuter ekrani» |
| **T** | iPhone ekrani (holat qatorisiz) | `1248x2560` | «Telefon ekrani» |

O‘lchamlar saytdagi ramkalarning ekran nisbatiga aniq teng, rasm kesilmaydi. iPhone'ning soat va batareya qatorini sayt o‘zi qo‘yadi, rasmda u bo‘lmasligi kerak.

Yuklash: **Admin › Xizmatlar › [xizmat] › Boshqa kompaniyalardan misollar › Misol N** → «Kompyuter ekrani» / «Telefon ekrani» → **Saqlash**.

## Claude ilovasida yaratish

Higgsfield ulangan suhbatga shu xabarni yuboring, ostiga bitta xizmat bo‘limini nusxalab qo‘shing:

```
Higgsfield'da generate_image_batch bilan quyidagi har bir prompt uchun bittadan rasm yarat.
Model: gpt_image_2_6, quality: high, resolution: 2k.
K bilan boshlanganlari: size 2704x1600. T bilan boshlanganlari: size 1248x2560.
Har bir promptning oxiriga UMUMIY USLUB qatorini, T promptlariga yana TELEFON qatorini,
bot va Mini App promptlariga TELEGRAM qatorini qo‘sh; {ACCENT} o‘rniga bo‘lim rangini yoz.
Tayyor bo‘lgach rasmlarni prompt nomi bilan (masalan web-1-K) ko‘rsat.
```

Agar `size` qabul qilinmasa: K uchun `16:9`, T uchun `9:16` tanlang (sayt chetlarini biroz kesib sig‘diradi).

**UMUMIY USLUB** (hamma promptga):

```
Flat UI screenshot only, full-bleed, straight-on. No device frame, no hands, no desk, no background around the screen. Modern clean interface, light theme, soft shadows, rounded cards, realistic photos of products, food or places where needed (no people's faces), accent color {ACCENT}. Every word of text is drawn as a solid flat rounded placeholder bar, one bar per line of text, clearly separated from neighbours: darker grey bars for titles, lighter grey bars for secondary lines, a light bar inside coloured buttons. Digits, prices and times may stay as real numbers. No logos, no brand names, no watermarks.
```

**TELEFON** (T promptlariga qo‘shimcha):

```
Phone app screen content only, tall portrait. Do NOT draw the phone status bar (no clock, no battery, no signal icons): the image starts directly with the app header. Keep every icon, button and text bar at least 6% away from the left and right edges.
```

**TELEGRAM** (bot va Mini App promptlariga qo‘shimcha):

```
Telegram-style messenger look: header with back arrow, round bot avatar, a title bar and a short subtitle bar; softly patterned chat wallpaper with subtle doodles tinted with {ACCENT}; incoming bot messages in white bubbles on the left with a tail, outgoing messages in light {ACCENT} bubbles on the right with small double-check marks; inline keyboard buttons as rounded semi-transparent rectangles attached directly under bot messages; bottom input bar with attach icon, message field and microphone icon. No Telegram logo.
```

---

## 01 · Sayt yaratish — ACCENT: cobalt blue #2357e8

**web-1 · EVOS sayti** (kompaniya sayti)
- K: `Homepage of a fast-food delivery chain website: top menu bar with 4 menu bars, search and cart icons and a blue button; large hero banner with a chicken wrap and fries photo, title bar, two text lines and a blue button with a phone icon; below, a city map with 5 branch pins on the left and a numbered list of 5 branches on the right.`
- T: `Mobile version of the same food delivery website: header with menu icon, title bar, search and cart icons; hero photo of a wrap; title and two text lines; wide blue button with a phone icon; small map with 3 branch pins; list of 3 branch cards with storefront photos and arrow buttons.`

**web-2 · Texnomart internet-do‘koni** (internet-do‘kon)
- K: `Electronics online store catalog page: header with logo bar, menu bars, wide search field, user, heart and cart icons with counter; left filter column with checkboxes and a price range slider; 4-column product grid of washing machines, TVs and smartphones, each card with photo, two text bars, price in a blue chip like 7 499 000, a small "× 12" installment chip and a cart button.`
- T: `Mobile product page of an electronics store: back arrow, title bar, search and cart icons; large photo of a stainless refrigerator in a kitchen with 4 carousel dots; title bar and price; installment block with three chips 3, 6, 12 (12 selected); payment block with four generic bank card tiles; features row with snowflake, arrows and leaf icons; bottom heart button and a wide blue add-to-cart button.`

**web-3 · Click mahsulot sayti** (bir sahifali sayt)
- K: `Fintech product landing page: hero with two big title bars, two text lines, a blue and a light button, and on the right a phone showing a payment app with balance 2 480 000 and three transactions; three feature cards with wallet, cashback coin and transfer arrow 3D icons; a lower developer section with text bars on the left and a dark code block on the right.`
- T: `Mobile landing page of the same fintech product: hero with title bars and a blue button, phone mockup with a balance card, then the three feature cards stacked vertically.`

**web-4 · Uzum korporativ sayti** (kompaniya sayti)
- K: `Company ecosystem hub page: header with menu bars, bell icon and user avatar; hero banner with title bar, two lines, a blue arrow button and on the right a glowing platform with six floating service icons; below, a 3×2 grid of service tiles on pastel backgrounds with 3D objects: shopping bag, delivery scooter, bank card, calendar, car, briefcase.`

## 02 · Telegram bot va ilovalar — ACCENT: Telegram blue #0e87c9

**tg-1 · EVOS yetkazib berish boti** (Telegram bot)
- T: `Telegram chat with a food ordering bot: bot greeting message; bot message with a chicken wrap photo card, title and price bars, quantity minus/1/plus control; inline keyboard of 6 menu category buttons in 2 columns under the next bot message; outgoing message with a location pin and two text bars; bot reply bubble.`

**tg-2 · KFC Uzbekistan boti** (Telegram bot)
- T: `Telegram chat with a delivery bot showing the cart: bot message, outgoing short message, bot message; then a white cart card with a title bar, order number bar, two items (fried chicken bucket and a cola cup photos) with quantity 1 and 2 and minus/plus controls, three summary rows with prices on the right and a bold total row; inline keyboard with two buttons (delivery truck icon, shopping bag icon) and a wide confirm button.`

**tg-3 · Oqtepa Lavash boti** (Telegram bot)
- T: `Telegram chat with a fast-food bot: bot message; a 2×2 grid of round category photos (wrap, burger, cold drink, cake) each with a caption bar; outgoing message; bot message with a large lavash wrap photo, title bar, price 32 000 and an inline quantity control with an add button; input bar at the bottom.`

**tg-4 · Oshme** (Telegram bot, joy band qilish)
- T: `Telegram chat with a restaurant guide bot: bot message, outgoing message, bot message; three restaurant cards with cozy interior photos, title and address bars, star rating like 4.5 and a small blue button; bot message asking for time; inline keyboard with time buttons 18:00, 19:00 (selected), 20:00.`

**tg-5 · Цветов.ру Mini App** (Telegram ichidagi ilova — gul do‘koni, Rossiya, t.me/cvetov_app_bot)
- T: `Telegram Mini App flower store opened inside Telegram: thin top bar with a "close" bar on the left, title bar in the center and three-dots icon on the right; search field; row of category chips (one selected in {ACCENT}); 2-column grid of bouquet cards with fresh flower bouquet photos (roses, tulips, peonies, mixed), title bars, prices like 450 000 and small round plus buttons; at the very bottom a full-width bright {ACCENT} main button with a light text bar and a small white badge with number 3.`
- K: `The same Telegram Mini App flower store opened in Telegram Desktop: left narrow chat list column with round avatars and grey bars, center chat with a bot message and a big inline button, and on the right a tall Mini App window showing the bouquet grid with photos, prices and a bottom main button in {ACCENT}.`

**tg-6 · Durger King** (Telegram ichidagi ilova — Telegram jamoasining namuna Mini App'i, t.me/DurgerKingBot)
- T: `Telegram Mini App food ordering inside Telegram: thin top bar with a "close" bar, title bar and three-dots icon; 3-column grid of cartoon-style food item tiles (burger, fries, hot dog, taco, pizza, donut, cake, cola, ice cream) each with a title bar, price like 25 000 and an orange add button, some tiles showing a minus button and a small count badge; at the very bottom a full-width bright green main button with a light text bar.`

## 03 · AI yordamchi yaratish — ACCENT: violet #7445e6

**ai-1 · Lola — bank yordamchisi** (savollarga javob beruvchi yordamchi)
- T: `Banking app chat assistant screen: header with back arrow, round glowing gradient assistant avatar and title bar; assistant message bubbles answering a question about a card limit, with a small info card showing a limit amount 15 000 000; quick reply chips; a "talk to an operator" button with a headset icon; input bar at the bottom.`

**ai-2 · Kaspi AI yordamchisi** (buyurtma va tizimlar bilan ishlovchi yordamchi)
- T: `Shopping app with an AI assistant: user message bubble; assistant reply bubble with two text lines; three recommended product cards with photos (headphones, electric kettle, backpack), prices and "add" buttons; a summary card with total and a wide checkout button; input bar with a sparkle icon.`

**ai-3 · Klarna AI yordamchisi** (savollarga javob beruvchi yordamchi)
- K: `Payments website account page with a support chat widget open on the right: the widget has an assistant avatar, message bubbles, a language selector chip and an order card with a status timeline (ordered, shipped, delivered); the page behind shows purchase history rows.`
- T: `Mobile support chat with an AI assistant: order card with product photo and a status timeline inside the chat, assistant messages, quick reply chips, typing indicator dots, input bar.`

**ai-4 · Uzum Avto chat-botlari** (savollarga javob beruvchi yordamchi)
- T: `Telegram chat with a car marketplace support bot: bot message with a car photo card, title and price bars; inline keyboard with 4 frequently asked question buttons; outgoing question; bot message saying the request was passed to an operator, with a small headset icon and an estimated time chip 2 min.`

## 04 · Biznes uchun dastur va ilovalar — ACCENT: orange #e2620a

**app-1 · Click SuperApp** (mobil ilova)
- T: `Payment super-app home screen: greeting bar with avatar; balance card 2 480 000 with eye icon and top-up button; grid of 8 service tiles (mobile, utilities, internet, transport, games, taxes, parking, more icons); recent transactions list with icons and amounts like −120 000 and +500 000; bottom tab bar with 5 icons.`

**app-2 · Uzum Market** (mobil ilova)
- T: `Marketplace shopping app feed: search bar with camera icon; row of category chips; promo banner; 2-column grid of product cards with clothing and gadget photos, price bars like 189 000, old price crossed, rating stars 4.8; bottom tab bar with cart badge 2.`

**app-3 · EVOS ilovasi** (mobil ilova)
- T: `Food ordering app order tracking screen: map with a delivery route line, restaurant pin and courier scooter pin; status steps accepted, cooking, on the way (third active) with icons; ETA chip 25 min; courier card with avatar silhouette and a call button; order items list with small food photos.`

**app-4 · Uzum Nasiya** (mobil ilova)
- T: `Installment payment app: circular credit limit gauge 12 000 000; monthly payment schedule list with dates and amounts like 1 250 000, the next one highlighted; a wide pay button; payment method tiles as generic card shapes.`

**app-5 · BILLZ** (mijozlar va buyurtmalarni boshqarish dasturi — savdo, ombor, CRM, O‘zbekiston, billz.io)
- K: `Retail back-office web app dashboard: left sidebar with 7 menu icons and bars; top bar with search and user avatar; KPI cards (sales 48 500 000, receipts 312, customers 1 240, stock value 96 300 000) with small sparklines; table of top products with small product photos, stock quantities and amounts; a bar chart of sales by day; a customer loyalty card with cashback percent 5%.`
- T: `Mobile companion of the same retail system: header with title bar; today's sales total card; list of stores with daily amounts; low-stock alert card with product photo and quantity 3; bottom tab bar with 4 icons.`

## 05 · Sayt va ilova dizayni — ACCENT: magenta #d6337f

**design-1 · Paynet ilovasi** (ilova dizayni)
- T: `Redesigned payments app home screen: wallet card with top-up and withdraw buttons; quick transfer contacts row with circle avatars showing initials only; utility payments tiles with icons; installment block; bottom tab bar; clean modern design system look with consistent spacing.`

**design-2 · Hamkorbank sayti** (sayt dizayni)
- K: `Bank website homepage: header with menu bars and a green-accent button; hero with loan offer title bars and an online application button; credit calculator card with sliders for amount 50 000 000 and term 24 and a monthly payment result; row of product cards for cards, deposits and loans.`
- T: `Mobile bank website: step-by-step online application form with a progress bar (step 2 of 4), labelled input fields drawn as bars, a checkbox and a large continue button.`

**design-3 · Agrobank Mobile** (ilova dizayni)
- T: `Mobile banking app home: balance 8 450 000 at the top; colorful bank card carousel; saved payment groups as rounded tiles; a spending calendar with colored days and a category donut chart.`

**design-4 · Converse Bank ilovasi** (mavjud dizaynni yangilash)
- T: `Mobile banking app home built from widgets, dark theme: cards widget, quick payments widget, currency rates widget with small numbers like 412.50, consistent design tokens and spacing.`

## 06 · To‘lov va boshqa tizimlarni ulash — ACCENT: emerald #0c9a6f

**int-1 · Telegram + Bitrix24** (CRM'ga ulash)
- K: `CRM dashboard with kanban columns (new, in progress, done) of client cards, each card with a small paper-plane messenger icon; a side panel showing a chat conversation attached to the selected card with message bubbles.`

**int-2 · Do‘konda to‘lov tizimlari** (to‘lov tizimlarini ulash)
- K: `Online store checkout page: order summary with product photos and total 9 860 000 on the right; payment method selection on the left as four generic card/wallet tiles (one selected with a green check); installment toggle; green pay button.`
- T: `Mobile checkout: delivery address card, payment method list with four generic tiles, one selected, total and a wide green pay button.`

**int-3 · Ilovada to‘lov tizimlari** (to‘lov tizimlarini ulash)
- T: `Mobile payment method picker: amount 1 250 000 at the top; list of four payment options with generic wallet, card, bank and terminal icons, one selected with a green check; wide pay button; small secure lock badge.`

**int-4 · Multicard — Bitrix24 uchun** (to‘lov tizimlarini ulash)
- K: `CRM deal card with a payment block: amount 3 400 000, a "create payment link" button, payment status changing to paid with a green badge, payment history table below.`

**int-5 · Eskiz SMS** (SMS xabarnomalar ulash, O‘zbekiston, eskiz.uz)
- K: `SMS gateway dashboard: balance card, sent today 1 248 and delivered 98% cards, line chart of messages by hour, table of recent messages with phone numbers like +998 90 *** ** 12, status chips delivered/pending.`
- T: `Phone lock screen style list of incoming SMS notifications: three notification cards with a message icon, sender bar, two text bars and time like 09:41, one showing a 6-digit code 482 913.`

**int-6 · UzumSync — МойСклад va Uzum Market** (hisob va ombor tizimlarini ulash, moysklad.ru ilovalar katalogi)
- K: `Warehouse sync screen: two columns connected by arrows in the middle — left a marketplace seller product list, right a warehouse stock table; rows with product photos, SKU bars and quantities like 24 → 23; a green "synced 2 min ago" chip at the top.`

## 07 · Google va Yandex uchun saytni sozlash — ACCENT: amber #b98500

**seo-1 · Onlayn dorixona** (saytni tekshirish va qidiruvga moslash)
- K: `Website analytics dashboard: rising line chart of visits from search over 12 months; page speed gauge in the green zone with score 84; table of top pages with small up arrows and numbers.`

**seo-2 · Bank sayti** (qidiruv bo‘yicha oylik xizmat)
- K: `Search results page with abstract result blocks, the top result highlighted with an amber outline; side card showing search visibility growing on a small bar chart.`

**seo-3 · Ko‘chmas mulk sayti** (qidiruv bo‘yicha oylik xizmat)
- K: `Real estate website listing page: breadcrumb bar at the top; filter sidebar; grid of apartment cards with building photos, price bars like 85 000 $, room and area chips.`
- T: `Mobile real estate listing: search field, filter chips, two large apartment cards with photos, price and room chips.`

**seo-4 · Maxsus kiyim ishlab chiqaruvchi** (saytni tekshirish va qidiruvga moslash)
- K: `Manufacturer catalog website: header with search field; product grid of workwear jackets, vests and hard hats; a small chart card in the corner showing traffic growth.`

## 08 · Sayt va botlarga texnik xizmat — ACCENT: red #d63a3a

**support-1 · Bulutga ko‘chirish va 24/7 yordam** (kengaytirilgan texnik xizmat)
- K: `Cloud control panel: server cluster status cards all green with CPU and memory mini charts; backup schedule list with times like 03:00; DDoS protection shield status card; 24/7 support chat button in the corner.`

**support-2 · TCloud hosting** (asosiy texnik xizmat)
- K: `Hosting client area: domain search bar on top; three hosting plan cards (small, medium, large) with price numbers like 120 000 and feature bars; support ticket button.`

**support-3 · Uztelecom ma’lumotlar markazlari** (serverni joylashtirish)
- K: `Data center colocation dashboard: rack diagram with occupied units highlighted; power and temperature gauges (4.2 kW, 22 °C); uptime card 99.98%.`

**support-4 · Sayt ishlashini kuzatish (monitoring)** (asosiy texnik xizmat)
- K: `Website monitoring dashboard: uptime bars for 30 days mostly green with one red incident; response time chart in ms; list of checks with status dots.`
- T: `Phone notifications: alert card that a website is down with a red dot and time 02:14, then a second card that it is back up with a green dot and time 02:21.`

## 09 · Sayt, bot va ilovani tekshirish — ACCENT: green #5b8a06

**audit-1 · Uzoq Sharq quvur zavodi — UX tekshiruvi** (sayt tekshiruvi, Rossiya, workspace.ru keysi)
- K: `UX audit report page in a web app: left column with a website screenshot thumbnail of an industrial company homepage with numbered red markers 1–5 on problem areas; right column with a findings list, each item with a number, severity chip (critical, medium, low), title bar and two text bars; a small before/after toggle at the top.`
- T: `Mobile view of the same audit: website screenshot with numbered markers on top, below a list of findings cards with severity chips and an arrow.`

**audit-2 · Kompleks tekshiruv: 96 sahifa** (sayt tekshiruvi, Rossiya, workspace.ru keysi)
- K: `Website audit findings registry: header with summary cards (pages checked 96, findings 54, critical 9); a table of findings with columns for area chip (technical, content, links, conversion), severity dot, title bar and status; a roadmap strip at the bottom with three stages 1, 6, 12 months.`

**audit-3 · Google PageSpeed Insights** (tezlikni tekshirish vositasi, Google)
- K: `Page speed test result screen: URL field at the top with an analyze button; four circular score gauges (performance 92 green, accessibility 88 orange-green, best practices 100, SEO 95); a row of metric cards with values like 1.2 s, 0.03, 180 ms; a list of opportunities with small expand arrows.`
- T: `Mobile page speed result: device toggle (phone selected), one big circular score 84 in green, metric list with green, orange and red dots and values like 2.1 s.`

**audit-4 · MDN HTTP Observatory** (xavfsizlikni tekshirish vositasi, Mozilla)
- K: `Website security scan result: big grade badge A+ in a green circle, score 115/100, tests passed 10/10; table of security header checks (content policy, cookies, redirection, transport security) each with a green check or red cross and a short bar.`

## 10 · Telegram va Instagram’da reklama — ACCENT: teal #0a8a94

**ads-1 · Telegram Ads** (Telegram'ning rasmiy reklama platformasi, ads.telegram.org)
- K: `Telegram advertising account dashboard: left menu; table of ad campaigns with status toggles, columns for views, clicks, joined, spent with numbers like 195 405, 1 280, 275; a selected ad preview card on the right showing a short sponsored message with a button below it, as it appears at the bottom of a channel.`
- T: `Telegram channel view with posts and, at the bottom of the feed, a sponsored message card labelled with a small bar, short text bars and a {ACCENT} button.`

**ads-2 · Telegram Ads keyslari, Toshkent** (kanalga obunachi jalb qilish, telegrad.uz)
- K: `Ad campaign report: line chart of new channel subscribers per day; summary cards (impressions 195 405, subscribers 275, cost per subscriber 3 098); list of target channels with round avatars and small bars of share.`

**ads-3 · local Tours — Instagram reklamasi** (Instagram va Facebook'da reklama, Toshkent)
- T: `Instagram-style feed with a sponsored post: header with round avatar, name bar and small "sponsored" bar; large photo of mountains and a travel group in Uzbekistan landscape (no faces visible); action icons row; caption bars; wide {ACCENT} call-to-action button bar under the photo.`
- K: `Ads manager results table: campaign rows with toggles and columns for reach, clicks, leads, cost per lead; a chart of leads per day; a side card with audience: city Tashkent, age 25–45, interest chips.`

**ads-4 · Grand Development Group — Instagram reklamasi** (ko‘chmas mulk, Toshkent)
- T: `Instagram-style story ad: full-screen photo of a modern premium residential building at sunset; top progress bars and a small avatar with name bar and "sponsored" bar; at the bottom a swipe-up style {ACCENT} button with a light text bar.`
- K: `Lead form results screen: list of incoming leads with name bars, phone numbers like +998 90 *** ** 45, apartment type chips (2 rooms, 3 rooms) and status chips (new, called, visit); a summary card with total leads.`
