# Xizmat misollari uchun rasm promptlari (Higgsfield)

32 ta rasm: 8 xizmat × 4 misol. Har bir rasm admin panelda o‘z misoliga yuklanadi:
**Admin › Xizmatlar › [xizmat] › Misollar › «Rasm yuklash»**, keyin **xizmatni saqlash**.

## Claude ilovasida qanday yaratiladi

Claude ilovasida (Higgsfield ulangan suhbatda) shu xabarni yuboring, keyin quyidagi bo‘limlardan birini nusxalab qo‘shing:

```
Higgsfield'da generate_image_batch orqali quyidagi promptlarning har biri uchun bittadan rasm yarat.
Model: gpt_image_2_6, nisbat 4:3, 1 ta variant. Har bir promptning oxiriga UMUMIY USLUB qatorini qo‘sh.
Tayyor bo‘lgach, rasmlarni prompt nomi (masalan web-1) bilan ko‘rsat.
```

**UMUMIY USLUB** (har promptga qo‘shiladi):

```
Clean modern editorial illustration, soft 3D render look, gentle studio lighting, shallow depth of field, calm ivory background with deep green shadows, single accent color {ACCENT}. No readable text, no logos, no brand names, no watermarks, no real people's faces. 4:3 composition, subject centered with breathing room.
```

`{ACCENT}` o‘rniga bo‘lim sarlavhasidagi rangni yozing — rasmlar saytdagi xizmat rangiga mos tushadi.

Talablar: PNG, JPG yoki WEBP, 5 MB gacha. Rasmda logotip va brend nomi bo‘lmasin: misol kartasi o‘sha kompaniyaning nomi bilan chiqadi, rasm esa yechim turini ko‘rsatadi.

---

## 01 · Veb-sayt — ACCENT: cobalt blue #2357e8

**web-1 · EVOS sayti**
```
A laptop on a wooden table showing a bright food-delivery company website: hero banner with a wrap sandwich and fries, branch map section, phone order button; a smartphone beside it showing the same site in mobile layout.
```

**web-2 · Texnomart internet-do‘koni**
```
A large desktop monitor displaying an electronics online store: product grid of washing machines, TVs and smartphones with price tags and installment badges, a cart icon with a counter; a few small home appliances arranged around the monitor.
```

**web-3 · Click mahsulot sayti**
```
A floating browser window showing a fintech product landing page: a phone mockup of a payment app in the hero, cashback coin icons, card and wallet illustrations, a developer API section with code blocks in the lower part.
```

**web-4 · Uzum korporativ sayti**
```
An isometric composition of one website page connected by thin lines to six floating app tiles (shopping bag, delivery scooter, bank card, calendar with installments, car, briefcase), representing a company ecosystem hub page.
```

## 02 · Telegram bot — ACCENT: Telegram blue #0e87c9

**tg-1 · EVOS yetkazib berish boti**
```
A smartphone held in hand showing a messenger chat with a food-ordering bot: menu buttons, a photo card of a wrap sandwich, quantity buttons, a shared location pin message; a paper delivery bag in the soft-focus background.
```

**tg-2 · KFC Uzbekistan boti**
```
A smartphone on a table showing a messenger bot cart: fried chicken bucket card, order summary with total, a big "confirm" style button (no readable text), a delivery scooter icon; warm restaurant lighting.
```

**tg-3 · Oqtepa Lavash boti**
```
A smartphone showing a messenger bot with a grid of round food category buttons (wraps, burgers, drinks, desserts) and a minimum-order progress bar; a fresh lavash wrap on a plate beside the phone.
```

**tg-4 · Oshme**
```
A smartphone showing a messenger bot with restaurant cards: interior photos of cozy cafes, star ratings, a time-slot picker for table booking; a reserved table with a small card and candle in soft focus behind.
```

## 03 · AI yordamchi — ACCENT: violet #7445e6

**ai-1 · Lola — bank yordamchisi**
```
A banking mobile app on a phone with a friendly chat assistant panel open: a soft glowing round avatar orb, chat bubbles answering a question, quick-reply chips, and a small "talk to a person" headset icon.
```

**ai-2 · Kaspi AI yordamchisi**
```
A split scene: on the left a support chat on a phone answered by a glowing AI orb, on the right a shopping screen where the same orb suggests products with small cards; dotted lines connect both screens.
```

**ai-3 · Klarna AI yordamchisi**
```
A globe made of overlapping translucent chat bubbles in many scripts (abstract glyph shapes, not readable), with a calm AI orb in the center answering them; a small chart in the corner showing resolution time dropping.
```

**ai-4 · Uzum Avto chat-botlari**
```
A funnel diagram in 3D: many chat bubbles from a messenger flow in at the top, a glowing bot module answers most of them (green checkmarks), and only a few bubbles continue down to a support agent headset at the bottom; a car silhouette in the background.
```

