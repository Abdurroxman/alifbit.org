import { writeFileSync } from "node:fs";
import { initialProjects, initialServices } from "../shared/content.ts";
const sql = (v) => `'${String(v).replaceAll("'", "''")}'`;
const rows = [
  ...initialProjects.map(
    (p) =>
      `INSERT OR IGNORE INTO projects(id,slug,data,published) VALUES(${sql(p.id)},${sql(p.slug)},${sql(JSON.stringify(p))},1);`,
  ),
  ...initialServices.map(
    (s) =>
      `INSERT OR IGNORE INTO services(id,slug,data,published) VALUES(${sql(s.slug)},${sql(s.slug)},${sql(JSON.stringify(s))},1);`,
  ),
];
writeFileSync(
  "db/migrations/0002_seed.sql",
  `-- Initial presentation content. Does not overwrite later CMS changes.\n${rows.join("\n")}\n`,
);
console.log("Seed migration prepared.");
