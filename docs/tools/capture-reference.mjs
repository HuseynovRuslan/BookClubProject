// Reference capture: screenshots + computed-style / SEO / a11y evidence.
// Usage: node capture-reference.mjs [baseUrl] [outDir] [path1 path2 ...]
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = process.argv[2] || 'https://okprint.az';
const OUT = process.argv[3] || 'reference-capture';
const PATHS = process.argv.slice(4).length ? process.argv.slice(4) : [
  '/', '/category/vizitka-sifarisi/', '/category/flayer/', '/category/other-products/',
  '/mat-laminasiyali-vizitkart/', '/flayer-sifarisi/', '/buklet-capi/', '/plaket-sifarisi-ve-capi/',
  '/bizimle-elaqe/', '/blog-flayer/', '/tag/banner/', '/?s=vizitka', '/page/2/', '/bu-sehife-yoxdur-404/',
];
const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844, isMobile: true, hasTouch: true },
];
const NAV_TOGGLES = '[aria-label*="menu" i], [aria-controls*="menu" i], .menu-toggle, .navbar-toggler, .hamburger, .mobile-menu-toggle, .menu-bar, .offcanvas-toggle';

const slug = (p) => (p.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home');

// Runs inside the page: collects tokens, layout metrics, SEO and a11y signals.
function extract() {
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const tally = (map, key) => { if (key) map[key] = (map[key] || 0) + 1; };
  const top = (map, n = 15) => Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
  const pick = (s) => ({ fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, textTransform: s.textTransform, color: s.color, backgroundColor: s.backgroundColor, padding: s.padding, margin: s.margin, borderRadius: s.borderRadius, border: s.border, boxShadow: s.boxShadow, transition: s.transition });
  const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };

  const colors = {}, bgs = {}, fonts = {}, sizes = {}, radii = {}, shadows = {};
  const all = [...document.querySelectorAll('body *')].filter(visible);
  for (const el of all) {
    const s = getComputedStyle(el);
    if (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
      tally(colors, s.color); tally(fonts, s.fontFamily.split(',')[0].trim()); tally(sizes, `${s.fontSize}/${s.fontWeight}/${s.lineHeight}`);
    }
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') tally(bgs, s.backgroundColor);
    if (s.borderRadius !== '0px') tally(radii, s.borderRadius);
    if (s.boxShadow !== 'none') tally(shadows, s.boxShadow);
  }

  const selectors = ['body', 'h1', 'h2', 'h3', 'h4', 'p', 'a', 'button', '.btn', 'header', 'nav', 'nav a', 'footer', 'footer a', 'input', '.container', 'main'];
  const elements = {};
  for (const sel of selectors) { const el = [...document.querySelectorAll(sel)].find(visible); if (el) elements[sel] = { ...pick(getComputedStyle(el)), box: box(el), text: el.textContent.trim().slice(0, 60) }; }

  // Repeating card grids: parents with >=3 same-class children that contain an image.
  const grids = [];
  for (const parent of document.querySelectorAll('body *')) {
    const kids = [...parent.children].filter(visible);
    if (kids.length < 3) continue;
    const cls = kids[0].className;
    if (typeof cls !== 'string' || !cls || !kids.every((k) => k.className === cls) || !kids[0].querySelector('img')) continue;
    const ps = getComputedStyle(parent), ks = getComputedStyle(kids[0]), img = kids[0].querySelector('img');
    grids.push({ parent: parent.tagName.toLowerCase() + '.' + String(parent.className).trim().replace(/\s+/g, '.'), childClass: cls, count: kids.length, display: ps.display, gridTemplateColumns: ps.gridTemplateColumns, gap: ps.gap, parentBox: box(parent), firstChild: { ...pick(ks), box: box(kids[0]) }, image: img && { box: box(img), natural: `${img.naturalWidth}x${img.naturalHeight}`, objectFit: getComputedStyle(img).objectFit, src: img.currentSrc || img.src }, sampleText: kids[0].innerText.trim().slice(0, 160) });
    if (grids.length >= 12) break;
  }

  const rootVars = {};
  const breakpoints = new Set(), fontFaces = new Set(), keyframes = new Set(), sheetErrors = [];
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { sheetErrors.push(sheet.href); continue; }
    const walk = (list) => { for (const r of list) {
      if (r.media && r.conditionText) breakpoints.add(r.conditionText);
      if (r.constructor.name === 'CSSFontFaceRule') fontFaces.add(`${r.style.fontFamily} ${r.style.fontWeight} ${r.style.src.slice(0, 120)}`);
      if (r.constructor.name === 'CSSKeyframesRule') keyframes.add(r.name);
      if (r.selectorText === ':root') for (const p of r.style) if (p.startsWith('--')) rootVars[p] = r.style.getPropertyValue(p).trim();
      if (r.cssRules) walk(r.cssRules);
    } };
    walk(rules);
  }

  const meta = (n) => document.querySelector(`meta[name="${n}"], meta[property="${n}"]`)?.content || null;
  const fixed = all.filter((el) => ['fixed', 'sticky'].includes(getComputedStyle(el).position)).map((el) => ({ tag: el.tagName.toLowerCase(), cls: String(el.className), position: getComputedStyle(el).position, box: box(el), text: el.innerText.trim().slice(0, 60) }));
  return {
    url: location.href, scrollHeight: document.documentElement.scrollHeight,
    seo: { title: document.title, description: meta('description'), robots: meta('robots'), canonical: document.querySelector('link[rel=canonical]')?.href || null, lang: document.documentElement.lang, ogTitle: meta('og:title'), ogImage: meta('og:image'), hreflang: [...document.querySelectorAll('link[hreflang]')].map((l) => [l.hreflang, l.href]), jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent.slice(0, 2000)), generator: meta('generator') },
    outline: [...document.querySelectorAll('h1,h2,h3')].map((h) => `${h.tagName} ${h.textContent.trim().slice(0, 90)}`),
    a11y: { imagesWithoutAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length, images: document.images.length, buttonsWithoutName: [...document.querySelectorAll('button, a')].filter((b) => !b.textContent.trim() && !b.getAttribute('aria-label') && !b.querySelector('img[alt]:not([alt=""])')).length, landmarks: ['header', 'nav', 'main', 'footer'].filter((t) => document.querySelector(t)) },
    whatsapp: [...document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]')].map((a) => ({ href: a.href, text: a.innerText.trim(), position: getComputedStyle(a).position, box: box(a) })),
    phones: [...document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]')].map((a) => a.href),
    navLinks: [...document.querySelectorAll('header a, nav a')].map((a) => [a.innerText.trim(), a.getAttribute('href')]).filter(([t]) => t),
    footerLinks: [...document.querySelectorAll('footer a')].map((a) => [a.innerText.trim(), a.getAttribute('href')]),
    paginationLinks: [...document.querySelectorAll('.pagination a, .nav-links a, a.page-numbers')].map((a) => a.getAttribute('href')),
    tokens: { textColors: top(colors), backgrounds: top(bgs), fonts: top(fonts), typeScale: top(sizes, 25), radii: top(radii), shadows: top(shadows, 8), rootVars },
    elements, grids, fixedOrSticky: fixed,
    css: { breakpoints: [...breakpoints], fontFaces: [...fontFaces], keyframes: [...keyframes], unreadableSheets: sheetErrors },
  };
}

