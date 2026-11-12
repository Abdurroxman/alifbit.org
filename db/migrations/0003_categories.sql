CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, data TEXT NOT NULL CHECK(json_valid(data)));
INSERT OR IGNORE INTO settings(key,data) VALUES('categories','["Dasturlar","Telegram","Ta’lim","Kitoblar","Media","AI","Boshqa"]');
