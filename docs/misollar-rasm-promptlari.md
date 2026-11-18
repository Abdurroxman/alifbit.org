# «Boshqa kompaniyalardan misollar» uchun ekran rasmlari (Higgsfield)

Har bir misol kartasida MacBook va iPhone ramkasi bor. Rasm sifatida faqat **ekranning o‘zi** kerak: qurilma, stol va fon chizilmaydi.

- **K** — kompyuter ekrani, nisbat **16:9**. Admin'da «Kompyuter ekrani» tugmasi orqali yuklanadi.
- **T** — telefon ekrani, nisbat **9:16**. Admin'da «Telefon ekrani» tugmasi orqali yuklanadi.
- Faqat bittasi berilgan misolda kartada bitta qurilma chiqadi (masalan, botlarda faqat telefon).
- Bosh sahifada xizmat tanlanganda shu skrinshotlar 3D noutbuk va telefon ekranida navbat bilan almashadi.

Yuklash tartibi: **Admin › Xizmatlar › [xizmat] › Boshqa kompaniyalardan misollar › Misol N** → «Kompyuter ekrani» / «Telefon ekrani» → **Saqlash**.

## Claude ilovasida yaratish

Higgsfield ulangan suhbatga shu xabarni yuboring va ostiga bitta xizmat bo‘limini nusxalab qo‘shing:

```
Higgsfield'da generate_image_batch bilan quyidagi har bir prompt uchun bittadan rasm yarat.
Model: gpt_image_2_6. K bilan boshlanganlari 16:9, T bilan boshlanganlari 9:16.
Har bir promptning oxiriga UMUMIY USLUB qatorini qo‘sh, {ACCENT} o‘rniga bo‘lim rangini yoz.
Tayyor bo‘lgach rasmlarni prompt nomi bilan (masalan web-1-K) ko‘rsat.
```

**UMUMIY USLUB:**

```
Flat UI screenshot only, full-bleed, straight-on, no device frame, no hands, no desk, no background around the screen. Modern clean interface, light theme, soft shadows, rounded cards, realistic food/product/people-free photos where needed, accent color {ACCENT}. All text replaced with neutral grey placeholder bars of different lengths, except tiny numbers; no readable words, no logos, no brand names, no watermarks.
```

Telefon promptlarida muhim tugma va kartalar ekranning o‘rtadagi 80% enida tursin: telefon ramkasi chetlarini biroz kesadi.

---

## 01 · Sayt yaratish — ACCENT: cobalt blue #2357e8

**web-1 · EVOS sayti**
- K: `Homepage of a food delivery company website: top menu bar, large hero banner with a chicken wrap and fries photo, a blue "call" button, a map section with several branch pins and a list of branches beside it.`
- T: `Mobile version of the same food delivery website: hero photo of a wrap, a wide blue call button, a small map with branch pins, list of branch cards below.`

**web-2 · Texnomart internet-do‘koni**
- K: `Electronics online store catalog page: left filter column, product grid of washing machines, TVs and phones with price tags and a small "monthly installment" badge on each card, cart icon with a counter in the header.`
- T: `Mobile product page of an electronics store: large photo of a refrigerator, price, installment plan selector with 3/6/12 month chips, payment method icons as generic card shapes, sticky add-to-cart button.`

**web-3 · Click mahsulot sayti**
- K: `Fintech product landing page: hero with a phone mockup of a payment app, three feature cards with wallet, cashback coin and transfer arrow icons, a lower developer section with a dark code block.`

**web-4 · Uzum korporativ sayti**
- K: `Company ecosystem hub page: short hero, then a grid of six large service tiles (shopping bag, delivery scooter, bank card, calendar, car, briefcase icons), each tile with its own soft color.`

## 02 · Telegram bot va ilovalar — ACCENT: Telegram blue #0e87c9

**tg-1 · EVOS yetkazib berish boti**
- T: `Messenger chat with a food ordering bot: bot message with a wrap photo card, quantity minus/plus buttons, a grid of inline menu buttons below, a sent location pin bubble from the user.`

**tg-2 · KFC Uzbekistan boti**
- T: `Messenger bot cart screen: order summary card with fried chicken bucket and drink lines, total amount, two inline buttons for delivery or pickup, a large confirm button.`

**tg-3 · Oqtepa Lavash boti**
- T: `Messenger bot showing a 2-column grid of round food category buttons (wrap, burger, drink, dessert icons) and a chat bubble with a lavash wrap photo and price.`

**tg-4 · Oshme**
- T: `Messenger bot restaurant guide: cards with cozy cafe interior photos and star ratings, then a time slot picker row (18:00, 19:00, 20:00 chips) for table booking.`

## 03 · AI yordamchi yaratish — ACCENT: violet #7445e6

**ai-1 · Lola — bank yordamchisi**
- T: `Banking app chat assistant screen: round glowing assistant avatar at the top, chat bubbles answering a question, quick reply chips, a small "talk to an operator" headset button at the bottom.`

**ai-2 · Kaspi AI yordamchisi**
- T: `Shopping app with an AI assistant panel: chat bubble suggestions on top, below it three recommended product cards (headphones, kettle, backpack) with prices.`

