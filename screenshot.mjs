import pkg from '/Users/czw/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
const { chromium } = pkg;

import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath  = path.join(__dirname, 'lingyan_share.html');
const outPath   = path.join(__dirname, '灵山登山路线图.png');

// 用真实 Chrome + GPU 渲染，和用户浏览器一致
const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--window-size=1312,960', '--window-position=3000,0']  // 先放到屏幕外
});

const ctx  = await browser.newContext({ deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.setViewportSize({ width: 1312, height: 870 });

await page.goto('file://' + htmlPath, { waitUntil: 'networkidle', timeout: 30000 });

await page.waitForFunction(() => {
  const tiles = document.querySelectorAll('.leaflet-tile-pane img.leaflet-tile');
  const loaded = [...tiles].filter(t => t.complete && t.naturalWidth > 0);
  return tiles.length > 0 && loaded.length === tiles.length;
}, { timeout: 20000 });

await page.evaluate(() => {
  map.setView([38.0630, 114.2645], 16, { animate: false });
});

await page.waitForTimeout(500);
await page.waitForFunction(() => {
  const tiles = document.querySelectorAll('.leaflet-tile-pane img.leaflet-tile');
  const loaded = [...tiles].filter(t => t.complete && t.naturalWidth > 0);
  return tiles.length > 0 && loaded.length === tiles.length;
}, { timeout: 20000 });
await page.waitForTimeout(1500);

await page.screenshot({
  path: outPath,
  fullPage: false,
  scale: 'device',
  type: 'png',
});

await browser.close();
console.log('saved:', outPath);