// Route through the environment's HTTPS proxy when one is configured (not for local fixtures).
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)/.test(BASE);
const proxy = process.env.HTTPS_PROXY && !isLocal ? { server: process.env.HTTPS_PROXY } : undefined;
const browser = await chromium.launch({ proxy });
await fs.mkdir(OUT, { recursive: true });
const summary = [];
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.isMobile, hasTouch: vp.hasTouch, locale: 'az-AZ' });
  const page = await ctx.newPage();
  for (const p of PATHS) {
    const name = `${slug(p)}__${vp.name}`;
    try {
      const res = await page.goto(new URL(p, BASE).href, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(1500); // let sliders/lazy images settle
      await page.screenshot({ path: path.join(OUT, `${name}__fold.png`) });
      // Scroll through once so lazy-loaded images render in the full-page shot.
      await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(OUT, `${name}__full.png`), fullPage: true });
      const data = await page.evaluate(extract);
      data.status = res && res.status(); data.finalUrl = page.url(); data.viewport = vp.name;
      await fs.writeFile(path.join(OUT, `${name}.json`), JSON.stringify(data, null, 2));
      await fs.writeFile(path.join(OUT, `${name}.html`), await page.content());

      if (p === PATHS[0]) {
        await page.evaluate(() => scrollTo(0, 700)); await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(OUT, `${name}__scrolled-header.png`) });
        await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
        if (vp.width >= 1024) {
          const items = await page.locator('header nav > ul > li, nav .menu > li').all();
          for (const [i, li] of items.slice(0, 12).entries()) {
            if (!(await li.isVisible())) continue;
            await li.hover(); await page.waitForTimeout(500);
            await page.screenshot({ path: path.join(OUT, `${name}__nav-hover-${i}.png`) });
          }
        } else {
          const toggle = page.locator(NAV_TOGGLES).first();
          if (await toggle.count() && await toggle.isVisible()) {
            await toggle.click(); await page.waitForTimeout(700);
            await page.screenshot({ path: path.join(OUT, `${name}__nav-open.png`) });
          }
        }
      }
      summary.push({ page: p, viewport: vp.name, status: data.status, finalUrl: data.finalUrl, title: data.seo.title });
      console.log('ok', name, data.status);
    } catch (e) {
      summary.push({ page: p, viewport: vp.name, error: e.message.split('\n')[0] });
      console.log('fail', name, e.message.split('\n')[0]);
    }
  }
  await ctx.close();
}
await fs.writeFile(path.join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
await browser.close();