## 04 · Ilova — ACCENT: orange #e2620a

**app-1 · Click SuperApp**
```
Three smartphones fanned out showing a payment super-app: home screen with balance and service tiles, money transfer screen with contact avatars, cashback screen with coin animation; floating card and QR icons.
```

**app-2 · Uzum Market**
```
A smartphone showing a marketplace shopping app: product feed with clothing and gadgets, a cart with items, order tracking timeline; small shopping bags and a delivery box floating around the phone.
```

**app-3 · EVOS ilovasi**
```
A smartphone showing a food-ordering app: menu with burger, wrap and drink cards, a map with a delivery route line, order status steps; a takeaway paper bag and drink cup beside the phone.
```

**app-4 · Uzum Nasiya**
```
A smartphone showing an installment payment app: a circular credit limit gauge, a monthly payment schedule calendar, and payment method tiles; a shopping receipt and calendar floating beside it.
```

## 05 · Dizayn — ACCENT: magenta #d6337f

**design-1 · TBC Bank brendi**
```
A brand identity flat lay: business cards, a bank card, a tote bag and a phone screen all decorated with a modern pattern inspired by Uzbek ikat (atlas) silk waves; color swatches and a film clapperboard at the edge.
```

**design-2 · O‘zbekiston havo yo‘llari logotipi**
```
A designer's desk with a large sheet showing an abstract round emblem of a stylized bird inside a circle (generic, not a real logo) in one color, before/after sketches next to it, and a passenger airplane tail model in soft focus.
```

**design-3 · Milliy bank firma uslubi**
```
A corporate identity guidelines book open on a table: pages with an abstract geometric emblem, typography specimens, a ceramic-tile-inspired ornament pattern, color palette swatches; a tablet showing an animated version of the emblem.
```

**design-4 · East Telecom rebrendingi**
```
A rebranding moodboard: old and new versions of an abstract telecom logo shape (a curved boomerang-like mark, generic), new business stationery, a router device and a fiber cable with the new color applied.
```

## 06 · Integratsiyalar — ACCENT: emerald #0c9a6f

**int-1 · Telegram + Bitrix24**
```
An isometric diagram: a messenger chat window on the left sending glowing data packets along a pipe into a CRM dashboard on the right (kanban columns, client cards), with small agent avatars receiving assigned conversations.
```

**int-2 · Do‘konda to‘lov tizimlari**
```
An online store checkout page on a laptop, with four generic bank card and wallet icons plugged into it like puzzle pieces, and an installment calendar module snapping into place; a green success checkmark.
```

**int-3 · Ilovada to‘lov tizimlari**
```
A smartphone app at the center connected by glowing lines to four floating payment-provider tiles (generic wallet, card, bank, terminal icons), each line ending in a small green checkmark.
```

**int-4 · Multicard — Bitrix24 uchun**
```
A CRM deal card on a monitor with a "pay" module attached; a payment link travels to a customer's phone, and money flows back into the CRM as a green paid status; plug and connector icons around.
```

## 07 · SEO — ACCENT: amber #b98500

**seo-1 · Onlayn dorixona**
```
A pharmacy website on a laptop with a rising organic traffic line chart floating above it, a mobile speed gauge needle moving from red to green, and small medicine boxes on the desk.
```

**seo-2 · Bank sayti**
```
A large search results page (abstract lines, no readable text) where one result card glows at the top position, a visibility meter rising beside it, and a small bank building icon on the glowing card.
```

**seo-3 · Ko‘chmas mulk sayti**
```
A grid of many small landing page tiles of apartment listings growing from a single page like a tree, with a traffic bar chart rising behind them; miniature residential buildings at the base.
```

**seo-4 · Maxsus kiyim ishlab chiqaruvchi**
```
A workwear jacket and hard hat next to a laptop showing a factory website, with a magnifying glass over a search bar and an upward arrow chart doubling in height.
```

## 08 · Texnik yordam — ACCENT: red #d63a3a

**support-1 · Bulutga ko‘chirish va 24/7 yordam**
```
Server racks lifting into a soft cloud via glowing lines, a shield icon for DDoS protection, a backup disk icon, and a 24-hour clock badge; calm data-center lighting.
```

**support-2 · TCloud hosting**
```
A clean hosting control panel on a monitor with server plan cards (small, medium, large) and a domain name bar; a headset with a 24/7 glowing ring beside the monitor.
```

**support-3 · Uztelecom data markazlari**
```
Inside a modern Tier III data center: long rows of server racks with cool blue LEDs, raised floor tiles, a technician's tablet showing rack status; symmetrical perspective.
```

**support-4 · Sayt monitoringi**
```
A monitoring dashboard on a laptop with uptime bars mostly green and one red incident spike, a phone beside it receiving an alert notification, and a falling cost chart in the corner.
```
