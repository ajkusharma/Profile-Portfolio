import { build as esbuild } from "esbuild";
import { build as viteBuild } from "vite";
import { rm, readFile, mkdir, writeFile } from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

// server deps to bundle to reduce openat(2) syscalls
// which helps cold start times
const allowlist = [
  "@google/generative-ai",
  "axios",
  "connect-pg-simple",
  "cors",
  "date-fns",
  "drizzle-orm",
  "drizzle-zod",
  "express",
  "express-rate-limit",
  "express-session",
  "jsonwebtoken",
  "memorystore",
  "multer",
  "nanoid",
  "nodemailer",
  "openai",
  "passport",
  "passport-local",
  "pg",
  "stripe",
  "uuid",
  "ws",
  "xlsx",
  "zod",
  "zod-validation-error",
];

async function buildAll() {
  await rm("dist", { recursive: true, force: true });

  console.log("building client...");
  await viteBuild();

  console.log("rendering static article pages...");
  // Bundle the same reader as the SPA, omitting CSS imports during Node rendering.
  // The Vite HTML template already links the compiled CSS for these components.
  const rendererPath = path.resolve("dist/article-renderer.mjs");
  await esbuild({
    entryPoints: ["script/render-articles.tsx"],
    outfile: rendererPath,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    jsx: "automatic",
    loader: { ".css": "empty" },
    alias: {
      "@": path.resolve("client/src"),
      "@shared": path.resolve("shared"),
    },
  });
  const { renderArticles } = await import(pathToFileURL(rendererPath).href);
  const template = await readFile("dist/public/index.html", "utf-8");
  for (const page of renderArticles(template)) {
    const destination = path.join("dist/public", page.path);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, page.html);
  }
  await rm(rendererPath);

  console.log("building server...");
  const pkg = JSON.parse(await readFile("package.json", "utf-8"));
  const allDeps = [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.devDependencies || {}),
  ];
  const externals = allDeps.filter((dep) => !allowlist.includes(dep));

  await esbuild({
    entryPoints: ["server/index.ts"],
    platform: "node",
    bundle: true,
    format: "cjs",
    outfile: "dist/index.cjs",
    define: {
      "process.env.NODE_ENV": '"production"',
    },
    minify: true,
    external: externals,
    logLevel: "info",
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
