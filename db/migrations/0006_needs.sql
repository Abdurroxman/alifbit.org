-- Kirish suhbati matnlari: xizmat (need), paket (fit) va kurs (need) uchun mijoz tilidagi javoblar.
-- Faqat hali yo'q maydonlar to'ldiriladi; admin yozgan matn va narxlar o'zgarmaydi.
UPDATE services SET data=json_set(data,'$.need','Mijozlar meni internetdan topsin') WHERE id='veb-sayt' AND json_extract(data,'$.need') IS NULL;
UPDATE services SET data=json_set(data,'$.need','Sayt yoki ilovam ko‘rinishini yangilamoqchiman') WHERE id='dizayn' AND json_extract(data,'$.need') IS NULL;
UPDATE services SET data=json_set(data,'$.need','Buyurtmalarni Telegram’da qabul qilmoqchiman') WHERE id='telegram-bot' AND json_extract(data,'$.need') IS NULL;
UPDATE services SET data=json_set(data,'$.need','Ishimni bitta dasturga jamlamoqchiman') WHERE id='ilova' AND json_extract(data,'$.need') IS NULL;
UPDATE services SET data=json_set(data,'$.packages[0].fit','Bitta xizmat yoki mahsulotni tanishtirmoqchiman') WHERE id='veb-sayt' AND json_extract(data,'$.packages[0].name')='Landing' AND json_extract(data,'$.packages[0].fit') IS NULL;
UPDATE services SET data=json_set(data,'$.packages[1].fit','Kompaniyam haqida bir necha sahifa kerak') WHERE id='veb-sayt' AND json_extract(data,'$.packages[1].name')='Vizitka sayt' AND json_extract(data,'$.packages[1].fit') IS NULL;
UPDATE services SET data=json_set(data,'$.packages[2].fit','Internetda sotmoqchiman') WHERE id='veb-sayt' AND json_extract(data,'$.packages[2].name')='Internet-do‘kon' AND json_extract(data,'$.packages[2].fit') IS NULL;
UPDATE services SET data=json_set(data,'$.packages[0].fit','Yangi loyiha uchun dizayn kerak') WHERE id='dizayn' AND json_extract(data,'$.packages[0].name')='Sayt dizayni' AND json_extract(data,'$.packages[0].fit') IS NULL;
UPDATE services SET data=json_set(data,'$.packages[1].fit','Mavjud saytim eskirgan') WHERE id='dizayn' AND json_extract(data,'$.packages[1].name')='Qayta dizayn (UI/UX)' AND json_extract(data,'$.packages[1].fit') IS NULL;
UPDATE services SET data=json_set(data,'$.packages[0].fit','Oddiy bot: menyu, buyurtma, xabarnoma') WHERE id='telegram-bot' AND json_extract(data,'$.packages[0].name')='Telegram bot' AND json_extract(data,'$.packages[0].fit') IS NULL;
UPDATE services SET data=json_set(data,'$.packages[1].fit','Telegram ichida to‘liq ilova kerak') WHERE id='telegram-bot' AND json_extract(data,'$.packages[1].name')='Mini App' AND json_extract(data,'$.packages[1].fit') IS NULL;
UPDATE services SET data=json_set(data,'$.packages[0].fit','Brauzerda ishlaydigan tizim kerak') WHERE id='ilova' AND json_extract(data,'$.packages[0].name')='Veb-ilova (CRM)' AND json_extract(data,'$.packages[0].fit') IS NULL;
UPDATE services SET data=json_set(data,'$.packages[1].fit','Telefonga o‘rnatiladigan ilova kerak') WHERE id='ilova' AND json_extract(data,'$.packages[1].name')='Mobil ilova' AND json_extract(data,'$.packages[1].fit') IS NULL;
UPDATE courses SET data=json_set(data,'$.need','O‘zim yasashni o‘rganmoqchiman') WHERE id='vayb-koding' AND json_extract(data,'$.need') IS NULL;