**ai-3 · Klarna AI yordamchisi**
- K: `Customer support chat widget on a payments website: chat window on the right with assistant bubbles and a language selector chip, order details card shown inside the chat.`
- T: `Mobile support chat with an AI assistant: order card with status timeline inside the chat, quick reply chips, typing indicator.`

**ai-4 · Uzum Avto chat-botlari**
- T: `Messenger chat with a car marketplace support bot: car photo card, inline buttons for frequently asked questions, a message saying the request was passed to an operator with a small headset icon.`

## 04 · Biznes uchun dastur va ilovalar — ACCENT: orange #e2620a

**app-1 · Click SuperApp**
- T: `Payment super-app home screen: balance card at the top, grid of service tiles (mobile, utilities, internet, transport icons), recent transactions list, bottom tab bar.`

**app-2 · Uzum Market**
- T: `Marketplace shopping app feed: search bar, category chips, 2-column product grid with clothing and gadgets photos, prices and rating stars, bottom tab bar with cart badge.`

**app-3 · EVOS ilovasi**
- T: `Food ordering app order tracking screen: map with a delivery route line and courier pin, order status steps (accepted, cooking, on the way), order items list.`

**app-4 · Uzum Nasiya**
- T: `Installment payment app: circular credit limit gauge, monthly payment schedule list with dates and amounts, a pay button, payment method tiles as generic card shapes.`

## 05 · Sayt va ilova dizayni — ACCENT: magenta #d6337f

**design-1 · Paynet ilovasi**
- T: `Redesigned payments app home screen: wallet card with top-up and withdraw buttons, quick transfer contacts row with circle avatars (no faces, initials only), utility payments tiles, clean modern design system look.`

**design-2 · Hamkorbank sayti**
- K: `Bank website homepage: hero with loan offer and an online application button, credit calculator card with sliders for amount and term, row of product cards for cards, deposits and loans, green accent.`
- T: `Mobile bank website: step-by-step online application form with a progress bar (step 2 of 4), input fields as grey bars, large continue button.`

**design-3 · Agrobank Mobile**
- T: `Mobile banking app home: balance at the top, colorful bank card carousel, saved payment groups as rounded tiles, a small spending calendar with colored days.`

**design-4 · Converse Bank ilovasi**
- T: `Mobile banking app home built from widgets: cards widget, quick payments widget, currency rates widget, dark theme version, design tokens look with consistent spacing.`

## 06 · To‘lov va boshqa tizimlarni ulash — ACCENT: emerald #0c9a6f

**int-1 · Telegram + Bitrix24**
- K: `CRM dashboard with kanban columns (new, in progress, done) of client cards, each card with a small messenger icon; a side panel showing a chat conversation attached to the selected card.`

**int-2 · Do‘konda to‘lov tizimlari**
- K: `Online store checkout page: order summary on the right, payment method selection on the left as four generic card/wallet tiles, an installment option toggle, green pay button.`

**int-3 · Ilovada to‘lov tizimlari**
- T: `Mobile payment method picker: list of four payment options with generic wallet, card, bank and terminal icons, one selected with a green check, amount and pay button below.`

**int-4 · Multicard — Bitrix24 uchun**
- K: `CRM deal card with a payment block: amount, a "create payment link" button, payment status changing to paid with a green badge, payment history table below.`

## 07 · Google va Yandex uchun saytni sozlash — ACCENT: amber #b98500

**seo-1 · Onlayn dorixona**
- K: `Website analytics dashboard: rising line chart of visits from search, a page speed gauge in the green zone, table of top pages with small up arrows.`

**seo-2 · Bank sayti**
- K: `Search results page mockup with abstract grey result blocks, the top result highlighted with an amber outline, and a side card showing visibility growing on a small bar chart.`

**seo-3 · Ko‘chmas mulk sayti**
- K: `Real estate website listing page: grid of apartment cards with building photos and price tags, clean URL breadcrumb bar at the top, filter sidebar.`

**seo-4 · Maxsus kiyim ishlab chiqaruvchi**
- K: `Manufacturer catalog website: workwear jackets and hard hats in a product grid, search bar in the header, a small chart card in the corner showing traffic growth.`

## 08 · Sayt va botlarga texnik xizmat — ACCENT: red #d63a3a

**support-1 · Bulutga ko‘chirish va 24/7 yordam**
- K: `Cloud control panel: server cluster status cards all green, backup schedule list, DDoS protection shield status, 24/7 support chat button in the corner.`

**support-2 · TCloud hosting**
- K: `Hosting client area: three hosting plan cards (small, medium, large) with specs as grey bars, domain search bar on top, support ticket button.`

**support-3 · Uztelecom ma’lumotlar markazlari**
- K: `Data center colocation dashboard: rack diagram with occupied units highlighted, power and temperature gauges, uptime percentage card.`

**support-4 · Sayt ishlashini kuzatish (monitoring)**
- K: `Website monitoring dashboard: uptime bars mostly green with one red incident, response time chart, list of checks with status dots.`
- T: `Phone notification screen: alert card saying a website is down (grey text bars, red dot), then a second card that it is back up (green dot).`
