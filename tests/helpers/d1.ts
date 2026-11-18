// Testlar uchun D1 o'rinbosari: node:sqlite ustida, faqat loyihada ishlatiladigan API qismi.
// batch() — bitta tranzaksiya (xato bo'lsa hammasi qaytariladi), D1 dagi kabi.
import { DatabaseSync } from "node:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

type Value = string | number | null;

class Statement {
  db: DatabaseSync;
  sql: string;
  params: Value[] = [];
  constructor(db: DatabaseSync, sql: string) {
    this.db = db;
    this.sql = sql;
  }
  bind(...params: unknown[]) {
    const next = new Statement(this.db, this.sql);
    next.params = params.map((p) => {
      if (p === undefined) throw new Error("D1_TYPE_ERROR: undefined bind value");
      if (typeof p === "boolean") return p ? 1 : 0;
      return p as Value;
    });
    return next;
  }
  rows() {
    return this.db.prepare(this.sql).all(...this.params) as Record<string, unknown>[];
  }
  async first<T>(column?: string) {
    const row = this.rows()[0];
    if (!row) return null;
    return (column ? row[column] : { ...row }) as T;
  }
  async all<T>() {
    return { results: this.rows().map((r) => ({ ...r })) as T[], success: true, meta: {} };
  }
  execute() {
    if (/\bRETURNING\b/i.test(this.sql) || /^\s*SELECT/i.test(this.sql)) {
      const before = (this.db.prepare("SELECT total_changes() AS n").get() as { n: number }).n;
      const results = this.rows();
      const after = (this.db.prepare("SELECT total_changes() AS n").get() as { n: number }).n;
      return { results, success: true, meta: { changes: after - before, last_row_id: 0 } };
    }
    const info = this.db.prepare(this.sql).run(...this.params);
    return { results: [], success: true, meta: { changes: Number(info.changes), last_row_id: Number(info.lastInsertRowid) } };
  }
  async run() {
    return this.execute();
  }
}

export function createD1() {
  const db = new DatabaseSync(":memory:");
  const dir = join(import.meta.dirname, "..", "..", "db", "migrations");
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort())
    db.exec(readFileSync(join(dir, file), "utf8"));
  const d1 = {
    prepare: (sql: string) => new Statement(db, sql),
    async batch(statements: Statement[]) {
      db.exec("BEGIN");
      try {
        const results = statements.map((s) => s.execute());
        db.exec("COMMIT");
        return results;
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
    async exec(sql: string) {
      db.exec(sql);
      return { count: 0, duration: 0 };
    },
    raw: db,
  };
  return d1 as unknown as D1Database & { raw: DatabaseSync };
}
