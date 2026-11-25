import { build } from "esbuild";
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync("test-artifacts", { recursive: true });
await build({
  stdin: {
    contents: `import React from 'react';import {renderToString} from 'react-dom/server';import {MemoryRouter} from 'react-router-dom';import App from './src/App';export function render(path){return renderToString(React.createElement(MemoryRouter,{initialEntries:[path]},React.createElement(App)));}`,
    resolveDir: process.cwd(),
    loader: "tsx",
  },
  outfile: "test-artifacts/renderer.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  loader: { ".css": "empty" },
  logLevel: "silent",
});
const { render } = await import("../test-artifacts/renderer.mjs");
const routes = [
  "/",
  "/projects",
  "/services/ai-yordamchi",
  "/projects/ovozdan-matnga",
  "/services",
  "/services/veb-sayt",
  "/courses",
  "/about",
  "/contact",
  "/privacy",
  "/journal",
  "/not-found",
];
const results = [];
for (const route of routes) {
  const html = render(route);
  const h1 = html.match(/<h1(?:\s|>)/g) || [];
  if (h1.length !== 1)
    throw new Error(`${route}: expected one H1, found ${h1.length}`);
  if (!html.includes('id="main"'))
    throw new Error(`${route}: no main landmark`);
  if (!html.includes("Asosiy mazmunga o‘tish"))
    throw new Error(`${route}: missing skip link`);
  if (/<img\b(?![^>]*\balt=)/.test(html))
    throw new Error(`${route}: missing image alt`);
  const links = [...html.matchAll(/href="([^"#]+)"/g)].map((m) => m[1]);
  for (const href of links) {
    if (href.startsWith("/") && !href.startsWith("//")) {
      const path = href.split("?")[0];
      const good =
        [
          "/",
          "/projects",
          "/services",
          "/courses",
          "/about",
          "/contact",
          "/privacy",
          "/journal",
          "/office/",
        ].includes(path) ||
        /^\/(projects|services|courses)\/[a-z0-9-]+$/.test(path) ||
        /^\/(images|brand|fonts)\//.test(path);
      if (!good) throw new Error(`${route}: unexpected link ${href}`);
    }
  }
  results.push({ route, headingCount: 1, rendered: true, links: links.length });
  writeFileSync(
    `test-artifacts/${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}.html`,
    html,
  );
}
writeFileSync("test-artifacts/render.json", JSON.stringify(results, null, 2));
console.log(
  `${results.length} React route renders passed: one H1, main landmark, skip link, image alt, link destinations.`,
);
