import { chromium } from 'playwright-core';

import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath  = path.join(__dirname, 'lingyan_share.html');
const outPath   = path.join(__dirname, '灵山登山路线图.png');

// 用真实 Chrome + GPU 渲染，和用户浏览器一致
const browser = await chromium.launch({
  headless: false,
  channel: 'chrome',
  args: ['--window-size=1440,1080', '--window-position=3000,0']  // 先放到屏幕外
});

const ctx  = await browser.newContext({ deviceScaleFactor: 2 });
const page = await ctx.newPage();
await page.setViewportSize({ width: 1432, height: 990 });

await page.goto('file://' + htmlPath, { waitUntil: 'networkidle', timeout: 30000 });

await page.waitForFunction(() => {
  const tiles = document.querySelectorAll('.leaflet-tile-pane img.leaflet-tile');
  const loaded = [...tiles].filter(t => t.complete && t.naturalWidth > 0);
  return tiles.length > 0 && loaded.length === tiles.length;
}, { timeout: 20000 });

await page.evaluate(() => {
  // 包含全部 POI + 路线 + 入口
  var bounds = L.latLngBounds([
    [38.0593, 114.2580],
    [38.0670, 114.2730]
  ]);
  map.fitBounds(bounds, { padding: [40, 40], animate: false });
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
