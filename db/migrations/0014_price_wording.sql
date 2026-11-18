-- Narxlar «-dan» qo'shimchasisiz: «1 200 000 so‘m», «500 000 so‘m/oy». Izoh narx ostida alohida yoziladi.
-- Faqat narx qiymatining oxiri almashadi (JSON qatorida qo'shtirnoq bilan tugaydigan joy).
UPDATE services SET data=replace(replace(data,'so‘mdan"','so‘m"'),'so‘m/oydan"','so‘m/oy"'),updated_at=CURRENT_TIMESTAMP WHERE data LIKE '%so‘mdan"%' OR data LIKE '%so‘m/oydan"%';
