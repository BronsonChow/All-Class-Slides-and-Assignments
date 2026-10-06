// Renders each React slide deck in headless Chrome and writes one .pptx per deck
// (full-slide image per slide, instructor notes become PowerPoint speaker notes).
// Usage: npm run build [-- <name filter>]
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import PptxGenJS from "pptxgenjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, "..");
const slidesDir = path.resolve(outDir, "..", "Slides");

const DECKS = [
  { out: "Week 3 Day 1 - useState and Events", dir: "Slides Week 3/Week 3 Day 1 usestate-events" },
  { out: "Week 4 Day 1 - Review", dir: "Slides Week 4" },
  { out: "Week 4 Day 2 - Lists Keys Inputs", dir: "Slides Week 4 Day 2/thu-lists-keys-inputs" },
  { out: "Week 5 - Jeopardy and Lifting State", dir: "Week 5 Jeopardy Slides" },
  { out: "Week 7 Day 1 - Fetch and useEffect", dir: "week7/tue-fetch-useeffect" },
  { out: "Week 7 Day 2 - Errors Loading Hooks", dir: "week7/thu-errors-loading-hooks" },
];

const W = 1600;
const H = 900;
const SCALE = 1.5;
const filter = process.argv[2]?.toLowerCase();

async function startVite(cwd, port) {
  const proc = spawn("npx", ["vite", "--port", String(port), "--strictPort", "--host", "127.0.0.1"], {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("vite did not start in 30s")), 30000);
    proc.stdout.on("data", (d) => {
      if (String(d).includes("Local")) {
        clearTimeout(t);
        resolve();
      }
    });
    proc.on("exit", (c) => reject(new Error(`vite exited early (${c})`)));
  });
  return proc;
}

async function captureDeck(browser, url) {
  const page = await browser.newPage({ viewport: { width: W, height: H + 200 }, deviceScaleFactor: SCALE });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector(".deck");

  const footer = await page.evaluate(() => document.querySelector(".deck").lastElementChild.getBoundingClientRect().height);
  await page.setViewportSize({ width: W, height: H + Math.ceil(footer) });

  const counter = await page.evaluate(() => {
    const m = document.querySelector(".deck").textContent.match(/(\d+) \/ (\d+)/);
    return m ? Number(m[2]) : 0;
  });
  if (!counter) throw new Error("could not read slide count");

  const slides = [];
  for (let i = 0; i < counter; i++) {
    await page.waitForTimeout(600);
    const image = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });
    await page.keyboard.press("n");
    await page.waitForTimeout(50);
    const notes = await page.evaluate(() => {
      const span = [...document.querySelectorAll(".deck span")].find((s) => s.textContent.startsWith("Instructor note"));
      return span ? span.parentElement.textContent.replace(/^Instructor note:\s*/, "") : "";
    });
    await page.keyboard.press("n");
    slides.push({ image, notes });
    await page.keyboard.press("ArrowRight");
  }
  await page.close();
  return { slides, errors };
}

const browser = await chromium.launch({ channel: "chrome" });
let port = 5600;
for (const deck of DECKS) {
  if (filter && !deck.out.toLowerCase().includes(filter)) continue;
  const vite = await startVite(path.join(slidesDir, deck.dir), port);
  try {
    const { slides, errors } = await captureDeck(browser, `http://127.0.0.1:${port}/`);
    const pptx = new PptxGenJS();
    pptx.layout = "LAYOUT_16x9";
    pptx.title = deck.out;
    for (const s of slides) {
      const slide = pptx.addSlide();
      slide.addImage({ data: "image/png;base64," + s.image.toString("base64"), x: 0, y: 0, w: 10, h: 5.625 });
      if (s.notes) slide.addNotes(s.notes);
    }
    await pptx.writeFile({ fileName: path.join(outDir, `${deck.out}.pptx`) });
    console.log(`${deck.out}: ${slides.length} slides${errors.length ? `, page errors: ${errors.join("; ")}` : ""}`);
  } finally {
    vite.kill();
    port++;
  }
}
await browser.close();
