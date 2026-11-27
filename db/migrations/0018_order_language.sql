-- Murojaat qaysi tildagi sahifadan kelgani: admin va xabarlarda ko'rinadi, mijozga shu tilda javob beriladi.
ALTER TABLE orders ADD COLUMN lang TEXT NOT NULL DEFAULT 'uz' CHECK (lang IN ('uz', 'ru', 'en'));
