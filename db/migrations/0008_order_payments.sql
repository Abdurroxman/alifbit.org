-- Murojaat pay.alifbit.org dagi buyurtmaga bog'lanadi. pay_data — to'lov markazidan olingan oxirgi holat (JSON),
-- pul hisobi faqat to'lov markazida yuritiladi; bu yerda faqat ko'rsatish uchun nusxa turadi.
ALTER TABLE orders ADD COLUMN pay_order_id TEXT;
ALTER TABLE orders ADD COLUMN pay_data TEXT CHECK (pay_data IS NULL OR json_valid(pay_data));
ALTER TABLE orders ADD COLUMN pay_synced_at INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX IF NOT EXISTS orders_pay_order ON orders(pay_order_id) WHERE pay_order_id IS NOT NULL;
